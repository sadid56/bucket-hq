import React from "react";
import { ConnectionsClient } from "@/features/connections/ConnectionsClient";
import { prisma } from "@/server/db";

interface ConnectionsPageProps {
  params: Promise<{
    orgId: string;
  }>;
}

export default async function ConnectionsPage({ params }: ConnectionsPageProps) {
  const { orgId } = await params;

  const org = await prisma.organization.findFirst({
    where: {
      OR: [{ id: orgId }, { slug: orgId }],
    },
    select: {
      id: true,
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

  return (
    <ConnectionsClient
      initialConnections={org?.storageConnections || []}
      orgId={org?.id || orgId}
    />
  );
}
