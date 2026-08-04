"use client";

import React from "react";
import { Box, Flex, Text, Heading, Stack, Button, SimpleGrid, Skeleton } from "@chakra-ui/react";
import { StatCard } from "@/components/shared/StatCard";
import { useRouter, useParams } from "next/navigation";
import { useOrgs } from "@/react-query/organizations/actions";
import { Database, HardDrive, Cloud, Image, Folder, Key, Users } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params?.orgId as string | undefined;
  const { data: orgs, isLoading } = useOrgs();

  if (isLoading) {
    return (
      <Stack gap={6}>
        <Stack gap={1}>
          <Skeleton height="32px" width="250px" />
          <Skeleton height="16px" width="350px" />
        </Stack>
        <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap={6}>
          <Skeleton height="120px" />
          <Skeleton height="120px" />
          <Skeleton height="120px" />
          <Skeleton height="120px" />
        </SimpleGrid>
      </Stack>
    );
  }

  const activeOrg = orgs?.find((o: any) => o.id === orgId) || orgs?.[0] || null;

  const connectionCount = activeOrg?.storageConnections?.length || 0;
  const s3Count = activeOrg?.storageConnections?.filter((c: any) => c.providerType === "AWS_S3").length || 0;
  const r2Count = activeOrg?.storageConnections?.filter((c: any) => c.providerType === "CLOUDFLARE_R2").length || 0;
  const cloudinaryCount = activeOrg?.storageConnections?.filter((c: any) => c.providerType === "CLOUDINARY").length || 0;

  return (
    <Stack gap={6}>
      <Flex align="center" justify="space-between">
        <Stack gap={1}>
          <Heading size="lg" fontWeight="bold">Console Dashboard</Heading>
          <Text fontSize="sm" color="fg.muted">
            Workspace: <Text as="span" fontWeight="bold" color="teal.600">{activeOrg?.name || "No active workspace"}</Text>
          </Text>
        </Stack>
      </Flex>

      {!activeOrg ? (
        <Box p={8} bg="bg.panel" borderRadius="lg" borderWidth="1px" textAlign="center">
          <Text color="fg.muted" mb={4}>Please create or select an organization to get started.</Text>
        </Box>
      ) : (
        <Stack gap={6}>
          <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap={5}>
            <StatCard label="Total Connections" value={connectionCount} icon={<Database size={20} style={{ color: "var(--chakra-colors-teal-500)" }} />} />
            <StatCard label="AWS S3 Buckets" value={s3Count} icon={<HardDrive size={20} style={{ color: "var(--chakra-colors-teal-500)" }} />} />
            <StatCard label="Cloudflare R2 Buckets" value={r2Count} icon={<Cloud size={20} style={{ color: "var(--chakra-colors-teal-500)" }} />} />
            <StatCard label="Cloudinary Accounts" value={cloudinaryCount} icon={<Image size={20} style={{ color: "var(--chakra-colors-teal-500)" }} />} />
          </SimpleGrid>

          <Stack gap={4}>
            <Heading size="sm" fontWeight="bold">Console Shortcuts</Heading>
            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={5}>
              <Box bg="bg.panel" p={5} borderRadius="lg" borderWidth="1px" shadow="sm">
                <Flex align="center" gap={2} mb={3}>
                  <Box color="teal.500">
                    <Folder size={18} />
                  </Box>
                  <Heading size="xs" fontWeight="bold">File Explorer</Heading>
                </Flex>
                <Text fontSize="xs" color="fg.muted" mb={4}>
                  Browse cloud folders, pre-sign downloads, and upload files directly to your connected storage endpoints.
                </Text>
                <Button size="sm" colorPalette="teal" variant="surface" onClick={() => router.push(`/dashboard/${activeOrg.id}/explorer`)}>
                  Browse Files
                </Button>
              </Box>

              <Box bg="bg.panel" p={5} borderRadius="lg" borderWidth="1px" shadow="sm">
                <Flex align="center" gap={2} mb={3}>
                  <Box color="teal.500">
                    <Key size={18} />
                  </Box>
                  <Heading size="xs" fontWeight="bold">Cloud Connections</Heading>
                </Flex>
                <Text fontSize="xs" color="fg.muted" mb={4}>
                  Add, update, or revoke access credentials for your S3, R2, and Cloudinary storage providers.
                </Text>
                <Button size="sm" colorPalette="teal" variant="surface" onClick={() => router.push(`/dashboard/${activeOrg.id}/connections`)}>
                  Configure Accounts
                </Button>
              </Box>

              <Box bg="bg.panel" p={5} borderRadius="lg" borderWidth="1px" shadow="sm">
                <Flex align="center" gap={2} mb={3}>
                  <Box color="teal.500">
                    <Users size={18} />
                  </Box>
                  <Heading size="xs" fontWeight="bold">Team Settings</Heading>
                </Flex>
                <Text fontSize="xs" color="fg.muted" mb={4}>
                  Invite teammates to collaborate in your organization, define path restrictions, and assign scopes.
                </Text>
                <Button size="sm" colorPalette="teal" variant="surface" onClick={() => router.push(`/dashboard/${activeOrg.id}/team`)}>
                  Manage Members
                </Button>
              </Box>
            </SimpleGrid>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
