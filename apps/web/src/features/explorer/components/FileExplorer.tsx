"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Heading,
  Input,
  Skeleton,
  Badge,
  SimpleGrid,
  createListCollection,
  Menu,
} from "@chakra-ui/react";
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValueText } from "@/components/ui/select";
import { toaster } from "@/components/ui/toaster";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useConnections } from "@/react-query/connections/actions";
import { useObjects, useDeleteObject, useGetSigningUrl } from "@/react-query/objects/actions";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { useQueryState } from "nuqs";
import { Upload, Folder, File, MoreVertical, Eye, Download, Link, Trash2, LayoutGrid, List, Image } from "lucide-react";

interface Connection {
  id: string;
  label: string;
  providerType: "AWS_S3" | "CLOUDFLARE_R2" | "CLOUDINARY";
  bucketName?: string;
}

interface StorageItem {
  key: string;
  name: string;
  size: number;
  lastModified?: string;
  type: "file" | "folder";
}

interface UploadProgress {
  fileName: string;
  progress: number;
}

const isImageFile = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext || "");
};

const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

function getCachedSignedUrl(connectionId: string, key: string): string | null {
  const cacheKey = `${connectionId}:${key}`;
  const cached = signedUrlCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }
  return null;
}

function setCachedSignedUrl(connectionId: string, key: string, url: string) {
  const cacheKey = `${connectionId}:${key}`;
  // Cache for 10 minutes (600,000 ms)
  signedUrlCache.set(cacheKey, { url, expiresAt: Date.now() + 600 * 1000 });
}

