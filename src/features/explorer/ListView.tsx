"use client";

import React from "react";
import { Flex, Text, Button, Stack, Box, Menu } from "@chakra-ui/react";
import { Folder, File, MoreVertical, Eye, Download, Link, Trash2 } from "lucide-react";
import { FileThumbnail } from "./FileThumbnail";

import { StorageItem } from "./types";

const isImageFile = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext || "");
};

interface ListViewProps {
  items: StorageItem[];
  activeConnectionId: string;
  getSigningMutation: any;
  setPath: (path: string) => void;
  getFormatSize: (bytes: number) => string;
  handlePreview: (item: StorageItem) => void;
  handleDownload: (item: StorageItem) => void;
  handleCopyLink: (item: StorageItem) => void;
  setDeleteItem: (item: StorageItem) => void;
}

export function ListView({
  items,
  activeConnectionId,
  getSigningMutation,
  setPath,
  getFormatSize,
  handlePreview,
  handleDownload,
  handleCopyLink,
  setDeleteItem,
}: ListViewProps) {
  return (
    <Stack gap={0} divideY="1px" divideColor="border.subtle">
      {items.map((item) => (
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
                <FileThumbnail item={item} connectionId={activeConnectionId} getSigningMutation={getSigningMutation} />
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
  );
}
