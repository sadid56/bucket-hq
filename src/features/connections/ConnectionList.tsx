"use client";

import React, { useState } from "react";
import { Box, Flex, Text, Button, Stack, Badge, Heading } from "@chakra-ui/react";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useDeleteConnection } from "@/react-query/connections/actions";
import { HardDrive, Cloud, Image } from "lucide-react";

export interface Connection {
  id: string;
  label: string;
  providerType: "AWS_S3" | "CLOUDFLARE_R2" | "CLOUDINARY" | any;
  bucketName?: string | null;
  region?: string | null;
  createdAt: string | Date;
}

interface ConnectionListProps {
  connections: Connection[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export function ConnectionList({ connections, isLoading, onRefresh }: ConnectionListProps) {
  const [deleteConn, setDeleteConn] = useState<Connection | null>(null);
  const deleteConnMutation = useDeleteConnection();
  const revoking = deleteConnMutation.isPending;

  const handleRevoke = async () => {
    if (!deleteConn) return;
    try {
      await deleteConnMutation.mutateAsync(deleteConn.id);
      setDeleteConn(null);
      onRefresh?.();
    } catch (err) {
    }
  };

  const getProviderBadge = (type: string) => {
    switch (type) {
      case "AWS_S3":
        return (
          <Flex align="center" gap={1.5}>
            <HardDrive size={14} style={{ color: "var(--chakra-colors-orange-500)" }} />
            <Badge colorPalette="orange" variant="subtle">AWS S3</Badge>
          </Flex>
        );
      case "CLOUDFLARE_R2":
        return (
          <Flex align="center" gap={1.5}>
            <Cloud size={14} style={{ color: "var(--chakra-colors-blue-500)" }} />
            <Badge colorPalette="blue" variant="subtle">Cloudflare R2</Badge>
          </Flex>
        );
      case "CLOUDINARY":
        return (
          <Flex align="center" gap={1.5}>
            <Image size={14} style={{ color: "var(--chakra-colors-purple-500)" }} />
            <Badge colorPalette="purple" variant="subtle">Cloudinary</Badge>
          </Flex>
        );
      default:
        return <Badge colorPalette="gray">{type}</Badge>;
    }
  };

  return (
    <Stack gap={4}>
      <Heading size="md" fontWeight="bold">Active Connections</Heading>
      
      <DataTable
        headers={["Label", "Provider", "Bucket / Details", "Region", "Created At", "Actions"]}
        data={connections}
        isLoading={isLoading}
        emptyMessage="No storage connections found. Add your first connection above."
        renderRow={(conn: Connection) => (
          <tr key={conn.id} style={{ borderBottom: "1px solid var(--chakra-colors-border-subtle)" }}>
            <td style={{ padding: "12px" }}>
              <Text fontWeight="semibold" fontSize="sm">{conn.label}</Text>
            </td>
            <td style={{ padding: "12px" }}>
              {getProviderBadge(conn.providerType)}
            </td>
            <td style={{ padding: "12px" }}>
              <Text fontSize="sm" color="fg.muted">
                {conn.providerType === "CLOUDINARY" ? "Cloudinary Assets Folder" : conn.bucketName || "-"}
              </Text>
            </td>
            <td style={{ padding: "12px" }}>
              <Text fontSize="sm" color="fg.muted">{conn.region || "-"}</Text>
            </td>
            <td style={{ padding: "12px" }}>
              <Text fontSize="xs" color="fg.muted">{new Date(conn.createdAt).toLocaleDateString()}</Text>
            </td>
            <td style={{ padding: "12px" }}>
              <Button size="xs" colorPalette="red" variant="outline" onClick={() => setDeleteConn(conn)}>
                Revoke
              </Button>
            </td>
          </tr>
        )}
      />

      <ConfirmDialog
        isOpen={deleteConn !== null}
        title="Revoke Storage Connection"
        message={`Are you sure you want to revoke "${deleteConn?.label}"? All folder paths, permissions, and URLs linked to this connection will be immediately disabled.`}
        confirmLabel="Revoke Access"
        isLoading={revoking}
        onConfirm={handleRevoke}
        onCancel={() => setDeleteConn(null)}
      />
    </Stack>
  );
}
