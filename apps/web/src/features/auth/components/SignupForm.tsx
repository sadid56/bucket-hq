"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Input, Stack, Text, Heading, Flex } from "@chakra-ui/react";
import { supabase } from "@/lib/supabase";
import { toaster } from "@/components/ui/toaster";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !orgName) {
      toaster.create({
        title: "Please fill in all fields",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) throw error;

      // Note: If Supabase has email confirmation enabled, data.session will be null.
      // We instruct the user to check their email.
      if (!data.session) {
        toaster.create({
          title: "Registration successful!",
          description: "Please check your inbox to verify your email address.",
          type: "success",
        });
        router.push("/login");
      } else {
        // User is auto-logged in. We create their default organization.
        // We'll call the API to create the organization using their session token.
        const token = data.session.access_token;
        const orgRes = await fetch("http://localhost:4000/api/organizations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: orgName }),
        }).then((res) => res.json());

        if (orgRes.error) {
          throw new Error(orgRes.message || "Failed to create default organization");
        }

        if (orgRes.data?.id) {
          localStorage.setItem("active_organization_id", orgRes.data.id);
        }

        toaster.create({
          title: "Account created successfully",
          type: "success",
        });

        router.push("/dashboard");
      }
    } catch (err: any) {
      toaster.create({
        title: err.message || "Failed to sign up",
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
          Create Account
        </Heading>
        <Text fontSize="sm" color="fg.muted" textAlign="center">
          Get started with BucketHQ today
        </Text>

        <form onSubmit={handleSignup}>
          <Stack gap={4}>
            <Stack gap={1.5}>
              <Text fontSize="sm" fontWeight="medium">Full Name</Text>
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Stack>

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
              <Text fontSize="sm" fontWeight="medium">Default Organization Name</Text>
              <Input
                type="text"
                placeholder="My Agency / Company"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />
            </Stack>

            <Stack gap={1.5}>
              <Text fontSize="sm" fontWeight="medium">Password</Text>
              <Input
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </Stack>

            <Button
              type="submit"
              colorPalette="teal"
              loading={loading}
              width="100%"
              mt={2}
            >
              Get Started
            </Button>
          </Stack>
        </form>

        <Text fontSize="xs" color="fg.muted" textAlign="center">
          Already have an account?{" "}
          <Button
            variant="plain"
            size="xs"
            colorPalette="teal"
            onClick={() => router.push("/login")}
          >
            Log in
          </Button>
        </Text>
      </Stack>
    </Box>
  );
}
