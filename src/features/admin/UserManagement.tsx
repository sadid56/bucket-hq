"use client";

import React, { useState } from "react";
import { Box, Button, Flex, Input, Stack, Text, Heading, Badge, createListCollection } from "@chakra-ui/react";
import { DataTable } from "@/components/shared/DataTable";
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValueText } from "@/components/ui/select";
import { useUsers, useUpdateGlobalRole, useToggleBanUser } from "@/react-query/users/actions";

interface Session {
  id: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string | Date;
  deviceInfo?: {
    device: string;
    os?: string;
    browser?: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER" | any;
  banned: boolean;
  banReason?: string | null;
  createdAt: string | Date;
  sessions: Session[];
  organizations: Array<{ id: string; name: string; role: string }>;
}

export function UserManagement() {
  const [search, setSearch] = useState("");
  const [activeSessionUser, setActiveSessionUser] = useState<User | null>(null);
  const [banUser, setBanUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");

  const globalRoleCollection = React.useMemo(() => {
    return createListCollection({
      items: [
        { label: "Member", value: "MEMBER" },
        { label: "Admin", value: "ADMIN" },
      ],
    });
  }, []);

  const { data: users = [], isLoading: loading, refetch } = useUsers({ search });
  const updateRoleMutation = useUpdateGlobalRole();
  const toggleBanMutation = useToggleBanUser();

  const togglingBan = toggleBanMutation.isPending;

  const handleRoleChange = async (userId: string, newRole: "ADMIN" | "MEMBER") => {
    try {
      await updateRoleMutation.mutateAsync({ userId, role: newRole });
      refetch();
    } catch (err) {}
  };

  const handleBanToggle = async () => {
    if (!banUser) return;
    const setBanned = !banUser.banned;
    try {
      await toggleBanMutation.mutateAsync({
        userId: banUser.id,
        banned: setBanned,
        reason: setBanned ? banReason : undefined,
      });
      setBanUser(null);
      setBanReason("");
      refetch();
    } catch (err) {}
  };

  return (
    <Stack gap={6}>
      <Flex align='center' justify='space-between' direction={{ base: "column", sm: "row" }} gap={4}>
        <Stack gap={1}>
          <Heading size='lg' fontWeight='bold'>
            User Account Administration
          </Heading>
          <Text fontSize='sm' color='fg.muted'>
            Audit global logins, ban status, and active sessions
          </Text>
        </Stack>
        <Input
          placeholder='Search by name or email...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxW='300px'
          bg='bg.panel'
        />
      </Flex>

      {/* Users directory */}
      <DataTable
        headers={["Name", "Email", "Global Role", "Sessions", "Status", "Joined", "Actions"]}
        data={users}
        isLoading={loading}
        renderRow={(user: User) => (
          <tr key={user.id} style={{ borderBottom: "1px solid var(--chakra-colors-border-subtle)" }}>
            <td style={{ padding: "12px" }}>
              <Text fontWeight='bold' fontSize='sm'>
                {user.name}
              </Text>
            </td>
            <td style={{ padding: "12px" }}>
              <Text fontSize='sm' color='fg.muted'>
                {user.email}
              </Text>
            </td>
            <td style={{ padding: "12px" }}>
              <Box maxW='150px'>
                <SelectRoot
                  collection={globalRoleCollection}
                  value={[user.role]}
                  onValueChange={(details) => details.value[0] && handleRoleChange(user.id, details.value[0] as any)}
                  size='sm'
                >
                  <SelectTrigger>
                    <SelectValueText placeholder='Select role' />
                  </SelectTrigger>
                  <SelectContent style={{ background: "var(--chakra-colors-bg-panel)", zIndex: 1600 }}>
                    {globalRoleCollection.items.map((role) => (
                      <SelectItem item={role} key={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </Box>
            </td>
            <td style={{ padding: "12px" }}>
              <Button size='xs' variant='ghost' colorPalette='teal' onClick={() => setActiveSessionUser(user)}>
                👁️ {user.sessions.length} Session(s)
              </Button>
            </td>
            <td style={{ padding: "12px" }}>
              {user.banned ? <Badge colorPalette='red'>Banned</Badge> : <Badge colorPalette='green'>Active</Badge>}
            </td>
            <td style={{ padding: "12px" }}>
              <Text fontSize='xs' color='fg.muted'>
                {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </td>
            <td style={{ padding: "12px" }}>
              <Button size='xs' variant='outline' colorPalette={user.banned ? "green" : "red"} onClick={() => setBanUser(user)}>
                {user.banned ? "Unban" : "Ban"}
              </Button>
            </td>
          </tr>
        )}
      />

      {/* active sessions dialog overlay */}
      {activeSessionUser && (
        <Box
          position='fixed'
          inset={0}
          bg='rgba(0, 0, 0, 0.4)'
          backdropFilter='blur(4px)'
          display='flex'
          alignItems='center'
          justifyContent='center'
          zIndex={1400}
        >
          <Stack
            bg='bg.panel'
            p={6}
            borderRadius='lg'
            borderWidth='1px'
            borderColor='border.subtle'
            shadow='2xl'
            width='90%'
            maxWidth='2xl'
            maxH='80vh'
            overflowY='auto'
            gap={4}
          >
            <Flex justify='space-between' align='center' borderBottomWidth='1px' pb={3}>
              <Heading size='md' fontWeight='bold'>
                Active Login Sessions
              </Heading>
              <Button size='sm' variant='ghost' onClick={() => setActiveSessionUser(null)}>
                Close
              </Button>
            </Flex>
            <Text fontSize='sm' fontWeight='bold' color='teal.500'>
              User: {activeSessionUser.name} ({activeSessionUser.email})
            </Text>

            <DataTable
              headers={["IP Address", "Browser", "OS", "Logged In At"]}
              data={activeSessionUser.sessions}
              emptyMessage='No active login sessions found.'
              renderRow={(sess: Session) => (
                <tr key={sess.id} style={{ borderBottom: "1px solid var(--chakra-colors-border-subtle)" }}>
                  <td style={{ padding: "8px 12px" }}>
                    <Text fontSize='xs' fontFamily='mono'>
                      {sess.ipAddress || "-"}
                    </Text>
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <Text fontSize='xs'>{sess.deviceInfo?.browser || "Unknown"}</Text>
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <Text fontSize='xs'>{sess.deviceInfo?.os || "Unknown"}</Text>
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <Text fontSize='2xs' color='fg.muted'>
                      {new Date(sess.createdAt).toLocaleString()}
                    </Text>
                  </td>
                </tr>
              )}
            />
          </Stack>
        </Box>
      )}

      {/* Ban Confirm Dialog with reason input */}
      {banUser && (
        <Box
          position='fixed'
          inset={0}
          bg='rgba(0, 0, 0, 0.4)'
          backdropFilter='blur(4px)'
          display='flex'
          alignItems='center'
          justifyContent='center'
          zIndex={1500}
        >
          <Stack
            bg='bg.panel'
            p={6}
            borderRadius='lg'
            borderWidth='1px'
            borderColor='border.subtle'
            shadow='xl'
            width='90%'
            maxWidth='md'
            gap={4}
          >
            <Text fontSize='lg' fontWeight='bold'>
              {banUser.banned ? "Unban User Account" : "Ban User Account"}
            </Text>
            <Text color='fg.muted'>
              {banUser.banned
                ? `Are you sure you want to lift the ban on ${banUser.name}?`
                : `Specify a reason for banning ${banUser.name}:`}
            </Text>
            {!banUser.banned && (
              <Input placeholder='Reason for suspension...' value={banReason} onChange={(e) => setBanReason(e.target.value)} required />
            )}
            <Stack direction='row' justify='flex-end' gap={3} mt={2}>
              <Button size='sm' variant='outline' onClick={() => setBanUser(null)} disabled={togglingBan}>
                Cancel
              </Button>
              <Button size='sm' colorPalette={banUser.banned ? "green" : "red"} loading={togglingBan} onClick={handleBanToggle}>
                {banUser.banned ? "Unban" : "Ban Account"}
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
