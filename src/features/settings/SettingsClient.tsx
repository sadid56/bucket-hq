"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, Stack, Text, Heading } from "@chakra-ui/react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { TextField } from "@/components/ui/text-field";
import { updateOrgAction, deleteOrgAction } from "@/actions/organization";

import { useOrgs } from "@/react-query/organizations/actions";

interface SettingsClientProps {
  orgs?: any[];
  orgId: string;
}

export function SettingsClient({ orgs: initialOrgs = [], orgId }: SettingsClientProps) {
  const { data: queriedOrgs } = useOrgs();
  const orgs = queriedOrgs || initialOrgs;
  const [orgName, setOrgName] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeOrg = orgs.find((o: any) => o.id === orgId || o.slug === orgId) || orgs[0] || null;

  useEffect(() => {
    if (activeOrg) {
      setOrgName(activeOrg.name);
    }
  }, [activeOrg]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg || !orgName.trim()) return;

    setIsSaving(true);
    try {
      const res = await updateOrgAction(activeOrg.id, orgName.trim());
      if (res.success && res.org) {
        const newSlug = res.org.slug || res.org.id;
        window.location.href = `/dashboard/${newSlug}/settings`;
      }
    } catch {} finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!activeOrg) return;

    setIsDeleting(true);
    try {
      const res = await deleteOrgAction(activeOrg.id);
      if (res.success) {
        window.location.href = "/dashboard";
      }
    } catch {} finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  if (!activeOrg) {
    return (
      <Box p={8} bg="bg.panel" borderRadius="lg" borderWidth="1px" textAlign="center">
        <Text color="fg.muted" mb={4}>Please select an organization to edit settings.</Text>
      </Box>
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
              <TextField
                label={<Text fontSize="xs" fontWeight="semibold" color="fg.muted">Organization Name</Text>}
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
              {isOwner && (
                <Button type="submit" colorPalette="teal" loading={isSaving} alignSelf="flex-start">
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
              loading={isDeleting}
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
        isLoading={isDeleting}
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
