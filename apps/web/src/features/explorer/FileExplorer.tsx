"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Box, Flex, Text, Button, Stack, Heading, Skeleton, createListCollection, Menu } from "@chakra-ui/react";
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValueText } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useConnections } from "@/react-query/connections/actions";
import { useObjects, useDeleteObject, useGetSigningUrl } from "@/react-query/objects/actions";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { ListView } from "./ListView";
import { GridView } from "./GridView";
import { useQueryState } from "nuqs";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useCopyLink } from "@/hooks/useCopyLink";
import { Upload, Folder, LayoutGrid, List } from "lucide-react";
import { toaster } from "@/components/ui/toaster";

interface StorageItem {
  key: string;
  name: string;
  size: number;
  lastModified?: string;
  type: "file" | "folder";
}

export function FileExplorer() {
  const { data: connections = [], isLoading: loadingConnections } = useConnections();
  const [connectionId, setConnectionId] = useQueryState("cId");

  const activeConnectionId = connectionId || connections[0]?.id || "";

  const connCollection = useMemo(() => {
    return createListCollection({
      items: connections.map((c) => ({
        label: `${c.label} (${c.providerType === "AWS_S3" ? "S3" : c.providerType === "CLOUDFLARE_R2" ? "R2" : "Cloudinary"})`,
        value: c.id,
      })),
    });
  }, [connections]);

  const [path, setPath] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [deleteItem, setDeleteItem] = useState<StorageItem | null>(null);
  const [previewItem, setPreviewItem] = useState<StorageItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  React.useEffect(() => {
    const stored = localStorage.getItem("explorer_view_mode");
    if (stored === "list" || stored === "grid") {
      setViewMode(stored);
    }
  }, []);

  const handleViewModeChange = useCallback((mode: "list" | "grid") => {
    setViewMode(mode);
    localStorage.setItem("explorer_view_mode", mode);
  }, []);

  const {
    data,
    isLoading: loading,
    refetch,
  } = useObjects({
    connectionId: activeConnectionId,
    prefix: path,
  });

  const showSkeleton = loadingConnections || (connections.length > 0 && !activeConnectionId) || loading;

  const deleteMutation = useDeleteObject();
  const getSigningMutation = useGetSigningUrl();

  const items = data?.items || [];

  const handleConnectionChange = useCallback((id: string) => {
    setConnectionId(id);
    setPath("");
  }, [setConnectionId]);

  const navigateToSegment = useCallback((index: number) => {
    const segmentsList = path.split("/").filter((s) => s !== "");
    const targetPath = segmentsList.slice(0, index + 1).join("/") + "/";
    setPath(targetPath);
  }, [path]);

  const navigateToHome = useCallback(() => {
    setPath("");
  }, []);

  const handleDownload = useCallback(async (item: StorageItem) => {
    try {
      const res = await getSigningMutation.mutateAsync({
        action: "download",
        connectionId: activeConnectionId,
        key: item.key,
      });

      try {
        const fileRes = await fetch(res.url);
        if (!fileRes.ok) throw new Error("Fetch failed");

        const blob = await fileRes.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = item.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch (fetchErr) {
        window.open(res.url, "_blank");
      }
    } catch (err: any) {
      toaster.create({
        title: "Download signature failed",
        description: err.message,
        type: "error",
      });
    }
  }, [activeConnectionId, getSigningMutation]);

  const handleCopyLink = useCopyLink(activeConnectionId, getSigningMutation);

  const handlePreview = useCallback(async (item: StorageItem) => {
    setPreviewItem(item);
    setPreviewUrl("");
    setLoadingPreview(true);
    try {
      const res = await getSigningMutation.mutateAsync({
        action: "download",
        connectionId: activeConnectionId,
        key: item.key,
      });
      setPreviewUrl(res.url);
    } catch (err: any) {
      toaster.create({
        title: "Failed to load preview",
        description: err.message,
        type: "error",
      });
      setPreviewItem(null);
    } finally {
      setLoadingPreview(false);
    }
  }, [activeConnectionId, getSigningMutation]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteItem) return;
    try {
      await deleteMutation.mutateAsync({
        connectionId: activeConnectionId,
        key: deleteItem.key,
      });
      setDeleteItem(null);
      refetch();
    } catch (err) {}
  }, [deleteItem, activeConnectionId, deleteMutation, refetch]);

  const triggerCreateFolder = useCallback(async () => {
    if (!activeConnectionId) return;
    const name = window.prompt("Enter new folder name:");
    if (!name || !name.trim()) return;

    setCreatingFolder(true);
    const folderKey = `${path}${name.trim().replace(/\/+$/, "")}/`;
    try {
      const res = await getSigningMutation.mutateAsync({
        action: "upload",
        connectionId: activeConnectionId,
        key: folderKey,
      });

      await fetch(res.url, {
        method: "PUT",
        headers: { "Content-Type": "application/x-directory" },
        body: "",
      });

      toaster.create({
        title: "Folder created successfully",
        type: "success",
      });
      refetch();
    } catch (err: any) {
      toaster.create({
        title: "Failed to create folder",
        description: err.message,
        type: "error",
      });
    } finally {
      setCreatingFolder(false);
    }
  }, [activeConnectionId, path, getSigningMutation, refetch]);

  // Use custom hook for file uploads
  const { uploads, handleUpload } = useFileUpload(activeConnectionId, path, refetch, getSigningMutation);

  const getFormatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const segments = useMemo(() => {
    return path.split("/").filter((s) => s !== "");
  }, [path]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [items]);

  return (
    <Stack gap={0}>
      {/* Sticky Header Section */}
      <Box
        position="sticky"
        top="0"
        zIndex={100}
        bg="var(--background)"
        pt={{ base: "16px", md: "32px" }}
        pb={4}
        mt={{ base: "-16px", md: "-32px" }}
        borderBottomWidth="1px"
        borderColor="border.subtle"
      >
        <Flex align={{ base: "stretch", sm: "center" }} justify="space-between" gap={4} direction={{ base: "column", sm: "row" }}>
          <Stack gap={1}>
            <Heading size="md" fontWeight="bold">
              Unified File Explorer
            </Heading>
            {/* Breadcrumb Navigator */}
            <Flex align="center" gap={1} fontSize="xs" fontWeight="medium" py={0.5} flexWrap="wrap">
              <Button size="xs" variant="ghost" colorPalette="teal" onClick={navigateToHome} px={1} height="auto">
                Root
              </Button>
              {segments.map((segment, index) => (
                <React.Fragment key={index}>
                  <Text color="fg.muted" fontSize="10px">
                    /
                  </Text>
                  <Button size="xs" variant="ghost" colorPalette="teal" onClick={() => navigateToSegment(index)} px={1} height="auto">
                    {segment}
                  </Button>
                </React.Fragment>
              ))}
            </Flex>
          </Stack>

          {/* Connection Switcher and Actions dropdown */}
          <Flex align="center" gap={3} justify={{ base: "space-between", sm: "flex-end" }}>
            {connections.length > 0 && (
              <Flex borderWidth="1px" borderColor="border.subtle" borderRadius="md" p={0.5} bg="bg.muted" align="center" height="32px">
                <Button
                  size="xs"
                  variant={viewMode === "list" ? "solid" : "ghost"}
                  onClick={() => handleViewModeChange("list")}
                  px={2}
                  height="24px"
                >
                  <List size={14} />
                </Button>
                <Button
                  size="xs"
                  variant={viewMode === "grid" ? "solid" : "ghost"}
                  onClick={() => handleViewModeChange("grid")}
                  px={2}
                  height="24px"
                >
                  <LayoutGrid size={14} />
                </Button>
              </Flex>
            )}
            {connections.length > 0 && (
              <Box minW={{ base: "0", sm: "180px" }} flex={{ base: 1, sm: "initial" }}>
                <SelectRoot
                  collection={connCollection}
                  value={[activeConnectionId]}
                  onValueChange={(details) => details.value[0] && handleConnectionChange(details.value[0])}
                  size="sm"
                >
                  <SelectTrigger>
                    <SelectValueText placeholder="Select connection" />
                  </SelectTrigger>
                  <SelectContent style={{ background: "var(--chakra-colors-bg-panel)", zIndex: 1600 }}>
                    {connCollection.items.map((c) => (
                      <SelectItem item={c} key={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </Box>
            )}

            {connections.length > 0 && (
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button size="sm" colorPalette="teal" loading={creatingFolder}>
                    Actions
                  </Button>
                </Menu.Trigger>
                <Menu.Positioner>
                  <Menu.Content style={{ background: "var(--chakra-colors-bg-panel)", zIndex: 1600 }}>
                    <Menu.Item value="new-folder" onClick={triggerCreateFolder} gap={2}>
                      <Folder size={14} />
                      <span>Create Folder</span>
                    </Menu.Item>
                    <Menu.Item value="upload-files" asChild gap={2}>
                      <label style={{ cursor: "pointer", display: "flex", width: "100%", alignItems: "center" }}>
                        <input type="file" multiple onChange={handleUpload} style={{ display: "none" }} />
                        <Upload size={14} style={{ marginRight: 8 }} />
                        <span>Upload Files</span>
                      </label>
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Menu.Root>
            )}
          </Flex>
        </Flex>
      </Box>

      {!loadingConnections && connections.length === 0 ? (
        <Box p={8} bg="bg.panel" borderRadius="lg" borderWidth="1px" textAlign="center">
          <Text color="fg.muted" mb={4}>
            No storage connections configured for this organization.
          </Text>
          <Button colorPalette="teal" onClick={() => (window.location.href = "/dashboard/connections")}>
            Add Storage Connection
          </Button>
        </Box>
      ) : (
        <Box bg="bg.panel" borderWidth="1px" borderRadius="lg" overflowY="auto" maxHeight="calc(100vh - 120px)" mb={4} shadow="sm">
          {showSkeleton ? (
            <Stack gap={4} p={5}>
              <Skeleton height="24px" width="100%" />
              <Skeleton height="24px" width="100%" />
              <Skeleton height="24px" width="100%" />
              <Skeleton height="24px" width="100%" />
            </Stack>
          ) : items.length === 0 ? (
            <Box py={12} textAlign="center">
              <Text color="fg.muted">This directory is empty.</Text>
            </Box>
          ) : viewMode === "list" ? (
            <ListView
              items={sortedItems}
              activeConnectionId={activeConnectionId}
              getSigningMutation={getSigningMutation}
              setPath={setPath}
              getFormatSize={getFormatSize}
              handlePreview={handlePreview}
              handleDownload={handleDownload}
              handleCopyLink={handleCopyLink}
              setDeleteItem={setDeleteItem}
            />
          ) : (
            <GridView
              items={sortedItems}
              activeConnectionId={activeConnectionId}
              getSigningMutation={getSigningMutation}
              setPath={setPath}
              handlePreview={handlePreview}
              handleDownload={handleDownload}
              handleCopyLink={handleCopyLink}
              setDeleteItem={setDeleteItem}
            />
          )}
        </Box>
      )}

      {/* Uploading progress overlays */}
      {uploads.length > 0 && (
        <Box
          position="fixed"
          bottom={6}
          right={6}
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border.subtle"
          p={4}
          borderRadius="lg"
          shadow="2xl"
          zIndex={1400}
          width="320px"
        >
          <Text fontWeight="bold" fontSize="sm" mb={3} color="teal.500">
            Uploading Files
          </Text>
          <Stack gap={3}>
            {uploads.map((up) => (
              <Stack key={up.fileName} gap={1}>
                <Flex justify="space-between" fontSize="xs">
                  <Text truncate maxW="200px">
                    {up.fileName}
                  </Text>
                  <Text fontWeight="bold">{up.progress}%</Text>
                </Flex>
                <Box h={1.5} bg="bg.muted" borderRadius="full" overflow="hidden">
                  <Box h="100%" bg="teal.500" w={`${up.progress}%`} transition="width 0.2s" />
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteItem !== null}
        title={`Delete ${deleteItem?.type === "folder" ? "Folder" : "File"}`}
        message={`Are you sure you want to delete "${deleteItem?.name}"? This action is permanent and cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteItem(null)}
      />

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={previewItem !== null}
        title={previewItem?.name || ""}
        imageUrl={previewUrl}
        isLoading={loadingPreview}
        onClose={() => {
          setPreviewItem(null);
          setPreviewUrl("");
        }}
      />
    </Stack>
  );
}
