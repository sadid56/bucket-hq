"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Input, Stack, Text, Heading, Field } from "@chakra-ui/react";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toaster.create({
        title: "Please fill in all fields",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toaster.create({
        title: "Logged in successfully",
        type: "success",
      });

      router.push("/dashboard");
    } catch (err: any) {
      toaster.create({
        title: err.message || "Failed to log in",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box w="100%" maxW="md" p={8} bg="bg.panel" borderRadius="lg" borderWidth="1px" shadow="md">
      <Stack gap={6}>
        <Heading size="xl" textAlign="center" color="teal.500" fontWeight="extrabold">
          BucketHQ
        </Heading>
        <Text fontSize="sm" color="fg.muted" textAlign="center">
          Log in to manage your unified cloud storage
        </Text>

        <form onSubmit={handleLogin}>
          <Stack gap={4}>
            <Stack gap={1.5}>
              <Text fontSize="sm" fontWeight="medium">Email Address</Text>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Stack>

            <Stack gap={1.5}>
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" fontWeight="medium">Password</Text>
                <Button
                  variant="plain"
                  size="xs"
                  colorPalette="teal"
                  onClick={() => router.push("/reset-password")}
                >
                  Forgot password?
                </Button>
              </Flex>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Stack>

            <Button
              type="submit"
              colorPalette="teal"
              loading={loading}
              width="100%"
              mt={2}
            >
              Sign In
            </Button>
          </Stack>
        </form>

        <Text fontSize="xs" color="fg.muted" textAlign="center">
          Don't have an account?{" "}
          <Button
            variant="plain"
            size="xs"
            colorPalette="teal"
            onClick={() => router.push("/signup")}
          >
            Create account
          </Button>
        </Text>
      </Stack>
    </Box>
  );
}

// Minimal inline Flex for layout since Field doesn't support easy space-between layout out of the box
import { Flex } from "@chakra-ui/react";
