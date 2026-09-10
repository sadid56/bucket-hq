"use client";

import React, { useState, useMemo } from "react";
import { Box, Flex, Text, Button, Stack, Badge, Heading } from "@chakra-ui/react";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useDeleteConnection } from "@/react-query/connections/actions";
import { HardDrive, Cloud, Image, FolderKanban } from "lucide-react";

export interface Connection {
  id: string;
  label: string;
  providerType: "AWS_S3" | "CLOUDFLARE_R2" | "CLOUDINARY" | any;
  bucketName?: string | null;
  region?: string | null;
  projectName?: string | null;
  environment?: "PRODUCTION" | "STAGING" | "DEVELOPMENT" | null;
  createdAt: string | Date;
}

interface ConnectionListProps {
  connections: Connection[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export function ConnectionList({ connections, isLoading, onRefresh }: ConnectionListProps) {
  const [deleteConn, setDeleteConn] = useState<Connection | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("ALL");
  const deleteConnMutation = useDeleteConnection();
  const revoking = deleteConnMutation.isPending;

  const projects = useMemo(() => {
    const list: string[] = [];
    connections.forEach((c) => {
      const p = c.projectName?.trim() || "General";
      if (!list.includes(p)) list.push(p);
    });
    return list;
  }, [connections]);

  const filteredConnections = useMemo(() => {
    if (selectedProject === "ALL") return connections;
    return connections.filter((c) => (c.projectName?.trim() || "General") === selectedProject);
  }, [connections, selectedProject]);

  const handleRevoke = async () => {
    if (!deleteConn) return;
    try {
      await deleteConnMutation.mutateAsync(deleteConn.id);
      setDeleteConn(null);
      onRefresh?.();
    } catch (err) {}
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

  const getEnvironmentBadge = (env?: string | null) => {
    switch (env) {
      case "PRODUCTION":
        return <Badge colorPalette="red" variant="surface" size="xs">PROD</Badge>;
      case "STAGING":
        return <Badge colorPalette="blue" variant="surface" size="xs">STAGING</Badge>;
      case "DEVELOPMENT":
        return <Badge colorPalette="teal" variant="surface" size="xs">DEV</Badge>;
      default:
        return <Badge colorPalette="gray" variant="surface" size="xs">PROD</Badge>;
    }
  };

  return (
    <Stack gap={4}>
      <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
        <Heading size="md" fontWeight="bold">Active Connections</Heading>

        {projects.length > 1 && (
          <Flex gap={1.5} align="center" wrap="wrap">
            <Text fontSize="xs" fontWeight="semibold" color="fg.muted" mr={1}>
              Project:
            </Text>
            <Button
              size="xs"
              variant={selectedProject === "ALL" ? "solid" : "outline"}
              colorPalette={selectedProject === "ALL" ? "teal" : "gray"}
              onClick={() => setSelectedProject("ALL")}
            >
              All ({connections.length})
            </Button>
            {projects.map((p) => {
              const count = connections.filter((c) => (c.projectName?.trim() || "General") === p).length;
              return (
                <Button
                  key={p}
                  size="xs"
                  variant={selectedProject === p ? "solid" : "outline"}
                  colorPalette={selectedProject === p ? "teal" : "gray"}
                  onClick={() => setSelectedProject(p)}
                  gap={1}
                >
                  <FolderKanban size={12} />
                  <span>{p}</span>
                  <Badge size="xs" variant="plain" ml={0.5}>{count}</Badge>
                </Button>
              );
            })}
          </Flex>
        )}
      </Flex>
      
      {/* Empty State when no connections match */}
      {filteredConnections.length === 0 ? (
        <DataTable
          headers={[]}
          data={[]}
          isLoading={isLoading}
          emptyMessage="No storage connections found. Add your first connection above."
          renderRow={() => null}
        />
      ) : (
        <>
          {/* Mobile View: Touch-friendly cards */}
          <Stack gap={3} display={{ base: "flex", md: "none" }}>
            {filteredConnections.map((conn) => (
              <Box
                key={conn.id}
                bg="bg.panel"
                p={4}
                borderRadius="xl"
                borderWidth="1px"
                borderColor="border"
                shadow="sm"
              >
                <Flex align="center" justify="space-between" mb={2.5}>
                  <Text fontWeight="bold" fontSize="sm">
                    {conn.label}
                  </Text>
                  <Flex align="center" gap={1.5}>
                    {getEnvironmentBadge(conn.environment)}
                    {getProviderBadge(conn.providerType)}
                  </Flex>
                </Flex>

                <Stack gap={1.5} fontSize="xs" color="fg.muted" mb={3}>
                  <Flex justify="space-between">
                    <Text>Project:</Text>
                    <Badge colorPalette="gray" variant="outline" size="xs">
                      {conn.projectName || "General"}
                    </Badge>
                  </Flex>
                  <Flex justify="space-between">
                    <Text>Bucket / Asset:</Text>
                    <Text color="fg.default" fontWeight="medium">
                      {conn.providerType === "CLOUDINARY" ? "Cloudinary Assets Folder" : conn.bucketName || "-"}
                    </Text>
                  </Flex>
                  {conn.region && (
                    <Flex justify="space-between">
                      <Text>Region:</Text>
                      <Text color="fg.default">{conn.region}</Text>
                    </Flex>
                  )}
                  <Flex justify="space-between">
                    <Text>Created:</Text>
                    <Text>{new Date(conn.createdAt).toLocaleDateString()}</Text>
                  </Flex>
                </Stack>

                <Button
                  size="xs"
                  colorPalette="red"
                  variant="outline"
                  w="full"
                  onClick={() => setDeleteConn(conn)}
                >
                  Revoke Connection
                </Button>
              </Box>
            ))}
          </Stack>

          {/* Desktop View: Full data table */}
          <Box display={{ base: "none", md: "block" }}>
            <DataTable
              headers={["Label", "Project", "Env", "Provider", "Bucket / Details", "Region", "Created At", "Actions"]}
              data={filteredConnections}
              isLoading={isLoading}
              emptyMessage="No storage connections found. Add your first connection above."
              renderRow={(conn: Connection) => (
                <tr key={conn.id} style={{ borderBottom: "1px solid var(--chakra-colors-border-subtle)" }}>
                  <td style={{ padding: "12px" }}>
                    <Text fontWeight="semibold" fontSize="sm">{conn.label}</Text>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <Badge colorPalette="gray" variant="outline" size="xs">
                      {conn.projectName || "General"}
                    </Badge>
                  </td>
                  <td style={{ padding: "12px" }}>
                    {getEnvironmentBadge(conn.environment)}
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
          </Box>
        </>
      )}

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
