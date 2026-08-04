"use client";

import React, { useState } from "react";
import { Box, Button, Flex, Input, Stack, Text, Heading, Badge, createListCollection } from "@chakra-ui/react";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValueText } from "@/components/ui/select";
import { PathRestrictionModal } from "./PathRestrictionModal";
import { useMembers, useInviteMember, useUpdateMemberRole, useRemoveMember } from "@/react-query/team/actions";

interface Member {
  userId: string;
  name: string;
  email: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  globalRole: "ADMIN" | "MEMBER";
  banned: boolean;
  joinedAt: string;
}

export function MemberList() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"OWNER" | "EDITOR" | "VIEWER">("VIEWER");
  const [activeRestrictionUser, setActiveRestrictionUser] = useState<Member | null>(null);
  const [deleteMember, setDeleteMember] = useState<Member | null>(null);

  const roleCollection = React.useMemo(() => {
    return createListCollection({
      items: [
        { label: "Viewer (Read Only)", value: "VIEWER" },
        { label: "Editor (Write Assets)", value: "EDITOR" },
        { label: "Owner (Full Admin)", value: "OWNER" },
      ],
    });
  }, []);

  const { data: members = [], isLoading: loading } = useMembers();
  const inviteMutation = useInviteMember();
  const updateRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveMember();

  const inviting = inviteMutation.isPending;
  const removing = removeMemberMutation.isPending;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      await inviteMutation.mutateAsync({
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setInviteEmail("");
    } catch (err) {
    }
  };

  const handleUpdateRole = async (userId: string, newRole: "OWNER" | "EDITOR" | "VIEWER") => {
    try {
      await updateRoleMutation.mutateAsync({ userId, role: newRole });
    } catch (err) {
    }
  };

  const handleRemoveMember = async () => {
    if (!deleteMember) return;
    try {
      await removeMemberMutation.mutateAsync(deleteMember.userId);
      setDeleteMember(null);
    } catch (err) {
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Badge colorPalette="red">Owner</Badge>;
      case "EDITOR":
        return <Badge colorPalette="teal">Editor</Badge>;
      case "VIEWER":
        return <Badge colorPalette="gray">Viewer</Badge>;
      default:
        return <Badge colorPalette="gray">{role}</Badge>;
    }
  };

  return (
    <Stack gap={6}>
      {/* Invite Toolbar */}
      <Box bg="bg.panel" p={6} borderRadius="lg" borderWidth="1px" shadow="sm">
        <Stack gap={4}>
          <Heading size="md" fontWeight="bold">Invite Team Member</Heading>
          <form onSubmit={handleInvite}>
            <Flex gap={3} align="flex-end" direction={{ base: "column", sm: "row" }}>
              <Stack gap={1.5} flex="2" width="100%">
                <Text fontSize="xs" fontWeight="semibold" color="fg.muted">Email Address</Text>
                <Input
                  type="email"
                  placeholder="collaborator@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </Stack>

              <Stack gap={1.5} flex="1" width="100%">
                <Text fontSize="xs" fontWeight="semibold" color="fg.muted">Role</Text>
                <SelectRoot
                  collection={roleCollection}
                  value={[inviteRole]}
                  onValueChange={(details) => details.value[0] && setInviteRole(details.value[0] as any)}
                  size="sm"
                >
                  <SelectTrigger>
                    <SelectValueText placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent style={{ background: "var(--chakra-colors-bg-panel)", zIndex: 1600 }}>
                    {roleCollection.items.map((role) => (
                      <SelectItem item={role} key={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </Stack>

              <Button type="submit" colorPalette="teal" loading={inviting} width={{ base: "100%", sm: "auto" }}>
                Send Invite
              </Button>
            </Flex>
          </form>
        </Stack>
      </Box>

      {/* Members Directory */}
      <Stack gap={4}>
        <Heading size="md" fontWeight="bold">Team Directory</Heading>
        <DataTable
          headers={["Name", "Email", "Org Role", "Banned", "Joined At", "Actions"]}
          data={members}
          isLoading={loading}
          renderRow={(member: Member) => (
            <tr key={member.userId} style={{ borderBottom: "1px solid var(--chakra-colors-border-subtle)" }}>
              <td style={{ padding: "12px" }}>
                <Text fontWeight="semibold" fontSize="sm">{member.name}</Text>
              </td>
              <td style={{ padding: "12px" }}>
                <Text fontSize="sm" color="fg.muted">{member.email}</Text>
              </td>
              <td style={{ padding: "12px" }}>
                <Box maxW="150px">
                  <SelectRoot
                    collection={roleCollection}
                    value={[member.role]}
                    onValueChange={(details) => details.value[0] && handleUpdateRole(member.userId, details.value[0] as any)}
                    size="sm"
                  >
                    <SelectTrigger>
                      <SelectValueText placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent style={{ background: "var(--chakra-colors-bg-panel)", zIndex: 1600 }}>
                      {roleCollection.items.map((role) => (
                        <SelectItem item={role} key={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </Box>
              </td>
              <td style={{ padding: "12px" }}>
                {member.banned ? (
                  <Badge colorPalette="red">Banned</Badge>
                ) : (
                  <Badge colorPalette="green">Active</Badge>
                )}
              </td>
              <td style={{ padding: "12px" }}>
                <Text fontSize="xs" color="fg.muted">{new Date(member.joinedAt).toLocaleDateString()}</Text>
              </td>
              <td style={{ padding: "12px" }}>
                <Flex gap={2}>
                  <Button size="xs" variant="outline" colorPalette="teal" onClick={() => setActiveRestrictionUser(member)}>
                    Access Rules
                  </Button>
                  <Button size="xs" variant="outline" colorPalette="red" onClick={() => setDeleteMember(member)}>
                    Remove
                  </Button>
                </Flex>
              </td>
            </tr>
          )}
        />
      </Stack>

      {/* Path restrictions configurations modal */}
      {activeRestrictionUser && (
        <PathRestrictionModal
          isOpen={true}
          user={activeRestrictionUser}
          onClose={() => setActiveRestrictionUser(null)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteMember !== null}
        title="Remove Team Member"
        message={`Are you sure you want to remove ${deleteMember?.name} (${deleteMember?.email}) from the organization?`}
        confirmLabel="Remove Member"
        isLoading={removing}
        onConfirm={handleRemoveMember}
        onCancel={() => setDeleteMember(null)}
      />
    </Stack>
  );
}
