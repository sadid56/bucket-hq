"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Input, Stack, Text, Heading } from "@chakra-ui/react";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster";

export function ResetPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toaster.create({
        title: "Please enter your email address",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) throw error;

      toaster.create({
        title: "Reset link sent!",
        description: "Please check your inbox for instructions to restore access.",
        type: "success",
      });

      router.push("/login");
    } catch (err: any) {
      toaster.create({
        title: err.message || "Failed to send reset link",
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
          Reset Password
        </Heading>
        <Text fontSize="sm" color="fg.muted" textAlign="center">
          Enter your email to receive a recovery link
        </Text>

        <form onSubmit={handleReset}>
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

            <Button
              type="submit"
              colorPalette="teal"
              loading={loading}
              width="100%"
              mt={2}
            >
              Send Reset Link
            </Button>
          </Stack>
        </form>

        <Button
          variant="plain"
          size="xs"
          colorPalette="teal"
          onClick={() => router.push("/login")}
          alignSelf="center"
        >
          Back to Login
        </Button>
      </Stack>
    </Box>
  );
}
