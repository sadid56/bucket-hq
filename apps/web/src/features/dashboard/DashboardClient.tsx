"use client";

import React from "react";
import Link from "next/link";
import { Box, Flex, Text, Heading, Stack, Button, SimpleGrid, Skeleton } from "@chakra-ui/react";
import { StatCard } from "@/components/shared/StatCard";
import { useOrgs } from "@/react-query/organizations/actions";
import { Database, HardDrive, Cloud, Image, Folder, Key, Users } from "lucide-react";

interface DashboardClientProps {
  orgId: string;
}

export function DashboardClient({ orgId }: DashboardClientProps) {
  const { data: orgs, isLoading } = useOrgs();

  const activeOrg = orgs?.find((o: any) => o.id === orgId) || orgs?.[0] || null;

  if (isLoading) {
    return (
      <Stack gap={6}>
        <Skeleton height="32px" width="250px" />
        <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap={5}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="90px" borderRadius="lg" />
          ))}
        </SimpleGrid>
      </Stack>
    );
  }

  if (!activeOrg) {
    return (
      <Box p={8} bg="bg.panel" borderRadius="lg" borderWidth="1px" textAlign="center">
        <Text color="fg.muted" mb={4}>Please create or select an organization to get started.</Text>
      </Box>
    );
  }

  const connectionCount = activeOrg?.storageConnections?.length || 0;
  const s3Count = activeOrg?.storageConnections?.filter((c: any) => c.providerType === "AWS_S3").length || 0;
  const r2Count = activeOrg?.storageConnections?.filter((c: any) => c.providerType === "CLOUDFLARE_R2").length || 0;
  const cloudinaryCount = activeOrg?.storageConnections?.filter((c: any) => c.providerType === "CLOUDINARY").length || 0;

  // Stat cards array for map method rendering
  const statCards = [
    {
      label: "Total Connections",
      value: connectionCount,
      icon: <Database size={20} style={{ color: "var(--chakra-colors-teal-500)" }} />,
    },
    {
      label: "AWS S3 Buckets",
      value: s3Count,
      icon: <HardDrive size={20} style={{ color: "var(--chakra-colors-teal-500)" }} />,
    },
    {
      label: "Cloudflare R2 Buckets",
      value: r2Count,
      icon: <Cloud size={20} style={{ color: "var(--chakra-colors-teal-500)" }} />,
    },
    {
      label: "Cloudinary Accounts",
      value: cloudinaryCount,
      icon: <Image size={20} style={{ color: "var(--chakra-colors-teal-500)" }} />,
    },
  ];

  // Shortcut cards array for map method rendering
  const shortcuts = [
    {
      title: "File Explorer",
      icon: <Folder size={18} />,
      description: "Browse cloud folders, pre-sign downloads, and upload files directly to your connected storage endpoints.",
      buttonText: "Browse Files",
      href: `/dashboard/${activeOrg.id}/explorer`,
    },
    {
      title: "Cloud Connections",
      icon: <Key size={18} />,
      description: "Add, update, or revoke access credentials for your S3, R2, and Cloudinary storage providers.",
      buttonText: "Configure Accounts",
      href: `/dashboard/${activeOrg.id}/connections`,
    },
    {
      title: "Team Settings",
      icon: <Users size={18} />,
      description: "Invite teammates to collaborate in your organization, define path restrictions, and assign scopes.",
      buttonText: "Manage Members",
      href: `/dashboard/${activeOrg.id}/team`,
    },
  ];

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

      <Stack gap={6}>
        {/* Stat Cards mapped */}
        <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap={5}>
          {statCards.map((card) => (
            <StatCard
              key={card.label}
              label={card.label}
              value={card.value}
              icon={card.icon}
            />
          ))}
        </SimpleGrid>

        <Stack gap={4}>
          <Heading size="sm" fontWeight="bold">Console Shortcuts</Heading>
          {/* Shortcut Cards mapped */}
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={5}>
            {shortcuts.map((shortcut) => (
              <Box key={shortcut.title} bg="bg.panel" p={5} borderRadius="lg" borderWidth="1px" shadow="sm">
                <Flex align="center" gap={2} mb={3}>
                  <Box color="teal.500">
                    {shortcut.icon}
                  </Box>
                  <Heading size="xs" fontWeight="bold">{shortcut.title}</Heading>
                </Flex>
                <Text fontSize="xs" color="fg.muted" mb={4}>
                  {shortcut.description}
                </Text>
                <Button
                  asChild
                  size="sm"
                  colorPalette="teal"
                  variant="surface"
                >
                  <Link href={shortcut.href}>
                    {shortcut.buttonText}
                  </Link>
                </Button>
              </Box>
            ))}
          </SimpleGrid>
        </Stack>
      </Stack>
    </Stack>
  );
}
