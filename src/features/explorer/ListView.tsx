"use client";

import { Flex, Text, Button, Stack, Box, Menu } from "@chakra-ui/react";
import { Folder, File, MoreVertical, Eye, Download, Link, Trash2, Image as ImageIcon } from "lucide-react";

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
    <Stack gap={0} divideY='1px' divideColor='border.subtle'>
      {items.map((item) => (
        <Flex key={item.key} p={3.5} align='center' justify='space-between' _hover={{ bg: "bg.muted" }} transition='background 0.15s'>
          {/* Item Title & Type */}
          <Flex
            align='center'
            gap={3}
            cursor={item.type === "folder" || isImageFile(item.name) ? "pointer" : "default"}
            onClick={() => {
              if (item.type === "folder") {
                setPath(item.key);
              } else if (isImageFile(item.name)) {
                handlePreview(item);
              }
            }}
            flex='1'
          >
            {item.type === "folder" ? (
              <Folder size={20} color='var(--chakra-colors-teal-500)' fill='var(--chakra-colors-teal-500)' />
            ) : isImageFile(item.name) ? (
              <ImageIcon size={20} color='var(--chakra-colors-teal-500)' />
            ) : (
              <File size={20} color='var(--chakra-colors-fg-muted)' />
            )}
            <Text fontWeight='medium' fontSize='sm'>
              {item.name}
            </Text>
          </Flex>

          {/* Meta stats & Actions */}
          <Flex align='center' gap={6}>
            {item.type === "file" && (
              <Text fontSize='xs' color='fg.muted'>
                {getFormatSize(item.size)}
              </Text>
            )}

            <Menu.Root>
              <Menu.Trigger asChild>
                <Button
                  size='xs'
                  variant='ghost'
                  px={2}
                  css={{
                    "&[data-state=open]": {
                      borderColor: "var(--chakra-colors-teal-400, #38b2ac) !important",
                      boxShadow: "0 0 0 1px var(--chakra-colors-teal-400, #38b2ac), 0 0 12px rgba(56, 178, 172, 0.35) !important",
                      color: "var(--chakra-colors-teal-400, #38b2ac)",
                    },
                  }}
                >
                  <MoreVertical size={16} />
                </Button>
              </Menu.Trigger>
              <Menu.Positioner style={{ zIndex: 2200 }}>
                <Menu.Content
                  style={{
                    background: "#18202c",
                    border: "1.5px solid var(--chakra-colors-teal-500, #319795)",
                    borderRadius: "10px",
                    boxShadow:
                      "0 0 0 1px rgba(56, 178, 172, 0.25), 0 20px 40px -5px rgba(0, 0, 0, 0.95), 0 10px 20px -5px rgba(0, 0, 0, 0.8)",
                    padding: "6px",
                    marginTop: "6px",
                    zIndex: 2200,
                    minWidth: "160px",
                    overflow: "hidden",
                  }}
                >
                  {item.type === "file" && (
                    <>
                      {isImageFile(item.name) && (
                        <Menu.Item
                          value='preview'
                          onClick={() => handlePreview(item)}
                          style={{
                            maxWidth: "100%",
                            borderRadius: "6px",
                            padding: "8px 12px",
                            margin: "2px 0",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "13px",
                            color: "var(--chakra-colors-fg)",
                          }}
                          css={{
                            "&[data-highlighted], &:hover": {
                              background: "rgba(255, 255, 255, 0.08) !important",
                              color: "#fff !important",
                            },
                          }}
                        >
                          <Eye size={14} />
                          <span>Preview / Open</span>
                        </Menu.Item>
                      )}
                      <Menu.Item
                        value='download'
                        onClick={() => handleDownload(item)}
                        style={{
                          maxWidth: "100%",
                          borderRadius: "6px",
                          padding: "8px 12px",
                          margin: "2px 0",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "13px",
                          color: "var(--chakra-colors-fg)",
                        }}
                        css={{
                          "&[data-highlighted], &:hover": {
                            background: "rgba(255, 255, 255, 0.08) !important",
                            color: "#fff !important",
                          },
                        }}
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </Menu.Item>
                      <Menu.Item
                        value='copy'
                        onClick={() => handleCopyLink(item)}
                        style={{
                          maxWidth: "100%",
                          borderRadius: "6px",
                          padding: "8px 12px",
                          margin: "2px 0",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "13px",
                          color: "var(--chakra-colors-fg)",
                        }}
                        css={{
                          "&[data-highlighted], &:hover": {
                            background: "rgba(255, 255, 255, 0.08) !important",
                            color: "#fff !important",
                          },
                        }}
                      >
                        <Link size={14} />
                        <span>Copy Link</span>
                      </Menu.Item>
                    </>
                  )}
                  <Menu.Item
                    value='delete'
                    color='red.400'
                    onClick={() => setDeleteItem(item)}
                    style={{
                      maxWidth: "100%",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      margin: "2px 0",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                    }}
                    css={{
                      "&[data-highlighted], &:hover": {
                        background: "rgba(239, 68, 68, 0.15) !important",
                        color: "#f87171 !important",
                      },
                    }}
                  >
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