function FileThumbnail({
  item,
  connectionId,
  getSigningMutation,
}: {
  item: StorageItem;
  connectionId: string;
  getSigningMutation: any;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check cache first; if cached, no need to observe intersection
    const cachedUrl = getCachedSignedUrl(connectionId, item.key);
    if (cachedUrl) {
      setUrl(cachedUrl);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [connectionId, item.key]);

  useEffect(() => {
    if (!visible) return;
    
    // Double check cache in case it was loaded by another component while waiting to intersect
    const cachedUrl = getCachedSignedUrl(connectionId, item.key);
    if (cachedUrl) {
      setUrl(cachedUrl);
      return;
    }

    let active = true;
    const fetchUrl = async () => {
      try {
        const res = await getSigningMutation.mutateAsync({
          action: "download",
          connectionId,
          key: item.key,
        });
        if (active) {
          setUrl(res.url);
          setCachedSignedUrl(connectionId, item.key, res.url);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUrl();
    return () => {
      active = false;
    };
  }, [visible, item.key, connectionId]);

  return (
    <Flex
      ref={containerRef}
      align="center"
      justify="center"
      width="100%"
      height="100%"
      bg="bg.muted"
      position="relative"
      overflow="hidden"
      borderRadius="sm"
    >
      {/* Fallback/Placeholder Icon */}
      {!imageLoaded && (
        <Image size={14} color="var(--chakra-colors-fg-muted)" />
      )}

      {url && (
        <img
          src={url}
          alt={item.name}
          onLoad={() => setImageLoaded(true)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: imageLoaded ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
          }}
        />
      )}
    </Flex>
  );
}

export function FileExplorer() {
  const { data: connections = [], isLoading: loadingConnections } = useConnections();
  const [connectionId, setConnectionId] = useQueryState("cId");

  const activeConnectionId = connectionId || (connections[0]?.id || "");

  const connCollection = React.useMemo(() => {
    return createListCollection({
      items: connections.map((c) => ({
        label: `${c.label} (${c.providerType === "AWS_S3" ? "S3" : c.providerType === "CLOUDFLARE_R2" ? "R2" : "Cloudinary"})`,
        value: c.id,
      })),
    });
  }, [connections]);

  const [path, setPath] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [deleteItem, setDeleteItem] = useState<StorageItem | null>(null);
  const [previewItem, setPreviewItem] = useState<StorageItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    const stored = localStorage.getItem("explorer_view_mode");
    if (stored === "list" || stored === "grid") {
      setViewMode(stored);
    }
  }, []);

  const handleViewModeChange = (mode: "list" | "grid") => {
    setViewMode(mode);
    localStorage.setItem("explorer_view_mode", mode);
  };

  const { data, isLoading: loading, refetch } = useObjects({
    connectionId: activeConnectionId,
    prefix: path,
  });

  const showSkeleton = loadingConnections || (connections.length > 0 && !activeConnectionId) || loading;

  const deleteMutation = useDeleteObject();
  const getSigningMutation = useGetSigningUrl();

  const items = data?.items || [];



  const handleConnectionChange = (id: string) => {
    setConnectionId(id);
    setPath("");
  };

  const navigateToSegment = (index: number) => {
    const segments = path.split("/").filter((s) => s !== "");
    const targetPath = segments.slice(0, index + 1).join("/") + "/";
    setPath(targetPath);
  };

  const navigateToHome = () => {
    setPath("");
  };

  const handleDownload = async (item: StorageItem) => {
    try {
      const res = await getSigningMutation.mutateAsync({
        action: "download",
        connectionId: activeConnectionId,
        key: item.key,
      });
      window.open(res.url, "_blank");
    } catch (err: any) {
      toaster.create({
        title: "Download signature failed",
        description: err.message,
        type: "error",
      });
    }
  };

  const handleCopyLink = async (item: StorageItem) => {
    try {
      const res = await getSigningMutation.mutateAsync({
        action: "download",
        connectionId: activeConnectionId,
        key: item.key,
      });
      await navigator.clipboard.writeText(res.url);
      toaster.create({
        title: "Link copied to clipboard",
        type: "success",
      });
    } catch (err: any) {
      toaster.create({
        title: "Failed to get link",
        description: err.message,
        type: "error",
      });
    }
  };

  const handlePreview = async (item: StorageItem) => {
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
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    try {
      await deleteMutation.mutateAsync({
        connectionId: activeConnectionId,
        key: deleteItem.key,
      });
      setDeleteItem(null);
      refetch();
    } catch (err) {
    }
  };

  const triggerCreateFolder = async () => {
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
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    const filesArray = Array.from(filesList);

    for (const file of filesArray) {
      const fileKey = `${path}${file.name}`;
      setUploads((prev) => [...prev, { fileName: file.name, progress: 0 }]);

      try {
        const res = await getSigningMutation.mutateAsync({
          action: "upload",
          connectionId: activeConnectionId,
          key: fileKey,
        });
        const url = res.url;

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const isCloudinary = url.includes("cloudinary.com");

          if (isCloudinary) {
            const parsedUrl = new URL(url);
            const formData = new FormData();
            
            parsedUrl.searchParams.forEach((value, name) => {
              formData.append(name, value);
            });
            formData.append("file", file);

            xhr.open("POST", parsedUrl.origin + parsedUrl.pathname, true);

            xhr.upload.onprogress = (evt) => {
              if (evt.lengthComputable) {
                const percent = Math.round((evt.loaded / evt.total) * 100);
                setUploads((prev) =>
                  prev.map((up) => (up.fileName === file.name ? { ...up, progress: percent } : up))
                );
              }
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
              } else {
                reject(new Error(`Upload failed with status: ${xhr.status}`));
              }
            };
            xhr.onerror = () => reject(new Error("Network upload error"));
            xhr.send(formData);
          } else {
            xhr.open("PUT", url, true);
            xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

            xhr.upload.onprogress = (evt) => {
              if (evt.lengthComputable) {
                const percent = Math.round((evt.loaded / evt.total) * 100);
                setUploads((prev) =>
                  prev.map((up) => (up.fileName === file.name ? { ...up, progress: percent } : up))
                );
              }
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
              } else {
                reject(new Error(`Upload failed with status: ${xhr.status}`));
              }
            };
            xhr.onerror = () => reject(new Error("Network upload error"));
            xhr.send(file);
          }
        });

        toaster.create({
          title: `Uploaded ${file.name} successfully`,
          type: "success",
        });
      } catch (err: any) {
        toaster.create({
          title: `Failed to upload ${file.name}`,
          description: err.message,
          type: "error",
        });
      } finally {
        setTimeout(() => {
          setUploads((prev) => prev.filter((up) => up.fileName !== file.name));
        }, 1500);
        refetch();
      }
    }
  };

  const getFormatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const segments = path.split("/").filter((s) => s !== "");

  const sortedItems = [...items].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "folder" ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

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
            <Heading size="md" fontWeight="bold">Unified File Explorer</Heading>
            {/* Breadcrumb Navigator */}
            <Flex align="center" gap={1} fontSize="xs" fontWeight="medium" py={0.5} flexWrap="wrap">
              <Button size="xs" variant="ghost" colorPalette="teal" onClick={navigateToHome} px={1} height="auto">
                Root
              </Button>
              {segments.map((segment, index) => (
                <React.Fragment key={index}>
                  <Text color="fg.muted" fontSize="10px">/</Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    colorPalette="teal"
                    onClick={() => navigateToSegment(index)}
                    px={1}
                    height="auto"
                  >
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
                        <input
                          type="file"
                          multiple
                          onChange={handleUpload}
                          style={{ display: "none" }}
                        />
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
          <Text color="fg.muted" mb={4}>No storage connections configured for this organization.</Text>
          <Button colorPalette="teal" onClick={() => (window.location.href = "/dashboard/connections")}>
            Add Storage Connection
          </Button>
        </Box>
      ) : (
        <Box
          bg="bg.panel"
          borderWidth="1px"
          borderRadius="lg"
          overflowY="auto"
          maxHeight="calc(100vh - 120px)"
          mb={4}
          shadow="sm"
        >
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
            <Stack gap={0} divideY="1px" divideColor="border.subtle">
              {sortedItems.map((item) => (
                <Flex
                  key={item.key}
                  p={3.5}
                  align="center"
                  justify="space-between"
                  _hover={{ bg: "bg.muted" }}
                  transition="background 0.15s"
                >
                  {/* Item Title & Type */}
                  <Flex
                    align="center"
                    gap={3}
                    cursor={item.type === "folder" ? "pointer" : "default"}
                    onClick={() => item.type === "folder" && setPath(item.key)}
                    flex="1"
                  >
                    {item.type === "folder" ? (
                      <Folder size={20} color="var(--chakra-colors-teal-500)" fill="var(--chakra-colors-teal-500)" />
                    ) : isImageFile(item.name) ? (
                      <Box w="24px" h="24px" overflow="hidden" borderRadius="sm">
                        <FileThumbnail
                          item={item}
                          connectionId={activeConnectionId}
                          getSigningMutation={getSigningMutation}
                        />
                      </Box>
                    ) : (
                      <File size={20} color="var(--chakra-colors-fg-muted)" />
                    )}
                    <Text fontWeight="medium" fontSize="sm">
                      {item.name}
                    </Text>
                  </Flex>

                  {/* Meta stats & Actions */}
                  <Flex align="center" gap={6}>
                    {item.type === "file" && (
                      <Text fontSize="xs" color="fg.muted">
                        {getFormatSize(item.size)}
                      </Text>
                    )}

                    <Menu.Root>
                      <Menu.Trigger asChild>
                        <Button size="xs" variant="ghost" px={2}>
                          <MoreVertical size={16} />
                        </Button>
                      </Menu.Trigger>
                      <Menu.Positioner>
                        <Menu.Content style={{ background: "var(--chakra-colors-bg-panel)" }}>
                          {item.type === "file" && (
                            <>
                              {isImageFile(item.name) && (
                                <Menu.Item value="preview" onClick={() => handlePreview(item)} gap={2}>
                                  <Eye size={14} />
                                  <span>Preview / Open</span>
                                </Menu.Item>
                              )}
                              <Menu.Item value="download" onClick={() => handleDownload(item)} gap={2}>
                                <Download size={14} />
                                <span>Download</span>
                              </Menu.Item>
                              <Menu.Item value="copy" onClick={() => handleCopyLink(item)} gap={2}>
                                <Link size={14} />
                                <span>Copy Link</span>
                              </Menu.Item>
                            </>
                          )}
                          <Menu.Item value="delete" color="red.500" onClick={() => setDeleteItem(item)} gap={2}>
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </Menu.Item>
                        </Menu.Content>
                      </Menu.Positioner>
                    </Menu.Root>
                  </Flex>
                </Flex>
              ))}
            </Stack>
          ) : (
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} gap={4} p={5}>
              {sortedItems.map((item) => (
                <Box
                  key={item.key}
                  bg="bg.panel"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="border.subtle"
                  overflow="hidden"
                  position="relative"
                  role="group"
                  transition="all 0.15s"
                  _hover={{ shadow: "md", borderColor: "teal.500" }}
                >
                  {/* Card Content Clickable for folders */}
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    p={4}
                    height="140px"
                    cursor={item.type === "folder" ? "pointer" : "default"}
                    onClick={() => item.type === "folder" && setPath(item.key)}
                  >
                    {item.type === "folder" ? (
                      <Folder size={48} color="var(--chakra-colors-teal-500)" fill="var(--chakra-colors-teal-500)" />
                    ) : isImageFile(item.name) ? (
                      <Box w="full" h="80px" mb={2} overflow="hidden" borderRadius="md">
                        <FileThumbnail
                          item={item}
                          connectionId={activeConnectionId}
                          getSigningMutation={getSigningMutation}
                        />
                      </Box>
                    ) : (
                      <File size={40} color="var(--chakra-colors-fg-muted)" />
                    )}
                    
                    <Text
                      fontWeight="medium"
                      fontSize="xs"
                      textAlign="center"
                      mt={item.type === "folder" || !isImageFile(item.name) ? 3 : 1}
                      truncate
                      width="full"
                      px={1}
                    >
                      {item.name}
                    </Text>
                  </Flex>

                  {/* Actions Dropdown on Hover */}
                  <Box position="absolute" top={1.5} right={1.5}>
                    <Menu.Root>
                      <Menu.Trigger asChild>
                        <Button size="xs" variant="ghost" px={1.5} height="24px" width="24px" borderRadius="full" bg="bg.panel" borderWidth="1px">
                          <MoreVertical size={12} />
                        </Button>
                      </Menu.Trigger>
                      <Menu.Positioner>
                        <Menu.Content style={{ background: "var(--chakra-colors-bg-panel)" }}>
                          {item.type === "file" && (
                            <>
                              {isImageFile(item.name) && (
                                <Menu.Item value="preview" onClick={() => handlePreview(item)} gap={2}>
                                  <Eye size={12} />
                                  <span>Preview / Open</span>
                                </Menu.Item>
                              )}
                              <Menu.Item value="download" onClick={() => handleDownload(item)} gap={2}>
                                <Download size={12} />
                                <span>Download</span>
                              </Menu.Item>
                              <Menu.Item value="copy" onClick={() => handleCopyLink(item)} gap={2}>
                                <Link size={12} />
                                <span>Copy Link</span>
                              </Menu.Item>
                            </>
                          )}
                          <Menu.Item value="delete" color="red.500" onClick={() => setDeleteItem(item)} gap={2}>
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </Menu.Item>
                        </Menu.Content>
                      </Menu.Positioner>
                    </Menu.Root>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
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
                  <Text truncate maxW="200px">{up.fileName}</Text>
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
