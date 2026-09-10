"use client";

import Link from "next/link";
import { Box, Flex, Text, Heading, Stack, Button, SimpleGrid, Skeleton } from "@chakra-ui/react";
import { StatCard } from "@/components/shared/StatCard";
import { StorageActivityChart } from "./StorageActivityChart";
import { useOrgs } from "@/react-query/organizations/actions";
import { Database, HardDrive, Cloud, Image, Folder, Key, Users } from "lucide-react";

interface DashboardClientProps {
  orgId: string;
  initialOrg?: any;
}

export function DashboardClient({ orgId, initialOrg }: DashboardClientProps) {
  const { data: orgs, isLoading } = useOrgs();

  const activeOrg =
    orgs?.find((o: any) => o.id === orgId || o.slug === orgId) ||
    (initialOrg?.id === orgId || initialOrg?.slug === orgId ? initialOrg : null) ||
    orgs?.[0] ||
    initialOrg ||
    null;

  if (isLoading && !activeOrg) {
    return (
      <Stack gap={6}>
        <Skeleton height='32px' width='250px' />
        <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap={5}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height='120px' borderRadius='xl' />
          ))}
        </SimpleGrid>
        <Skeleton height='320px' borderRadius='xl' />
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={5}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height='160px' borderRadius='xl' />
          ))}
        </SimpleGrid>
      </Stack>
    );
  }

  if (!activeOrg) {
    return (
      <Box p={8} bg='bg.panel' borderRadius='xl' borderWidth='1px' borderColor='border' textAlign='center'>
        <Text color='fg.muted' mb={4}>
          Please create or select an organization to get started.
        </Text>
      </Box>
    );
  }

  const activeSlug = activeOrg.slug || activeOrg.id;
  const connectionCount = activeOrg?.storageConnections?.length || 0;
  const s3Count = activeOrg?.storageConnections?.filter((c: any) => c.providerType === "AWS_S3").length || 0;
  const r2Count = activeOrg?.storageConnections?.filter((c: any) => c.providerType === "CLOUDFLARE_R2").length || 0;
  const cloudinaryCount = activeOrg?.storageConnections?.filter((c: any) => c.providerType === "CLOUDINARY").length || 0;

  // Modern Stat cards configuration
  const statCards = [
    {
      label: "Total Connections",
      value: connectionCount,
      icon: <Database size={20} />,
      accentColor: "teal" as const,
      badge: "All Nodes",
      subtext: "Unified endpoints across cloud providers",
    },
    {
      label: "AWS S3 Buckets",
      value: s3Count,
      icon: <HardDrive size={20} />,
      accentColor: "amber" as const,
      badge: "AWS S3",
      subtext: "Standard, Glacier & Infrequent storage",
    },
    {
      label: "Cloudflare R2 Buckets",
      value: r2Count,
      icon: <Cloud size={20} />,
      accentColor: "sky" as const,
      badge: "Zero Egress",
      subtext: "Fast edge-distributed object storage",
    },
    {
      label: "Cloudinary Accounts",
      value: cloudinaryCount,
      icon: <Image size={20} />,
      accentColor: "purple" as const,
      badge: "Media CDN",
      subtext: "Optimized image & video asset pipelines",
    },
  ];

  // Shortcut cards array with aligned buttons
  const shortcuts = [
    {
      title: "File Explorer",
      icon: <Folder size={18} />,
      description: "Browse cloud folders, pre-sign downloads, and upload files directly to your connected storage endpoints.",
      buttonText: "Browse Files",
      href: `/dashboard/${activeSlug}/explorer`,
    },
    {
      title: "Cloud Connections",
      icon: <Key size={18} />,
      description: "Add, update, or revoke access credentials for your S3, R2, and Cloudinary storage providers.",
      buttonText: "Configure Accounts",
      href: `/dashboard/${activeSlug}/connections`,
    },
    {
      title: "Team Settings",
      icon: <Users size={18} />,
      description: "Invite teammates to collaborate in your organization, define path restrictions, and assign scopes.",
      buttonText: "Manage Members",
      href: `/dashboard/${activeSlug}/team`,
    },
  ];

  return (
    <Stack gap={7}>
      {/* Page Header */}
      <Flex align='center' justify='space-between'>
        <Stack gap={1}>
          <Heading size='lg' fontWeight='bold'>
            Console Dashboard
          </Heading>
        </Stack>
      </Flex>

      {/* Modern Top Stat Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap={5}>
        {statCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            accentColor={card.accentColor}
            badge={card.badge}
            subtext={card.subtext}
          />
        ))}
      </SimpleGrid>

      {/* Storage & Bandwidth Telemetry Area Chart */}
      <StorageActivityChart orgId={activeOrg?.id || orgId} />

      {/* Console Shortcuts with aligned bottom buttons */}
      <Stack gap={4}>
        <Heading size='sm' fontWeight='bold'>
          Console Shortcuts
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={5}>
          {shortcuts.map((shortcut) => (
            <Box
              key={shortcut.title}
              bg='bg.panel'
              p={5}
              borderRadius='xl'
              borderWidth='1px'
              borderColor='border'
              shadow='sm'
              display='flex'
              flexDirection='column'
              h='100%'
            >
              {/* Card content area absorbs variable text heights */}
              <Box flex='1' mb={4}>
                <Flex align='center' gap={2.5} mb={3}>
                  <Box
                    p={2}
                    borderRadius='lg'
                    bg='teal.500/10'
                    color='teal.400'
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                    borderWidth='1px'
                    borderColor='teal.500/20'
                  >
                    {shortcut.icon}
                  </Box>
                  <Heading size='xs' fontWeight='bold'>
                    {shortcut.title}
                  </Heading>
                </Flex>
                <Text fontSize='xs' color='fg.muted' lineHeight='1.6'>
                  {shortcut.description}
                </Text>
              </Box>

              {/* Pinned bottom button - strictly aligned across all cards */}
              <Box mt='auto' pt={2}>
                <Button asChild size='sm' colorPalette='teal' variant='surface' w={{ base: "full", sm: "auto" }}>
                  <Link href={shortcut.href} prefetch={true}>
                    {shortcut.buttonText}
                  </Link>
                </Button>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
