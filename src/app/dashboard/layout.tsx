import React from "react";
import { DashboardLayoutClient } from "@/components/layout/DashboardLayoutClient";
import { createClient } from "@/lib/supabaseServer";
import { prisma } from "@/server/db";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let initialOrgs: any[] = [];
  let user: any = null;

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser) {
      user = await prisma.user.findUnique({
        where: { id: authUser.id },
      });

      const teamAccesses = await prisma.teamAccess.findMany({
        where: { userId: authUser.id },
        include: {
          organization: {
            include: {
              storageConnections: {
                select: {
                  id: true,
                  label: true,
                  providerType: true,
                  bucketName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      initialOrgs = teamAccesses.map((ta) => ({
        ...ta.organization,
        userRole: ta.role,
      }));
    }
  } catch (err) {
    console.error("DashboardLayout SSR error:", err);
  }

  return (
    <DashboardLayoutClient initialOrgs={initialOrgs} initialUser={user}>
      {children}
    </DashboardLayoutClient>
  );
}
