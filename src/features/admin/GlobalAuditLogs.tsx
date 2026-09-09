"use client";

import React, { useState } from "react";
import { Box, Button, Flex, Input, Stack, Text, Heading, Badge, createListCollection } from "@chakra-ui/react";
import { DataTable } from "@/components/shared/DataTable";
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValueText } from "@/components/ui/select";
import { useAudits } from "@/react-query/audits/actions";

interface AuditLog {
  id: string;
  action: string;
  ipAddress?: string | null;
  objectPath?: string | null;
  details?: string | null;
  createdAt: string | Date;
  user: {
    name: string;
    email: string;
  };
  storageConnection?: {
    label: string;
    providerType: string;
  } | null;
}

export function GlobalAuditLogs() {
  const [action, setAction] = useState("");
  const [userId, setUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const actionCollection = React.useMemo(() => {
    return createListCollection({
      items: [
        { label: "All Actions", value: "ALL" },
        { label: "Upload Pre-signs", value: "SIGN_UPLOAD" },
        { label: "Download Pre-signs", value: "SIGN_DOWNLOAD" },
        { label: "Delete Objects", value: "DELETE_OBJECT" },
        { label: "Create Connection", value: "CREATE_CONNECTION" },
        { label: "Revoke Connection", value: "REVOKE_CONNECTION" },
      ],
    });
  }, []);

  const {
    data: logs = [],
    isLoading: loading,
    refetch,
  } = useAudits({
    action,
    userId,
    startDate,
    endDate,
  });

  const getActionBadgeColor = (act: string) => {
    if (act.startsWith("SIGN_")) return "teal";
    if (act.includes("DELETE")) return "red";
    if (act.includes("CONNECTION")) return "orange";
    return "gray";
  };

  return (
    <Stack gap={6}>
      <Stack gap={1}>
        <Heading size='lg' fontWeight='bold'>
          SaaS Immutable Audit Trails
        </Heading>
        <Text fontSize='sm' color='fg.muted'>
          Verify all pre-sign request payloads and storage updates
        </Text>
      </Stack>

      {/* Filter toolbar */}
      <Box bg='bg.panel' p={4} borderRadius='lg' borderWidth='1px' shadow='sm'>
        <Flex gap={4} wrap='wrap' align='flex-end'>
          <Stack gap={1} minW='160px' flex='1'>
            <Text fontSize='xs' fontWeight='semibold' color='fg.muted'>
              Action Filter
            </Text>
            <SelectRoot
              collection={actionCollection}
              value={[action || "ALL"]}
              onValueChange={(details) => setAction(details.value[0] === "ALL" || !details.value[0] ? "" : details.value[0])}
              size='sm'
            >
              <SelectTrigger>
                <SelectValueText placeholder='Select action' />
              </SelectTrigger>
              <SelectContent style={{ background: "var(--chakra-colors-bg-panel)", zIndex: 1600 }}>
                {actionCollection.items.map((act) => (
                  <SelectItem item={act} key={act.value}>
                    {act.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Stack>

          <Stack gap={1} minW='160px' flex='1'>
            <Text fontSize='xs' fontWeight='semibold' color='fg.muted'>
              Start Date
            </Text>
            <Input type='date' size='sm' height='36px' value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Stack>

          <Stack gap={1} minW='160px' flex='1'>
            <Text fontSize='xs' fontWeight='semibold' color='fg.muted'>
              End Date
            </Text>
            <Input type='date' size='sm' height='36px' value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </Stack>

          <Button size='sm' colorPalette='teal' height='36px' onClick={() => refetch()}>
            Reload Logs
          </Button>
        </Flex>
      </Box>

      {/* Audit Log Table */}
      <DataTable
        headers={["User", "IP Address", "Action", "Object Path", "Connection", "Timestamp"]}
        data={logs}
        isLoading={loading}
        emptyMessage='No audit logs match the filter criteria.'
        renderRow={(log: AuditLog) => (
          <tr key={log.id} style={{ borderBottom: "1px solid var(--chakra-colors-border-subtle)" }}>
            <td style={{ padding: "10px 12px" }}>
              <Text fontWeight='semibold' fontSize='sm'>
                {log.user.name}
              </Text>
              <Text fontSize='2xs' color='fg.muted'>
                {log.user.email}
              </Text>
            </td>
            <td style={{ padding: "10px 12px" }}>
              <Text fontSize='xs' fontFamily='mono'>
                {log.ipAddress || "-"}
              </Text>
            </td>
            <td style={{ padding: "10px 12px" }}>
              <Badge colorPalette={getActionBadgeColor(log.action)}>{log.action}</Badge>
            </td>
            <td style={{ padding: "10px 12px" }}>
              <Text fontSize='xs' fontFamily='mono' maxW='240px' truncate title={log.objectPath ?? undefined}>
                {log.objectPath || "-"}
              </Text>
            </td>
            <td style={{ padding: "10px 12px" }}>
              <Text fontSize='xs' fontWeight='medium'>
                {log.storageConnection?.label || "Revoked Account"}
              </Text>
              {log.storageConnection && (
                <Text fontSize='2xs' color='fg.muted'>
                  {log.storageConnection.providerType}
                </Text>
              )}
            </td>
            <td style={{ padding: "10px 12px" }}>
              <Text fontSize='2xs' color='fg.muted'>
                {new Date(log.createdAt).toLocaleString()}
              </Text>
            </td>
          </tr>
        )}
      />
    </Stack>
  );
}
