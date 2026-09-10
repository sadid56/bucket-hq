import { verifySupabaseJWT, extractSupabaseTokenFromCookies, type VerifiedAuthUser } from "@/lib/jwt";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { prisma, type User, type TeamAccess } from "@/server/db";
import { getSupabaseAdmin } from "@/server/lib/supabase";

export type { VerifiedAuthUser };

export interface UserWithTeamAccess extends User {
  teamAccesses: (TeamAccess & {
    organization?: { id: string; slug: string | null; name: string };
  })[];
}

export async function getAuthUserFromRequest(req: Request): Promise<VerifiedAuthUser | null> {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const verified = await verifySupabaseJWT(token);
    if (verified) return verified;

    if (!process.env.SUPABASE_JWT_SECRET) {
      try {
        const supabase = getSupabaseAdmin();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser(token);
        if (!error && user) {
          return {
            id: user.id,
            email: user.email || null,
            role: user.role,
            user_metadata: user.user_metadata || {},
            app_metadata: user.app_metadata || {},
          };
        }
      } catch {}
    }
  }

  const cookieHeader = req.headers.get("cookie") || "";
  if (cookieHeader) {
    const token = extractSupabaseTokenFromCookies(cookieHeader);
    if (token) {
      const verified = await verifySupabaseJWT(token);
      if (verified) return verified;
    }

    try {
      const parsedCookies = parseCookieHeader(cookieHeader);
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        {
          cookies: {
            getAll() {
              return parsedCookies;
            },
            setAll() {},
          },
        },
      );

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        const verified = await verifySupabaseJWT(session.access_token);
        if (verified) return verified;
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (!error && user) {
        return {
          id: user.id,
          email: user.email || null,
          role: user.role,
          user_metadata: user.user_metadata || {},
          app_metadata: user.app_metadata || {},
        };
      }
    } catch {}
  }

  return null;
}

interface CachedUserEntry {
  user: UserWithTeamAccess;
  expiresAt: number;
}

const userCache = new Map<string, CachedUserEntry>();
const USER_CACHE_TTL_MS = 10_000;

export function getCachedUser(userId: string): UserWithTeamAccess | null {
  const entry = userCache.get(userId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    userCache.delete(userId);
    return null;
  }
  return entry.user;
}

export function setCachedUser(userId: string, user: UserWithTeamAccess) {
  if (userCache.size > 1000) {
    const firstKey = userCache.keys().next().value;
    if (firstKey) userCache.delete(firstKey);
  }
  userCache.set(userId, {
    user,
    expiresAt: Date.now() + USER_CACHE_TTL_MS,
  });
}

export function invalidateUserCache(userId?: string) {
  if (userId) {
    userCache.delete(userId);
  } else {
    userCache.clear();
  }
}

export async function getOrSyncUser(authUser: VerifiedAuthUser): Promise<UserWithTeamAccess | null> {
  const cached = getCachedUser(authUser.id);
  if (cached) {
    return cached;
  }

  let dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      teamAccesses: {
        include: {
          organization: {
            select: { id: true, slug: true, name: true },
          },
        },
      },
    },
  });

  if (!dbUser && authUser.email) {
    const invitedUser = await prisma.user.findUnique({
      where: { email: authUser.email },
    });

    if (invitedUser) {
      dbUser = await prisma.user.update({
        where: { email: authUser.email },
        data: { id: authUser.id },
        include: {
          teamAccesses: {
            include: {
              organization: {
                select: { id: true, slug: true, name: true },
              },
            },
          },
        },
      });
    }
  }

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email!,
        name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
      },
      include: {
        teamAccesses: {
          include: {
            organization: {
              select: { id: true, slug: true, name: true },
            },
          },
        },
      },
    });

    try {
      await prisma.$executeRawUnsafe(
        `UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'MEMBER') WHERE id = $1`,
        authUser.id,
      );
    } catch {}
  }

  if (dbUser && dbUser.teamAccesses.length === 0) {
    try {
      const { generateUniqueOrgSlug } = await import("@/server/utils/generateSlug");
      const orgName = `${dbUser.name}'s Workspace`;
      const slug = await generateUniqueOrgSlug(orgName);

      const org = await prisma.organization.create({
        data: {
          name: orgName,
          slug,
        },
      });

      const access = await prisma.teamAccess.create({
        data: {
          userId: dbUser.id,
          organizationId: org.id,
          role: "OWNER",
        },
        include: {
          organization: {
            select: { id: true, slug: true, name: true },
          },
        },
      });

      dbUser.teamAccesses = [access];
    } catch {}
  }

  if (dbUser) {
    setCachedUser(authUser.id, dbUser);
  }

  return dbUser;
}
