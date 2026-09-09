"use client";

import React from "react";
import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster";

interface SocialLoginProps {
  mode?: "login" | "signup";
}

export function SocialLogin({ mode = "login" }: SocialLoginProps) {
  const handleOAuthLogin = async (provider: "google" | "github") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toaster.create({
        title: `Failed to ${mode === "login" ? "log in" : "sign up"} with ${provider === "google" ? "Google" : "GitHub"}`,
        description: err.message,
        type: "error",
      });
    }
  };

  return (
    <Stack gap={4} width="100%">
      <Flex align="center" my={2}>
        <Box flex="1" height="1px" bg="border.subtle" />
        <Text px={3} fontSize="xs" color="fg.muted">
          or continue with
        </Text>
        <Box flex="1" height="1px" bg="border.subtle" />
      </Flex>

      <Flex gap={4} width="100%">
        <Button
          variant="outline"
          flex="1"
          onClick={() => handleOAuthLogin("google")}
          type="button"
        >
          <FcGoogle /> Google
        </Button>
        <Button
          variant="outline"
          flex="1"
          onClick={() => handleOAuthLogin("github")}
          type="button"
        >
          <FaGithub /> GitHub
        </Button>
      </Flex>
    </Stack>
  );
}
