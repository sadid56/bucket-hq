import { createClient } from "@/lib/supabaseServer";
import { prisma } from "@/server/db";
import { SettingsClient } from "@/features/settings/SettingsClient";

interface SettingsPageProps {
  params: Promise<{
    orgId: string;
  }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const resolvedParams = await params;
  const orgId = resolvedParams.orgId;

  let orgs: any[] = [];
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const teamAccesses = await prisma.teamAccess.findMany({
        where: { userId: user.id },
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

      orgs = teamAccesses.map((ta) => ({
        ...ta.organization,
        userRole: ta.role,
      }));
    }
  } catch (err) {
    console.error("Failed to fetch workspaces in Server Component settings page:", err);
  }

  const matchedOrg = orgs.find((o) => o.id === orgId || o.slug === orgId);
  if (matchedOrg?.slug && orgId !== matchedOrg.slug) {
    const { redirect } = await import("next/navigation");
    redirect(`/dashboard/${matchedOrg.slug}/settings`);
  }

  return <SettingsClient orgs={orgs} orgId={orgId} />;
}
