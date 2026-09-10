import React from "react";
import { DashboardLayoutClient } from "@/components/layout/DashboardLayoutClient";
import { createClient } from "@/lib/supabaseServer";
import { cookies } from "next/headers";
import { verifySupabaseJWT, extractSupabaseTokenFromCookies } from "@/lib/jwt";
import { prisma } from "@/server/db";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let initialOrgs: any[] = [];
  let user: any = null;

  try {
    let authUserId: string | null = null;

    const cookieStore = await cookies();
    const token = extractSupabaseTokenFromCookies(cookieStore.getAll());
    if (token) {
      const verified = await verifySupabaseJWT(token);
      if (verified) {
        authUserId = verified.id;
      }
    }

    if (!authUserId) {
      const supabase = await createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) authUserId = authUser.id;
    }

    if (authUserId) {
      const [userRecord, teamAccesses] = await Promise.all([
        prisma.user.findUnique({
          where: { id: authUserId },
        }),
        prisma.teamAccess.findMany({
          where: { userId: authUserId },
          include: {
            organization: {
              include: {
                storageConnections: {
                  select: {
                    id: true,
                    label: true,
                    providerType: true,
                    bucketName: true,
                    projectName: true,
                    environment: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      user = userRecord;
      initialOrgs = teamAccesses.map((ta) => ({
        ...ta.organization,
        userRole: ta.role,
      }));
    }
  } catch {
    // Graceful fallback for unauthenticated or loading state
  }

  return (
    <DashboardLayoutClient initialOrgs={initialOrgs} initialUser={user}>
      {children}
    </DashboardLayoutClient>
  );
}
