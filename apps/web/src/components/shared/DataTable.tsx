"use client";

import React from "react";
import { Table, Skeleton, Box, Text, Center, Stack } from "@chakra-ui/react";

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
  if (isLoading) {
    return (
      <Stack gap={4} p={5} bg="bg.panel" borderRadius="lg" borderWidth="1px">
        <Skeleton height="32px" width="100%" />
        <Skeleton height="32px" width="100%" />
        <Skeleton height="32px" width="100%" />
        <Skeleton height="32px" width="100%" />
      </Stack>
    );
  }

  return (
    <Box overflowX="auto" borderWidth="1px" borderRadius="lg" bg="bg.panel" p={1}>
      <Table.Root size="md" variant="line" interactive>
        <Table.Header>
          <Table.Row>
            {headers.map((h, i) => (
              <Table.ColumnHeader key={i} fontWeight="bold">
                {h}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={headers.length} textAlign="center" py={6}>
                <Text color="fg.muted">{emptyMessage}</Text>
              </Table.Cell>
            </Table.Row>
          ) : (
            data.map((item, index) => renderRow(item, index))
          )}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
