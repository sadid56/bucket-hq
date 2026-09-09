"use client";

import React from "react";
import { Box, Flex, Text, Stack } from "@chakra-ui/react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
}

export function StatCard({ label, value, icon, description }: StatCardProps) {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={5}
      bg="bg.panel"
      shadow="sm"
      flex="1"
      minW="200px"
    >
      <Flex align="center" justify="space-between">
        <Stack gap={1}>
          <Text fontSize="sm" color="fg.muted" fontWeight="medium">
            {label}
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {value}
          </Text>
        </Stack>
        {icon && (
          <Box p={3} bg="bg.muted" borderRadius="md">
            {icon}
          </Box>
        )}
      </Flex>
      {description && (
        <Text fontSize="xs" color="fg.muted" mt={2}>
          {description}
        </Text>
      )}
    </Box>
  );
}
