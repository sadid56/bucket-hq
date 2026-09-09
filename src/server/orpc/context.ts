import { prisma } from "@/server/db";
import { getSupabaseAdmin } from "@/server/lib/supabase";
import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import type { User, TeamAccess } from "@/server/db";

export interface UserWithTeamAccess extends User {
  teamAccesses: (TeamAccess & {
    organization?: { id: string; slug: string | null; name: string };
  })[];
}

export interface ORPCContext {
  req: Request;
  user: UserWithTeamAccess | null;
  orgId: string | null;
}

export async function createORPCContext(req: Request): Promise<ORPCContext> {
  const authHeader = req.headers.get("authorization");
  const orgHeader = req.headers.get("x-organization-id");

  let token: string | null = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  let user: UserWithTeamAccess | null = null;
  let supabaseUser: any = null;

  // 1. Try Bearer token
  if (token) {
    try {
      const supabase = getSupabaseAdmin();
      const {
        data: { user: foundUser },
        error,
      } = await supabase.auth.getUser(token);

      if (!error && foundUser) {
        supabaseUser = foundUser;
      }
    } catch (err) {
      console.error("Error verifying authentication token:", err);
    }
  }

  // 2. Try raw cookies from incoming request headers
  if (!supabaseUser) {
    try {
      const cookieHeader = req.headers.get("cookie") || "";
      if (cookieHeader) {
        const parsedCookies = parseCookieHeader(cookieHeader);
        const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "", {
          cookies: {
            getAll() {
              return parsedCookies;
            },
          },
        });
        const {
          data: { user: cookieUser },
          error,
        } = await supabase.auth.getUser();

        if (!error && cookieUser) {
          supabaseUser = cookieUser;
        }
      }
    } catch (err) {
      console.error("Error verifying request cookies in oRPC:", err);
    }
  }

  // 3. Fallback to Next.js cookies()
  if (!supabaseUser) {
    try {
      const { createClient } = await import("@/lib/supabaseServer");
      const supabaseServer = await createClient();
      const {
        data: { user: cookieUser },
        error,
      } = await supabaseServer.auth.getUser();

      if (!error && cookieUser) {
        supabaseUser = cookieUser;
      }
    } catch {
      // Cookies not present or expired
    }
  }

  if (supabaseUser) {
    try {
      let dbUser = await prisma.user.findUnique({
        where: { id: supabaseUser.id },
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

      if (!dbUser && supabaseUser.email) {
        const invitedUser = await prisma.user.findUnique({
          where: { email: supabaseUser.email },
        });

        if (invitedUser) {
          dbUser = await prisma.user.update({
            where: { email: supabaseUser.email },
            data: { id: supabaseUser.id },
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
            id: supabaseUser.id,
            email: supabaseUser.email!,
            name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split("@")[0] || "User",
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
            supabaseUser.id,
          );
        } catch (err) {
          console.error("Failed to sync role to Supabase metadata:", err);
        }
      }

      user = dbUser;
    } catch (err) {
      console.error("Error syncing user in oRPC context:", err);
    }
  }

  return {
    req,
    user,
    orgId: orgHeader || null,
  };
}
