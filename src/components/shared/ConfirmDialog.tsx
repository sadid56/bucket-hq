"use client";

import React from "react";
import { Button, Stack, Box, Text } from "@chakra-ui/react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      inset={0}
      bg="rgba(0, 0, 0, 0.4)"
      backdropFilter="blur(4px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1500}
    >
      <Stack
        bg="bg.panel"
        p={6}
        borderRadius="lg"
        borderWidth="1px"
        borderColor="border.subtle"
        shadow="xl"
        width="90%"
        maxWidth="md"
        gap={4}
      >
        <Text fontSize="lg" fontWeight="bold">
          {title}
        </Text>
        <Text color="fg.muted">
          {message}
        </Text>
        <Stack direction="row" justify="flex-end" gap={3} mt={2}>
          <Button size="sm" variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button size="sm" colorPalette="red" loading={isLoading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
