import { FileExplorer } from "@/features/explorer/FileExplorer";
import { prisma } from "@/server/db";

interface ExplorerPageProps {
  params: Promise<{
    orgId: string;
  }>;
}

export default async function ExplorerPage({ params }: ExplorerPageProps) {
  const { orgId } = await params;

  const org = await prisma.organization.findFirst({
    where: {
      OR: [{ id: orgId }, { slug: orgId }],
    },
    select: {
      storageConnections: {
        select: {
          id: true,
          label: true,
          providerType: true,
          bucketName: true,
          region: true,
          projectName: true,
          environment: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return <FileExplorer initialConnections={org?.storageConnections || []} />;
}
