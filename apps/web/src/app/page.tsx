"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Flex, Text, Button, Heading, Stack, Skeleton } from "@chakra-ui/react";
import { supabase } from "@/lib/supabase";
import { Logo } from "@/components/shared/Logo";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace("/dashboard");
      } else {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <Flex height="100vh" direction="column" bg="bg.canvas">
        <Flex p={5} justify="space-between" align="center" borderBottomWidth="1px" borderColor="border.subtle" bg="bg.panel">
          <Skeleton height="32px" width="120px" />
          <Flex gap={3}>
            <Skeleton height="32px" width="80px" />
            <Skeleton height="32px" width="100px" />
          </Flex>
        </Flex>
        <Flex flex="1" direction="column" align="center" justify="center" px={6} textAlign="center" gap={6}>
          <Skeleton height="48px" width="300px" />
          <Skeleton height="20px" width="500px" />
          <Skeleton height="40px" width="160px" />
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex minHeight="100vh" direction="column" bg="bg.canvas" color="fg">
      {/* Header NavBar */}
      <Flex p={5} justify="space-between" align="center" borderBottomWidth="1px" borderColor="border.subtle" bg="bg.panel">
        <Flex align="center" gap={2}>
          <Logo size={22} />
          <Heading size="md" color="teal.500" fontWeight="black" letterSpacing="tight">
            BucketHQ
          </Heading>
        </Flex>
        <Flex gap={3}>
          <Button size="sm" variant="ghost" onClick={() => router.push("/auth/login")}>
            Sign In
          </Button>
          <Button size="sm" colorPalette="teal" onClick={() => router.push("/auth/signup")}>
            Get Started
          </Button>
        </Flex>
      </Flex>

      {/* Hero Section */}
      <Flex flex="1" direction="column" align="center" justify="center" px={4} py={12} textAlign="center">
        <Stack gap={6} maxW="2xl" align="center">
          <Badge colorPalette="teal" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="semibold">
            Unified Storage Control Panel
          </Badge>
          <Heading size="3xl" fontWeight="black" lineHeight="tight" letterSpacing="tight">
            Manage your S3, R2, and Cloudinary buckets in{" "}
            <Text as="span" color="teal.500">
              One Workspace
            </Text>
          </Heading>
          <Text fontSize="lg" color="fg.muted">
            Connect your own cloud providers once. Broker file access securely via short-lived pre-signed URLs. BucketHQ never relays your binary data, keeping file transfers lightning fast.
          </Text>
          <Stack direction={{ base: "column", sm: "row" }} gap={4} mt={2} width={{ base: "100%", sm: "auto" }}>
            <Button size="lg" colorPalette="teal" px={8} onClick={() => router.push("/auth/signup")}>
              Create Free Account
            </Button>
            <Button size="lg" variant="outline" px={8} onClick={() => router.push("/auth/login")}>
              Console Login
            </Button>
          </Stack>
        </Stack>
      </Flex>
    </Flex>
  );
}

import { Badge } from "@chakra-ui/react";
