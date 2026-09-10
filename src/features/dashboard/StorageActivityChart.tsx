"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Box, Flex, Heading, Text, Stack } from "@chakra-ui/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useAudits } from "@/react-query/audits/actions";

interface StorageActivityChartProps {
  orgId: string;
}

export function StorageActivityChart({ orgId }: StorageActivityChartProps) {
  const [mounted, setMounted] = useState(false);
  const [range, setRange] = useState<"7D" | "30D" | "90D">("30D");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch real audit logs for this workspace
  const { data: auditLogs, isLoading } = useAudits({ orgId });

  // Process real logs into daily activity points
  const chartData = useMemo(() => {
    const days = range === "7D" ? 7 : range === "30D" ? 30 : 90;
    const now = new Date();
    const map = new Map<string, { downloads: number; uploads: number; deletes: number; total: number }>();

    // Initialize all days in the range to 0
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, { downloads: 0, uploads: 0, deletes: 0, total: 0 });
    }

    // Populate real counts from auditLogs
    if (auditLogs && Array.isArray(auditLogs)) {
      auditLogs.forEach((log: any) => {
        const dateKey = new Date(log.createdAt).toISOString().slice(0, 10);
        if (map.has(dateKey)) {
          const entry = map.get(dateKey)!;
          entry.total += 1;
          if (log.action === "SIGN_DOWNLOAD") entry.downloads += 1;
          else if (log.action === "SIGN_UPLOAD") entry.uploads += 1;
          else if (log.action === "DELETE_OBJECT") entry.deletes += 1;
        }
      });
    }

    // Convert map to ordered data points with clean date labels
    const points: Array<{
      dateKey: string;
      dateLabel: string;
      operations: number;
      downloads: number;
      uploads: number;
      deletes: number;
    }> = [];

    map.forEach((val, dateKey) => {
      const parts = dateKey.split("-");
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const dateLabel = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      points.push({
        dateKey,
        dateLabel,
        operations: val.total,
        downloads: val.downloads,
        uploads: val.uploads,
        deletes: val.deletes,
      });
    });

    return points;
  }, [auditLogs, range]);

  const totalOperations = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.operations, 0);
  }, [chartData]);

  // Clean, evenly spaced interval for XAxis ticks to prevent any label bunching
  const tickInterval = useMemo(() => {
    if (range === "7D") return 0;
    if (range === "30D") return 4;
    return 14;
  }, [range]);

  return (
    <Box
      bg="bg.panel"
      p={4}
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border"
      shadow="sm"
    >
      {/* Clean, minimalist header with small typography */}
      <Flex align="center" justify="space-between" mb={3}>
        <Stack gap={0.5}>
          <Heading size="xs" fontWeight="semibold" fontSize="xs">
            Storage Activity
          </Heading>
          <Text fontSize="11px" color="fg.muted">
            {totalOperations} real operations in the last {range === "7D" ? "7 days" : range === "30D" ? "30 days" : "90 days"}
          </Text>
        </Stack>

        {/* Minimalist 7D / 30D / 90D range toggle with small text */}
        <Flex
          align="center"
          p={0.5}
          bg="bg.muted"
          borderRadius="md"
          borderWidth="1px"
          borderColor="border"
          gap={0.5}
        >
          {(["7D", "30D", "90D"] as const).map((opt) => (
            <Box
              key={opt}
              as="button"
              px={2}
              py={0.5}
              borderRadius="sm"
              fontSize="10px"
              fontWeight="medium"
              transition="all 0.15s ease"
              bg={range === opt ? "bg.panel" : "transparent"}
              color={range === opt ? "fg.default" : "fg.muted"}
              shadow={range === opt ? "xs" : "none"}
              _hover={{
                color: "fg.default",
              }}
              onClick={() => setRange(opt)}
            >
              {opt}
            </Box>
          ))}
        </Flex>
      </Flex>

      {/* Clean Single Area Chart with small axis text and uniform spacing */}
      <Box h="170px" w="100%">
        {!mounted || isLoading ? (
          <Flex h="100%" align="center" justify="center">
            <Text fontSize="10px" color="fg.muted">
              Loading activity...
            </Text>
          </Flex>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2231" vertical={false} />
              <XAxis
                dataKey="dateLabel"
                tickLine={false}
                axisLine={false}
                interval={tickInterval}
                minTickGap={24}
                tick={({ x, y, payload }) => (
                  <text
                    x={x}
                    y={y}
                    dy={12}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="10px"
                    style={{ fontSize: "10px", fill: "#64748b" }}
                  >
                    {payload.value}
                  </text>
                )}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                domain={[0, "auto"]}
                tick={({ x, y, payload }) => (
                  <text
                    x={x}
                    y={y}
                    dx={-6}
                    dy={4}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="10px"
                    style={{ fontSize: "10px", fill: "#64748b" }}
                  >
                    {payload.value}
                  </text>
                )}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <Box
                        bg="#12141d"
                        px={2.5}
                        py={2}
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="#1f2231"
                        shadow="lg"
                        fontSize="11px"
                      >
                        <Text color="fg.muted" fontSize="10px" mb={1}>
                          {item.dateLabel}
                        </Text>
                        <Flex align="center" gap={1.5} mb={item.operations > 0 ? 1 : 0}>
                          <Box w="5px" h="5px" borderRadius="full" bg="#14b8a6" />
                          <Text fontWeight="semibold" color="fg.default">
                            {item.operations} operations
                          </Text>
                        </Flex>
                        {item.operations > 0 && (
                          <Stack gap={0.5} fontSize="10px" color="fg.muted">
                            {item.downloads > 0 && <Text>Downloads: {item.downloads}</Text>}
                            {item.uploads > 0 && <Text>Uploads: {item.uploads}</Text>}
                            {item.deletes > 0 && <Text>Deletes: {item.deletes}</Text>}
                          </Stack>
                        )}
                      </Box>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="operations"
                stroke="#14b8a6"
                strokeWidth={1.8}
                fillOpacity={1}
                fill="url(#activityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Box>
  );
}
