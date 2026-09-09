"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, Stack, Text, Heading, Flex, Center } from "@chakra-ui/react";
import { TextField } from "@/components/ui/text-field";
import { useGetMe, useUpdateProfile } from "@/react-query/users/actions";
import { toaster } from "@/components/ui/toaster";

export default function ProfilePage() {
  const { data: user, isLoading: loadingUser } = useGetMe();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setImage(user.image || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toaster.create({
        title: "Name is required",
        type: "error",
      });
      return;
    }

    updateProfile.mutate(
      { name: name.trim(), image: image.trim() || undefined },
      {
        onSuccess: () => {
          toaster.create({
            title: "Profile updated successfully",
            type: "success",
          });
        },
      }
    );
  };

  if (loadingUser) {
    return (
      <Center h="200px">
        <Text color="fg.muted">Loading profile details...</Text>
      </Center>
    );
  }

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <Stack gap={6} maxW="xl">
      <Stack gap={1}>
        <Heading size="lg" fontWeight="bold">User Profile</Heading>
        <Text fontSize="sm" color="fg.muted">Manage your personal settings, display name, and avatar</Text>
      </Stack>

      <Box bg="bg.panel" p={6} borderRadius="lg" borderWidth="1px" shadow="sm">
        <form onSubmit={handleSubmit}>
          <Stack gap={6}>
            {/* Avatar Preview Section */}
            <Flex align="center" gap={5}>
              {image ? (
                <Box
                  w={16}
                  h={16}
                  borderRadius="full"
                  bg="teal.500"
                  overflow="hidden"
                  borderWidth="2px"
                  borderColor="teal.500"
                >
                  <img
                    src={image}
                    alt={name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </Box>
              ) : (
                <Center w={16} h={16} borderRadius="full" bg="teal.500" borderWidth="2px" borderColor="teal.500">
                  <Text color="white" fontWeight="bold" fontSize="2xl">
                    {initials}
                  </Text>
                </Center>
              )}
              <Stack gap={0.5}>
                <Text fontWeight="semibold" fontSize="md">{name || "Your Name"}</Text>
                <Text color="fg.muted" fontSize="xs">{user?.email}</Text>
              </Stack>
            </Flex>

            {/* Form Fields */}
            <Stack gap={4}>
              <TextField
                label={<Text fontSize="xs" fontWeight="semibold" color="fg.muted">Display Name</Text>}
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <TextField
                label={<Text fontSize="xs" fontWeight="semibold" color="fg.muted">Avatar Image URL</Text>}
                placeholder="e.g. https://example.com/avatar.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </Stack>

            <Button
              type="submit"
              colorPalette="teal"
              loading={updateProfile.isPending}
              alignSelf="flex-start"
            >
              Save Changes
            </Button>
          </Stack>
        </form>
      </Box>
    </Stack>
  );
}
