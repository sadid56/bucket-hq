"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, Input, Stack, Text, Heading, Skeleton, Flex } from "@chakra-ui/react";
import { useOrgs, useUpdateOrg, useDeleteOrg } from "@/react-query/organizations/actions";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useParams } from "next/navigation";

export default function SettingsPage() {
  const { data: orgs = [], isLoading: loading } = useOrgs();
  const [orgName, setOrgName] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const updateOrgMutation = useUpdateOrg();
  const deleteOrgMutation = useDeleteOrg();
  
  const saving = updateOrgMutation.isPending;
  const deleting = deleteOrgMutation.isPending;

  const params = useParams();
  const orgId = params?.orgId as string | undefined;
  const activeOrg = orgs.find((o: any) => o.id === orgId) || orgs[0] || null;

  useEffect(() => {
    if (activeOrg) {
      setOrgName(activeOrg.name);
    }
  }, [activeOrg]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg || !orgName.trim()) return;

    try {
      await updateOrgMutation.mutateAsync({
        orgId: activeOrg.id,
        name: orgName.trim(),
      });
    } catch (err) {
    }
  };

  const handleDeleteConfirm = async () => {
    if (!activeOrg) return;

    try {
      await deleteOrgMutation.mutateAsync(activeOrg.id);
      localStorage.removeItem("active_organization_id");
      window.location.href = "/dashboard";
    } catch (err) {
    } finally {
      setIsDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <Stack gap={6} maxW="xl">
        <Stack gap={1}>
          <Skeleton height="32px" width="250px" />
          <Skeleton height="16px" width="350px" />
        </Stack>
        <Stack gap={4} mt={4}>
          <Skeleton height="40px" />
          <Skeleton height="40px" />
          <Skeleton height="40px" />
        </Stack>
      </Stack>
    );
  }

  const isOwner = activeOrg?.userRole === "OWNER";

  return (
    <Stack gap={6} maxW="xl">
      <Stack gap={1}>
        <Heading size="lg" fontWeight="bold">Workspace Settings</Heading>
        <Text fontSize="sm" color="fg.muted">Rename workspaces or review tenancy configurations</Text>
      </Stack>

      <Box bg="bg.panel" p={6} borderRadius="lg" borderWidth="1px" shadow="sm">
        <Stack gap={4}>
          <Heading size="sm" fontWeight="bold">Rename Workspace</Heading>
          <form onSubmit={handleUpdateName}>
            <Stack gap={4}>
              <Stack gap={1.5}>
                <Text fontSize="xs" fontWeight="semibold" color="fg.muted">Organization Name</Text>
                <Input
                  placeholder="e.g. Acme Agency"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  disabled={!isOwner}
                  required
                />
                {!isOwner && (
                  <Text fontSize="xs" color="red.500">
                    Only owners of the organization can update details.
                  </Text>
                )}
              </Stack>
              {isOwner && (
                <Button type="submit" colorPalette="teal" loading={saving} alignSelf="flex-start">
                  Save Changes
                </Button>
              )}
            </Stack>
          </form>
        </Stack>
      </Box>

      {isOwner && orgs.length > 1 && (
        <Box bg="bg.panel" p={6} borderRadius="lg" borderWidth="1px" borderColor="red.subtle" shadow="sm">
          <Stack gap={4}>
            <Heading size="sm" fontWeight="bold" color="red.500">Danger Zone</Heading>
            <Text fontSize="sm">
              Deleting this workspace will permanently remove all storage connections, path restrictions, and credentials associated with it.
            </Text>
            <Button
              colorPalette="red"
              variant="subtle"
              loading={deleting}
              onClick={() => setIsDeleteOpen(true)}
              alignSelf="flex-start"
            >
              Delete Workspace
            </Button>
          </Stack>
        </Box>
      )}

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Workspace"
        message={`Are you sure you want to delete the workspace "${activeOrg?.name}"? This action is permanent and cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
      />

      <Box bg="bg.panel" p={6} borderRadius="lg" borderWidth="1px" shadow="sm">
        <Stack gap={3}>
          <Heading size="sm" fontWeight="bold">Security Infrastructure</Heading>
          <Text fontSize="sm">
            BucketHQ utilizes AES-256-GCM symmetric-key encryption to secure storage secrets. Raw keys never leak from the database, and only exist decrypted briefly in Node's volatile process RAM.
          </Text>
          <Box p={3} bg="bg.muted" borderRadius="md">
            <Text fontSize="xs" fontFamily="mono" color="fg.muted">
              Database Encryption: Enabled (AES-256-GCM)
            </Text>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
