import { DashboardClient } from "@/features/dashboard/DashboardClient";
import { prisma } from "@/server/db";

interface DashboardPageProps {
  params: Promise<{
    orgId: string;
  }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { orgId } = await params;
  const org = await prisma.organization.findFirst({
    where: {
      OR: [{ id: orgId }, { slug: orgId }],
    },
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
  });

  return <DashboardClient orgId={orgId} initialOrg={org} />;
}

