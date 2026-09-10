"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Box, Flex, Text, Button, Stack, Heading, Skeleton, createListCollection, Menu, Badge } from "@chakra-ui/react";
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValueText } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Pagination } from "@/components/shared/Pagination";
import { useConnections } from "@/react-query/connections/actions";
import { useObjects, useDeleteObject, useGetSigningUrl } from "@/react-query/objects/actions";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { ListView } from "./ListView";
import { useQueryState, parseAsInteger } from "nuqs";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useCopyLink } from "@/hooks/useCopyLink";
import { Upload, Folder } from "lucide-react";
import { toaster } from "@/components/ui/toaster";

import { useParams } from "next/navigation";
import { StorageItem } from "./types";

interface FileExplorerProps {
  initialConnections?: any[];
}

export function FileExplorer({ initialConnections = [] }: FileExplorerProps) {
  const params = useParams();
  const orgId = params?.orgId as string | undefined;
  const { data: connections = initialConnections, isLoading: loadingConnections } = useConnections(orgId, initialConnections);
  const [connectionId, setConnectionId] = useQueryState("cId");

  const activeConnectionId = connectionId || connections[0]?.id || "";

  const activeConnection = useMemo(() => {
    return connections.find((c) => c.id === activeConnectionId);
  }, [connections, activeConnectionId]);

  const projects = useMemo(() => {
    const list: string[] = [];
    connections.forEach((c) => {
      const p = c.projectName?.trim() || "General";
      if (!list.includes(p)) list.push(p);
    });
    return list;
  }, [connections]);

  const [selectedProject, setSelectedProject] = useState<string>("ALL");

  const projectCollection = useMemo(() => {
    return createListCollection<{ label: string; value: string }>({
      items: [{ label: "All Projects", value: "ALL" }, ...projects.map((p) => ({ label: p, value: p }))],
    });
  }, [projects]);

  const displayedConnections = useMemo(() => {
    if (selectedProject === "ALL") return connections;
    return connections.filter((c) => (c.projectName?.trim() || "General") === selectedProject);
  }, [connections, selectedProject]);

  const connCollection = useMemo(() => {
    return createListCollection<{ label: string; value: string }>({
      items: displayedConnections.map((c) => {
        const env = c.environment === "STAGING" ? "STG" : c.environment === "DEVELOPMENT" ? "DEV" : "PROD";
        const provider = c.providerType === "AWS_S3" ? "S3" : c.providerType === "CLOUDFLARE_R2" ? "R2" : "Cloudinary";
        return {
          label: `${c.label} (${provider} · ${env})`,
          value: c.id,
        };
      }),
    });
  }, [displayedConnections]);

  const [path, setPath] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [deleteItem, setDeleteItem] = useState<StorageItem | null>(null);
  const [previewItem, setPreviewItem] = useState<StorageItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Pagination state synced with URL via nuqs (shallow: true for instant client-side updates)
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1).withOptions({ shallow: true }));
  const [pageSize, setPageSize] = useQueryState("size", parseAsInteger.withDefault(25).withOptions({ shallow: true }));

  const {
    data,
    isLoading: loading,
    refetch,
  } = useObjects({
    connectionId: activeConnectionId,
    prefix: path,
  });

  const showSkeleton = (loadingConnections && connections.length === 0) || (Boolean(activeConnectionId) && loading && !data);

  const deleteMutation = useDeleteObject();
  const getSigningMutation = useGetSigningUrl();

  const items = data?.items || [];

  const handleConnectionChange = useCallback(
    (id: string) => {
      setConnectionId(id);
      setPath("");
      setPage(1);
    },
    [setConnectionId, setPage],
  );

  const navigateToSegment = useCallback(
    (index: number) => {
      const segmentsList = path.split("/").filter((s) => s !== "");
      const targetPath = segmentsList.slice(0, index + 1).join("/") + "/";
      setPath(targetPath);
      setPage(1);
    },
    [path, setPage],
  );

  const navigateToHome = useCallback(() => {
    setPath("");
    setPage(1);
  }, [setPage]);

  const handleDownload = useCallback(
    async (item: StorageItem) => {
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
    },
    [activeConnectionId, getSigningMutation],
  );

  const handleCopyLink = useCopyLink(activeConnectionId, getSigningMutation);

  const handlePreview = useCallback(
    async (item: StorageItem) => {
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
    },
    [activeConnectionId, getSigningMutation],
  );

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

  const totalItems = sortedItems.length;

  const prevPathRef = useRef(path);
  const prevConnRef = useRef(activeConnectionId);

  useEffect(() => {
    if (prevPathRef.current !== path || prevConnRef.current !== activeConnectionId) {
      prevPathRef.current = path;
      prevConnRef.current = activeConnectionId;
      setPage(1);
    }
  }, [path, activeConnectionId, setPage]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [sortedItems, page, pageSize]);

  return (
    <Flex direction="column" flex="1" height="100%" minH="0" overflow="hidden">
      {/* Header Section */}
      <Box pb={4} flexShrink={0}>
        <Flex align={{ base: "stretch", sm: "center" }} justify='space-between' gap={4} direction={{ base: "column", sm: "row" }}>
          <Stack gap={1}>
            <Heading size='md' fontWeight='bold'>
              Unified File Explorer
            </Heading>
            {/* Breadcrumb Navigator */}
            <Flex align='center' gap={1} fontSize='xs' fontWeight='medium' py={0.5} flexWrap='wrap'>
              <Button size='xs' variant='ghost' colorPalette='teal' onClick={navigateToHome} px={1} height='auto'>
                Root
              </Button>
              {segments.map((segment, index) => (
                <React.Fragment key={index}>
                  <Text color='fg.muted' fontSize='10px'>
                    /
                  </Text>
                  <Button size='xs' variant='ghost' colorPalette='teal' onClick={() => navigateToSegment(index)} px={1} height='auto'>
                    {segment}
                  </Button>
                </React.Fragment>
              ))}
            </Flex>
          </Stack>

          {/* Connection Switcher and Actions dropdown */}
          <Flex align='center' gap={3} justify={{ base: "space-between", sm: "flex-end" }}>
            {projects.length > 1 && (
              <Box minW={{ base: "0", sm: "140px" }}>
                <SelectRoot
                  collection={projectCollection}
                  value={[selectedProject]}
                  onValueChange={(details) => {
                    if (details.value[0]) {
                      const newProj = details.value[0];
                      setSelectedProject(newProj);
                      const firstInProj = connections.find((c) => newProj === "ALL" || (c.projectName?.trim() || "General") === newProj);
                      if (firstInProj) handleConnectionChange(firstInProj.id);
                    }
                  }}
                  size='sm'
                >
                  <SelectTrigger>
                    <SelectValueText placeholder='Project' />
                  </SelectTrigger>
                  <SelectContent>
                    {projectCollection.items.map((p: any) => (
                      <SelectItem item={p} key={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectRoot>
              </Box>
            )}

            {connections.length > 0 && (
              <Flex align='center' gap={2} flex={{ base: 1, sm: "initial" }}>
                <Box minW={{ base: "0", sm: "200px" }} flex='1'>
                  <SelectRoot
                    collection={connCollection}
                    value={[activeConnectionId]}
                    onValueChange={(details) => details.value[0] && handleConnectionChange(details.value[0])}
                    size='sm'
                  >
                    <SelectTrigger>
                      <SelectValueText placeholder='Select bucket' />
                    </SelectTrigger>
                    <SelectContent>
                      {connCollection.items.map((c: any) => (
                        <SelectItem item={c} key={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                </Box>
                {activeConnection && (
                  <Badge
                    size='xs'
                    colorPalette={
                      activeConnection.environment === "PRODUCTION" ? "red" : activeConnection.environment === "STAGING" ? "blue" : "teal"
                    }
                    variant='surface'
                    px={2}
                    py={1}
                  >
                    {activeConnection.environment === "PRODUCTION"
                      ? "PROD"
                      : activeConnection.environment === "STAGING"
                        ? "STAGING"
                        : "DEV"}
                  </Badge>
                )}
              </Flex>
            )}

            {connections.length > 0 && (
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button size='sm' colorPalette='teal' loading={creatingFolder}>
                    Actions
                  </Button>
                </Menu.Trigger>
                <Menu.Positioner>
                  <Menu.Content style={{ background: "var(--chakra-colors-bg-panel)", zIndex: 1600 }}>
                    <Menu.Item value='new-folder' onClick={triggerCreateFolder} gap={2}>
                      <Folder size={14} />
                      <span>Create Folder</span>
                    </Menu.Item>
                    <Menu.Item value='upload-files' asChild gap={2}>
                      <label style={{ cursor: "pointer", display: "flex", width: "100%", alignItems: "center" }}>
                        <input type='file' multiple onChange={handleUpload} style={{ display: "none" }} />
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
        <Box p={8} bg='bg.panel' borderRadius='lg' borderWidth='1px' textAlign='center'>
          <Text color='fg.muted' mb={4}>
            No storage connections configured for this organization.
          </Text>
          <Button
            colorPalette='teal'
            onClick={() => (window.location.href = orgId ? `/dashboard/${orgId}/connections` : "/dashboard/connections")}
          >
            Add Storage Connection
          </Button>
        </Box>
      ) : (
        <Box
          bg='bg.panel'
          borderWidth='1px'
          borderRadius='lg'
          shadow='sm'
          flex='1'
          display='flex'
          flexDirection='column'
          overflow='hidden'
          minH='0'
        >
          {showSkeleton ? (
            <Stack gap={4} p={5}>
              <Skeleton height='24px' width='100%' />
              <Skeleton height='24px' width='100%' />
              <Skeleton height='24px' width='100%' />
              <Skeleton height='24px' width='100%' />
            </Stack>
          ) : items.length === 0 ? (
            <Box py={12} textAlign='center'>
              <Text color='fg.muted'>This directory is empty.</Text>
            </Box>
          ) : (
            <>
              {/* Scrollable File List */}
              <Box flex='1' overflowY='auto' className='hide-scrollbar' minH='0'>
                <ListView
                  items={paginatedItems}
                  activeConnectionId={activeConnectionId}
                  getSigningMutation={getSigningMutation}
                  setPath={(newPath) => {
                    setPath(newPath);
                    setPage(1);
                  }}
                  getFormatSize={getFormatSize}
                  handlePreview={handlePreview}
                  handleDownload={handleDownload}
                  handleCopyLink={handleCopyLink}
                  setDeleteItem={setDeleteItem}
                />
              </Box>
              {/* Pinned Pagination Bar */}
              {totalItems > 0 && (
                <Box flexShrink={0}>
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={(p) => setPage(p)}
                    onPageSizeChange={(newSize) => {
                      setPageSize(newSize);
                      setPage(1);
                    }}
                    px={{ base: 4, md: 6 }}
                    bg='bg.panel'
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {/* Uploading progress overlays */}
      {uploads.length > 0 && (
        <Box
          position='fixed'
          bottom={6}
          right={6}
          bg='bg.panel'
          borderWidth='1px'
          borderColor='border.subtle'
          p={4}
          borderRadius='lg'
          shadow='2xl'
          zIndex={1400}
          width='320px'
        >
          <Text fontWeight='bold' fontSize='sm' mb={3} color='teal.500'>
            Uploading Files
          </Text>
          <Stack gap={3}>
            {uploads.map((up) => (
              <Stack key={up.fileName} gap={1}>
                <Flex justify='space-between' fontSize='xs'>
                  <Text truncate maxW='200px'>
                    {up.fileName}
                  </Text>
                  <Text fontWeight='bold'>{up.progress}%</Text>
                </Flex>
                <Box h={1.5} bg='bg.muted' borderRadius='full' overflow='hidden'>
                  <Box h='100%' bg='teal.500' w={`${up.progress}%`} transition='width 0.2s' />
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
        message={
          activeConnection?.environment === "PRODUCTION"
            ? `⚠️ WARNING: This bucket is in the PRODUCTION environment ("${activeConnection?.projectName || "General"}"). Deleting "${deleteItem?.name}" is permanent and cannot be undone. Are you sure you want to proceed?`
            : `Are you sure you want to delete "${deleteItem?.name}"? This action is permanent and cannot be undone.`
        }
        confirmLabel={activeConnection?.environment === "PRODUCTION" ? "Yes, Delete from Prod" : "Delete"}
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
    </Flex>
  );
}
