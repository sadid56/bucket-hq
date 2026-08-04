"use client";

import React from "react";
import { Box, Flex, Text, Stack, Heading, SimpleGrid, Skeleton } from "@chakra-ui/react";
import { StatCard } from "@/components/shared/StatCard";
import { useSystemStats } from "@/react-query/audits/actions";

export function AdminOverview() {
  const { data: stats, isLoading: loading } = useSystemStats();

  if (loading) {
    return (
      <Stack gap={6}>
        <Stack gap={1}>
          <Skeleton height="32px" width="250px" />
          <Skeleton height="16px" width="350px" />
        </Stack>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={6}>
          <Skeleton height="120px" />
          <Skeleton height="120px" />
          <Skeleton height="120px" />
          <Skeleton height="120px" />
        </SimpleGrid>
      </Stack>
    );
  }

  return (
    <Stack gap={6}>
      <Stack gap={1}>
        <Heading size="lg" fontWeight="bold">SaaS Admin Overview</Heading>
        <Text fontSize="sm" color="fg.muted">Global system metrics and project telemetry</Text>
      </Stack>

      {/* KPI Cards Grid */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={5}>
        <StatCard label="Total Users" value={stats?.totalUsers || 0} icon="👥" />
        <StatCard label="Total Workspaces" value={stats?.totalOrgs || 0} icon="🏢" />
        <StatCard label="Active Sessions" value={stats?.activeSessions || 0} icon="🟢" />
        <StatCard label="Logged Operations" value={stats?.totalLogs || 0} icon="📊" />
      </SimpleGrid>

      {/* Breakdown and Activity */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
        {/* Storage Providers Breakdown */}
        <Box bg="bg.panel" p={6} borderRadius="lg" borderWidth="1px" shadow="sm">
          <Stack gap={4}>
            <Heading size="sm" fontWeight="bold">Storage Integrations</Heading>
            <Stack gap={3.5}>
              <Flex align="center" justify="space-between" p={2} bg="bg.muted" borderRadius="md">
                <Text fontSize="sm" fontWeight="medium">AWS S3 Connections</Text>
                <Text fontSize="md" fontWeight="bold" color="orange.500">
                  {stats?.providerDistribution?.AWS_S3 || 0}
                </Text>
              </Flex>
              <Flex align="center" justify="space-between" p={2} bg="bg.muted" borderRadius="md">
                <Text fontSize="sm" fontWeight="medium">Cloudflare R2 Connections</Text>
                <Text fontSize="md" fontWeight="bold" color="blue.500">
                  {stats?.providerDistribution?.CLOUDFLARE_R2 || 0}
                </Text>
              </Flex>
              <Flex align="center" justify="space-between" p={2} bg="bg.muted" borderRadius="md">
                <Text fontSize="sm" fontWeight="medium">Cloudinary Connections</Text>
                <Text fontSize="md" fontWeight="bold" color="purple.500">
                  {stats?.providerDistribution?.CLOUDINARY || 0}
                </Text>
              </Flex>
            </Stack>
          </Stack>
        </Box>

        {/* Recent Global Operations */}
        <Box bg="bg.panel" p={6} borderRadius="lg" borderWidth="1px" shadow="sm">
          <Stack gap={4}>
            <Heading size="sm" fontWeight="bold">Recent Global Activity</Heading>
            {stats?.recentActivity.length === 0 ? (
              <Text fontSize="sm" color="fg.muted">No operations logged recently.</Text>
            ) : (
              <Stack gap={3} maxH="300px" overflowY="auto">
                {stats?.recentActivity.map((act: any) => (
                  <Box key={act.id} p={2.5} borderWidth="1px" borderRadius="md" bg="bg.canvas">
                    <Flex justify="space-between" align="baseline">
                      <Text fontSize="xs" fontWeight="bold" color="teal.500">
                        {act.action}
                      </Text>
                      <Text fontSize="2xs" color="fg.muted">
                        {new Date(act.createdAt).toLocaleTimeString()}
                      </Text>
                    </Flex>
                    <Text fontSize="xs" fontWeight="semibold" mt={0.5}>
                      {act.userName} ({act.userEmail})
                    </Text>
                    {act.objectPath && (
                      <Text fontSize="2xs" fontFamily="mono" color="fg.muted" truncate mt={0.5}>
                        Key: {act.objectPath}
                      </Text>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        </Box>
      </SimpleGrid>
    </Stack>
  );
}
