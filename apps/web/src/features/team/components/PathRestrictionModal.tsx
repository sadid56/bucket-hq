"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Input, Stack, Text, Heading, Skeleton, Badge, createListCollection } from "@chakra-ui/react";
import { useConnections } from "@/react-query/connections/actions";
import { usePathRestrictions, useAddPathRestriction, useRemovePathRestriction } from "@/react-query/team/actions";
import { DataTable } from "@/components/shared/DataTable";
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValueText } from "@/components/ui/select";

interface Connection {
  id: string;
  label: string;
  providerType: string;
}

interface Restriction {
  id: string;
  storageConnectionId: string;
  pathPrefix: string;
  accessLevel: "READ" | "WRITE" | "READ_WRITE";
}

interface PathRestrictionModalProps {
  isOpen: boolean;
  user: {
    userId: string;
    name: string;
    email: string;
  };
  onClose: () => void;
}

export function PathRestrictionModal({ isOpen, user, onClose }: PathRestrictionModalProps) {
  const { data: connections = [], isLoading: loadingConnections } = useConnections();
  const [activeConnectionId, setActiveConnectionId] = useState("");

  const [newPrefix, setNewPrefix] = useState("");
  const [newAccess, setNewAccess] = useState<"READ" | "WRITE" | "READ_WRITE">("READ");

  const connCollection = React.useMemo(() => {
    return createListCollection({
      items: connections.map((c) => ({
        label: `${c.label} (${c.providerType})`,
        value: c.id,
      })),
    });
  }, [connections]);

  const accessCollection = React.useMemo(() => {
    return createListCollection({
      items: [
        { label: "Read Only", value: "READ" },
        { label: "Write Only", value: "WRITE" },
        { label: "Read & Write", value: "READ_WRITE" },
      ],
    });
  }, []);

  const { data: restrictions = [], isLoading: loading, refetch } = usePathRestrictions({
    userId: user.userId,
    connectionId: activeConnectionId,
  });

  const addRestrictionMutation = useAddPathRestriction(user.userId);
  const removeRestrictionMutation = useRemovePathRestriction();

  const saving = addRestrictionMutation.isPending;

  useEffect(() => {
    if (connections.length > 0 && !activeConnectionId) {
      setActiveConnectionId(connections[0]?.id || "");
    }
  }, [connections, activeConnectionId]);

  const handleAddRestriction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrefix.trim() || !activeConnectionId) return;

    try {
      await addRestrictionMutation.mutateAsync({
        storageConnectionId: activeConnectionId,
        pathPrefix: newPrefix.trim(),
        accessLevel: newAccess,
      });
      setNewPrefix("");
      refetch();
    } catch (err) {
    }
  };

  const handleRemoveRestriction = async (id: string) => {
    try {
      await removeRestrictionMutation.mutateAsync(id);
      refetch();
    } catch (err) {
    }
  };

  const getAccessBadge = (level: string) => {
    switch (level) {
      case "READ":
        return <Badge colorPalette="green">Read</Badge>;
      case "WRITE":
        return <Badge colorPalette="orange">Write</Badge>;
      case "READ_WRITE":
        return <Badge colorPalette="blue">Read & Write</Badge>;
      default:
        return <Badge colorPalette="gray">{level}</Badge>;
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      inset={0}
      bg="rgba(0, 0, 0, 0.4)"
      backdropFilter="blur(4px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1400}
    >
      <Stack
        bg="bg.panel"
        p={6}
        borderRadius="lg"
        borderWidth="1px"
        borderColor="border.subtle"
        shadow="2xl"
        width="95%"
        maxWidth="2xl"
        maxHeight="90vh"
        overflowY="auto"
        gap={5}
      >
        <Flex justify="space-between" align="center" borderBottomWidth="1px" pb={3}>
          <Stack gap={0.5}>
            <Heading size="md" fontWeight="bold">Path-Level Access Rules</Heading>
            <Text fontSize="xs" color="fg.muted">
              Configure folder scopes for {user.name} ({user.email})
            </Text>
          </Stack>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </Flex>

        {loadingConnections ? (
          <Stack gap={3} py={4}>
            <Skeleton height="32px" width="100%" />
            <Skeleton height="32px" width="100%" />
          </Stack>
        ) : connections.length === 0 ? (
          <Text fontSize="sm" color="fg.muted">
            Configure storage connections first before applying permissions.
          </Text>
        ) : (
          <Stack gap={4}>
            {/* Active storage connection selector */}
            <Stack gap={1.5}>
              <Text fontSize="xs" fontWeight="semibold" color="fg.muted">Select Storage Connection</Text>
              <SelectRoot
                collection={connCollection}
                value={[activeConnectionId]}
                onValueChange={(details) => details.value[0] && setActiveConnectionId(details.value[0])}
                size="sm"
              >
                <SelectTrigger>
                  <SelectValueText placeholder="Select Storage Connection" />
                </SelectTrigger>
                <SelectContent style={{ background: "var(--chakra-colors-bg-panel)", zIndex: 1600 }}>
                  {connCollection.items.map((c) => (
                    <SelectItem item={c} key={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </Stack>

            {/* New restriction form */}
            <Box borderWidth="1px" p={4} borderRadius="md" bg="bg.muted">
              <form onSubmit={handleAddRestriction}>
                <Stack gap={3}>
                  <Text fontSize="sm" fontWeight="bold">Create Path Rule</Text>
                  <Flex gap={3} align="flex-end" direction={{ base: "column", sm: "row" }}>
                    <Stack gap={1} flex="2" width="100%">
                      <Text fontSize="xs" fontWeight="semibold" color="fg.muted">Folder Prefix Path</Text>
                      <Input
                        size="sm"
                        placeholder="e.g. clients/acme"
                        value={newPrefix}
                        onChange={(e) => setNewPrefix(e.target.value)}
                        required
                      />
                    </Stack>

                    <Stack gap={1} flex="1" width="100%">
                      <Text fontSize="xs" fontWeight="semibold" color="fg.muted">Access Level</Text>
                      <SelectRoot
                        collection={accessCollection}
                        value={[newAccess]}
                        onValueChange={(details) => details.value[0] && setNewAccess(details.value[0] as any)}
                        size="sm"
                      >
                        <SelectTrigger>
                          <SelectValueText placeholder="Access Level" />
                        </SelectTrigger>
                        <SelectContent style={{ background: "var(--chakra-colors-bg-panel)", zIndex: 1600 }}>
                          {accessCollection.items.map((access) => (
                            <SelectItem item={access} key={access.value}>
                              {access.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>
                    </Stack>

                    <Button size="sm" type="submit" colorPalette="teal" loading={saving} width={{ base: "100%", sm: "auto" }}>
                      Add Rule
                    </Button>
                  </Flex>
                  <Text fontSize="2xs" color="fg.muted">
                    Empty folder prefix grants full bucket access. Trailing slashes are resolved automatically.
                  </Text>
                </Stack>
              </form>
            </Box>

            {/* List existing restrictions */}
            <Stack gap={2}>
              <Text fontSize="sm" fontWeight="bold">Active Rules</Text>
              <DataTable
                headers={["Folder Prefix", "Access Level", "Actions"]}
                data={restrictions}
                isLoading={loading}
                emptyMessage="No path restrictions configured. This user has full bucket access."
                renderRow={(rest: Restriction) => (
                  <tr key={rest.id} style={{ borderBottom: "1px solid var(--chakra-colors-border-subtle)" }}>
                    <td style={{ padding: "8px 12px" }}>
                      <Text fontFamily="mono" fontSize="xs">
                        {rest.pathPrefix || "/ (Root)"}
                      </Text>
                    </td>
                    <td style={{ padding: "8px 12px" }}>{getAccessBadge(rest.accessLevel)}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <Button size="xs" colorPalette="red" variant="ghost" onClick={() => handleRemoveRestriction(rest.id)}>
                        Revoke
                      </Button>
                    </td>
                  </tr>
                )}
              />
            </Stack>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
