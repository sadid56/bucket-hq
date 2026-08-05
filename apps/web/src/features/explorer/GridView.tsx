"use client";

import React from "react";
import { Flex, Text, Button, Box, SimpleGrid, Menu } from "@chakra-ui/react";
import { Folder, File, MoreVertical, Eye, Download, Link, Trash2 } from "lucide-react";
import { FileThumbnail } from "./FileThumbnail";

interface StorageItem {
  key: string;
  name: string;
  size: number;
  lastModified?: string;
  type: "file" | "folder";
}

const isImageFile = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext || "");
};

interface GridViewProps {
  items: StorageItem[];
  activeConnectionId: string;
  getSigningMutation: any;
  setPath: (path: string) => void;
  handlePreview: (item: StorageItem) => void;
  handleDownload: (item: StorageItem) => void;
  handleCopyLink: (item: StorageItem) => void;
  setDeleteItem: (item: StorageItem) => void;
}

export function GridView({
  items,
  activeConnectionId,
  getSigningMutation,
  setPath,
  handlePreview,
  handleDownload,
  handleCopyLink,
  setDeleteItem,
}: GridViewProps) {
  return (
    <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} gap={4} p={5}>
      {items.map((item) => (
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
                <FileThumbnail item={item} connectionId={activeConnectionId} getSigningMutation={getSigningMutation} />
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
                <Button
                  size="xs"
                  variant="ghost"
                  px={1.5}
                  height="24px"
                  width="24px"
                  borderRadius="full"
                  bg="bg.panel"
                  borderWidth="1px"
                >
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
  );
}
