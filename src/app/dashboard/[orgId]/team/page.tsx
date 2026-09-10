import { MemberList } from "@/features/team/MemberList";
import { prisma } from "@/server/db";
import { cookies } from "next/headers";
import { verifySupabaseJWT, extractSupabaseTokenFromCookies } from "@/lib/jwt";

interface TeamPageProps {
  params: Promise<{
    orgId: string;
  }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { orgId } = await params;

  let currentUserId: string | undefined;
  try {
    const cookieStore = await cookies();
    const token = extractSupabaseTokenFromCookies(cookieStore.getAll());
    if (token) {
      const verified = await verifySupabaseJWT(token);
      if (verified) currentUserId = verified.id;
    }
  } catch {}

  const org = await prisma.organization.findFirst({
    where: {
      OR: [{ id: orgId }, { slug: orgId }],
    },
    select: {
      id: true,
      teamAccesses: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              banned: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  const initialMembers = (org?.teamAccesses || []).map((acc) => ({
    userId: acc.userId,
    role: acc.role,
    name: acc.user.name,
    email: acc.user.email,
    globalRole: acc.user.role,
    banned: acc.user.banned,
    joinedAt: acc.createdAt.toISOString(),
  }));

  return (
    <MemberList
      initialMembers={initialMembers}
      orgId={org?.id || orgId}
      currentUserId={currentUserId}
    />
  );
}
