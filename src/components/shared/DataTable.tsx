"use client";

import React from "react";
import { Table, Skeleton, Box, Text, Stack } from "@chakra-ui/react";

interface DataTableProps<T> {
  headers: string[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  headers,
  data,
  renderRow,
  isLoading,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  if (isLoading && (!data || data.length === 0)) {
    return (
      <Stack gap={4} p={5} bg="bg.panel" borderRadius="xl" borderWidth="1px">
        <Skeleton height="32px" width="100%" />
        <Skeleton height="32px" width="100%" />
        <Skeleton height="32px" width="100%" />
        <Skeleton height="32px" width="100%" />
      </Stack>
    );
  }

  // Responsive empty state: Avoid wide table headers causing mobile overflow
  if (!data || data.length === 0) {
    return (
      <Box
        borderWidth="1px"
        borderColor="border"
        borderRadius="xl"
        bg="bg.panel"
        p={8}
        textAlign="center"
        w="100%"
        maxW="100%"
      >
        <Text color="fg.muted" fontSize="sm">
          {emptyMessage}
        </Text>
      </Box>
    );
  }

  return (
    <Box
      overflowX="auto"
      borderWidth="1px"
      borderColor="border"
      borderRadius="xl"
      bg="bg.panel"
      p={1}
      w="100%"
      maxW="100%"
      css={{ WebkitOverflowScrolling: "touch" }}
    >
      <Table.Root size="md" variant="line" interactive minW="650px" style={{ whiteSpace: "nowrap" }}>
        <Table.Header>
          <Table.Row>
            {headers.map((h, i) => (
              <Table.ColumnHeader key={i} fontWeight="bold" whiteSpace="nowrap">
                {h}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map((item, index) => renderRow(item, index))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
