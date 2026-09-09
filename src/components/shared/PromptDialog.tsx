"use client";

import React, { useState, useEffect } from "react";
import { Button, Stack, Box, Text, Input } from "@chakra-ui/react";

interface PromptDialogProps {
  isOpen: boolean;
  title: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function PromptDialog({
  isOpen,
  title,
  placeholder = "Enter value...",
  confirmLabel = "Submit",
  cancelLabel = "Cancel",
  isLoading,
  onConfirm,
  onCancel,
}: PromptDialogProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (isOpen) {
      setValue("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onConfirm(value.trim());
  };

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
        as="form"
        onSubmit={handleSubmit}
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
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          required
          autoFocus
        />
        <Stack direction="row" justify="flex-end" gap={3} mt={2}>
          <Button size="sm" variant="outline" onClick={onCancel} disabled={isLoading} type="button">
            {cancelLabel}
          </Button>
          <Button size="sm" colorPalette="teal" loading={isLoading} type="submit">
            {confirmLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
