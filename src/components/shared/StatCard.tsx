"use client";

import React from "react";
import { Box, Flex, Text, Stack, Badge } from "@chakra-ui/react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  subtext?: string;
  badge?: string;
  accentColor?: "teal" | "amber" | "sky" | "purple" | "blue" | "emerald" | string;
}

const ACCENT_MAP: Record<
  string,
  {
    border: string;
    iconBg: string;
    iconColor: string;
    palette: string;
  }
> = {
  teal: {
    border: "#14b8a6",
    iconBg: "rgba(20, 184, 166, 0.12)",
    iconColor: "#14b8a6",
    palette: "teal",
  },
  amber: {
    border: "#f59e0b",
    iconBg: "rgba(245, 158, 11, 0.12)",
    iconColor: "#f59e0b",
    palette: "amber",
  },
  sky: {
    border: "#0ea5e9",
    iconBg: "rgba(14, 165, 233, 0.12)",
    iconColor: "#38bdf8",
    palette: "sky",
  },
  purple: {
    border: "#a855f7",
    iconBg: "rgba(168, 85, 247, 0.12)",
    iconColor: "#c084fc",
    palette: "purple",
  },
};

export function StatCard({
  label,
  value,
  icon,
  description,
  subtext,
  badge,
  accentColor = "teal",
}: StatCardProps) {
  const accent = ACCENT_MAP[accentColor] || ACCENT_MAP.teal;
  const helperText = subtext || description;

  return (
    <Box
      borderWidth="1px"
      borderColor="border"
      borderRadius="xl"
      p={5}
      bg="bg.panel"
      shadow="sm"
      position="relative"
      overflow="hidden"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      {/* Top row: Icon and Badge */}
      <Flex align="center" justify="space-between" mb={4}>
        {icon ? (
          <Box
            p={2.5}
            borderRadius="lg"
            bg={accent.iconBg}
            color={accent.iconColor}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderWidth="1px"
            borderColor={`${accent.border}25`}
          >
            {icon}
          </Box>
        ) : (
          <Box />
        )}
        {badge && (
          <Badge
            size="xs"
            variant="subtle"
            colorPalette={accent.palette}
            fontWeight="semibold"
            px={2}
            py={0.5}
            borderRadius="full"
          >
            {badge}
          </Badge>
        )}
      </Flex>

      {/* Metric Value */}
      <Stack gap={1} mb={2}>
        <Text
          fontSize="3xl"
          fontWeight="extrabold"
          letterSpacing="tight"
          color="fg.default"
          lineHeight="1.1"
        >
          {value}
        </Text>
        <Text fontSize="sm" color="fg.muted" fontWeight="medium">
          {label}
        </Text>
      </Stack>

      {/* Subtext / helper */}
      {helperText && (
        <Text fontSize="2xs" color="fg.muted" mt={1} opacity={0.85}>
          {helperText}
        </Text>
      )}
    </Box>
  );
}
