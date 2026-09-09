import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Box, Flex, Text, Button, Heading, Stack, SimpleGrid, Center } from "@chakra-ui/react";

import { Zap, Shield, Globe, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about BucketHQ — the unified cloud storage management platform built for modern teams.",
};

const values = [
  {
    icon: <Zap size={24} />,
    title: "Speed First",
    description:
      "BucketHQ never proxies your file data. Pre-signed URLs let your browser talk directly to the storage provider, keeping transfers as fast as the provider allows.",
  },
  {
    icon: <Shield size={24} />,
    title: "Security by Default",
    description:
      "Every credential is encrypted with AES-256-GCM before hitting the database. Raw keys only exist in volatile process memory for the brief moment they're needed.",
  },
  {
    icon: <Globe size={24} />,
    title: "Provider Agnostic",
    description:
      "AWS S3, Cloudflare R2, Cloudinary — manage them all from one workspace. No vendor lock-in, no proprietary formats.",
  },
];

export default function AboutPage() {
  return (
    <>

      {/* Hero */}
      <Box py={{ base: 16, md: 24 }}>
        <Stack maxW="3xl" mx="auto" px={{ base: 4, md: 8 }} gap={6} textAlign="center" align="center">
          <Heading as="h1" size={{ base: "2xl", md: "3xl" }} fontWeight="black" lineHeight="tight">
            Built for teams who work with{" "}
            <Text as="span" color="teal.400">
              multiple cloud providers
            </Text>
          </Heading>
          <Text fontSize={{ base: "md", md: "lg" }} color="fg.muted" maxW="2xl" lineHeight="tall">
            BucketHQ is a unified storage management platform that lets you connect, browse, and share files across
            AWS S3, Cloudflare R2, and Cloudinary — all from a single dashboard.
          </Text>
        </Stack>
      </Box>

      {/* Mission */}
      <Box py={{ base: 12, md: 20 }} bg="bg.panel">
        <Box maxW="4xl" mx="auto" px={{ base: 4, md: 8 }}>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={10} alignItems="center">
            <Stack gap={5}>
              <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color="teal.500">
                Our Mission
              </Text>
              <Heading as="h2" size={{ base: "lg", md: "xl" }} fontWeight="bold">
                Simplify cloud storage without compromising security
              </Heading>
              <Text fontSize="sm" color="fg.muted" lineHeight="tall">
                Managing files across multiple cloud providers shouldn&apos;t require switching between dashboards, 
                remembering different APIs, or compromising on security. BucketHQ gives your team one place to 
                manage everything — with enterprise-grade encryption and granular access controls built in.
              </Text>
            </Stack>
            <Box
              bg="bg.canvas"
              p={8}
              borderRadius="xl"
              borderWidth="1px"
              borderColor="border.subtle"
            >
              <Stack gap={4}>
                <Flex justify="space-between" align="baseline">
                  <Text fontSize="sm" fontWeight="medium">Providers Supported</Text>
                  <Text fontSize="2xl" fontWeight="black" color="teal.400">3</Text>
                </Flex>
                <Flex justify="space-between" align="baseline">
                  <Text fontSize="sm" fontWeight="medium">Encryption Standard</Text>
                  <Text fontSize="sm" fontWeight="bold" color="teal.400">AES-256-GCM</Text>
                </Flex>
                <Flex justify="space-between" align="baseline">
                  <Text fontSize="sm" fontWeight="medium">Data Proxy</Text>
                  <Text fontSize="sm" fontWeight="bold" color="teal.400">Zero — Direct URLs</Text>
                </Flex>
                <Flex justify="space-between" align="baseline">
                  <Text fontSize="sm" fontWeight="medium">Open Source</Text>
                  <Text fontSize="sm" fontWeight="bold" color="teal.400">Yes</Text>
                </Flex>
              </Stack>
            </Box>
          </SimpleGrid>
        </Box>
      </Box>

      {/* Values */}
      <Box py={{ base: 16, md: 24 }}>
        <Box maxW="5xl" mx="auto" px={{ base: 4, md: 8 }}>
          <Stack gap={3} textAlign="center" mb={{ base: 10, md: 14 }}>
            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color="teal.500">
              Principles
            </Text>
            <Heading as="h2" size={{ base: "xl", md: "2xl" }} fontWeight="black">
              What drives us
            </Heading>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
            {values.map((v) => (
              <Stack key={v.title} gap={4} align="center" textAlign="center">
                <Center w={14} h={14} borderRadius="xl" bg="teal.500/10" color="teal.400">
                  {v.icon}
                </Center>
                <Heading as="h3" size="sm" fontWeight="bold">{v.title}</Heading>
                <Text fontSize="sm" color="fg.muted" lineHeight="tall">{v.description}</Text>
              </Stack>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* Tech Stack */}
      <Box py={{ base: 12, md: 16 }} bg="bg.panel">
        <Box maxW="3xl" mx="auto" px={{ base: 4, md: 8 }} textAlign="center">
          <Stack gap={5} align="center">
            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color="teal.500">
              Tech Stack
            </Text>
            <Heading as="h2" size="lg" fontWeight="bold">Built with modern tools</Heading>
            <Text fontSize="sm" color="fg.muted" lineHeight="tall" maxW="xl">
              Next.js · Hono · Prisma · PostgreSQL · Supabase Auth · Chakra UI · React Query · TypeScript
            </Text>
          </Stack>
        </Box>
      </Box>

      {/* CTA */}
      <Box py={{ base: 16, md: 20 }}>
        <Box maxW="3xl" mx="auto" px={{ base: 4, md: 8 }} textAlign="center">
          <Stack gap={5} align="center">
            <Heading as="h2" size={{ base: "lg", md: "xl" }} fontWeight="black">
              Want to try BucketHQ?
            </Heading>
            <Text fontSize="md" color="fg.muted">Create a free account and start managing your buckets today.</Text>
            <Button asChild size="lg" colorPalette="teal" px={8}>
              <Link href="/auth/signup">
                Get Started <ArrowRight size={16} />
              </Link>
            </Button>
          </Stack>
        </Box>
      </Box>

    </>
  );
}
