import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Box, Flex, Text, Heading, Stack, Badge, Code } from "@chakra-ui/react";

import {
  BookOpen,
  KeyRound,
  FolderOpen,
  Users,
  Shield,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Learn how to configure cloud storage connections, manage files, and collaborate with your team using BucketHQ.",
};

interface DocSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  content: {
    heading: string;
    text: string;
    code?: string;
  }[];
}

const sections: DocSection[] = [
  {
    id: "getting-started",
    icon: <BookOpen size={22} />,
    title: "Getting Started",
    content: [
      {
        heading: "1. Create an Account",
        text: "Sign up at BucketHQ using your email, Google, or GitHub account. After registration, a default workspace is automatically created for you.",
      },
      {
        heading: "2. Create a Workspace",
        text: "A workspace is an isolated environment where you manage storage connections, invite team members, and organize files. You can create multiple workspaces from the sidebar.",
      },
      {
        heading: "3. Navigate the Dashboard",
        text: "The Console Dashboard shows your active workspace statistics: total connections, S3 buckets, R2 buckets, and Cloudinary accounts. Use the sidebar to access all features.",
      },
    ],
  },
  {
    id: "configuring-connections",
    icon: <KeyRound size={22} />,
    title: "Configuring Connections",
    content: [
      {
        heading: "Adding an AWS S3 Connection",
        text: "Go to Connections → Add Connection. Select \"AWS S3\" as the provider. Enter your Access Key ID, Secret Access Key, and the S3 Bucket Name. Optionally specify a Region (defaults to us-east-1). Click Save — your credentials are encrypted immediately with AES-256-GCM.",
        code: "Access Key ID:     AKIA...\nSecret Access Key:  wJalrXU...\nBucket Name:        my-company-assets\nRegion:             us-east-1",
      },
      {
        heading: "Adding a Cloudflare R2 Connection",
        text: "Select \"Cloudflare R2\" as the provider. Enter your R2 Access Key ID, Secret Access Key, and Bucket Name. The R2 Account ID is required to construct the endpoint URL. BucketHQ automatically configures the S3-compatible endpoint.",
        code: "Access Key ID:     your-r2-access-key\nSecret Access Key:  your-r2-secret\nBucket Name:        my-r2-bucket\nAccount ID:         your-cloudflare-account-id",
      },
      {
        heading: "Adding a Cloudinary Connection",
        text: "Select \"Cloudinary\" as the provider. Enter your Cloud Name, API Key, and API Secret. These can be found in your Cloudinary dashboard under Settings → Access Keys.",
        code: "Cloud Name:  my-cloud\nAPI Key:     123456789012345\nAPI Secret:  your-api-secret",
      },
    ],
  },
  {
    id: "file-explorer",
    icon: <FolderOpen size={22} />,
    title: "Using the File Explorer",
    content: [
      {
        heading: "Browsing Files",
        text: "Navigate to File Explorer from the sidebar. Select a connection from the dropdown. You can browse folders, switch between grid and list views, and use the breadcrumb navigation to traverse the directory tree.",
      },
      {
        heading: "Uploading Files",
        text: "Click the \"Upload\" button or use the \"+ New\" dropdown menu. Select files from your device. BucketHQ generates a pre-signed upload URL and your browser uploads directly to the storage provider — the file never passes through BucketHQ servers.",
      },
      {
        heading: "Downloading & Pre-Signed URLs",
        text: "Click the download icon on any file to generate a short-lived pre-signed URL. These URLs expire automatically (typically in 1 hour) and can be shared with anyone who needs temporary access.",
      },
      {
        heading: "Creating Folders",
        text: "Use the \"+ New\" dropdown and select \"New Folder\". Enter a folder name and it will be created as a prefix in your bucket.",
      },
    ],
  },
  {
    id: "team-management",
    icon: <Users size={22} />,
    title: "Team Management",
    content: [
      {
        heading: "Inviting Members",
        text: "Go to Team Management in the sidebar. Click \"Invite Member\" and enter the user's email address. They will receive an invitation to join your workspace.",
      },
      {
        heading: "Roles & Permissions",
        text: "Each workspace member has a role: Owner (full control), Admin (manage members and connections), or Member (browse and upload files). Owners can change member roles from the Team Management page.",
      },
      {
        heading: "Path Restrictions",
        text: "Restrict team members to specific folder paths within a connection. This ensures that members can only access files within their assigned directories.",
      },
    ],
  },
  {
    id: "security",
    icon: <Shield size={22} />,
    title: "Security & API Keys",
    content: [
      {
        heading: "Credential Encryption",
        text: "All storage credentials (access keys, secrets, API keys) are encrypted at rest using AES-256-GCM symmetric encryption. The encryption key is stored as an environment variable on the server and never exposed to the client.",
      },
      {
        heading: "How Keys Are Stored",
        text: "When you save a connection, BucketHQ encrypts your credentials before writing them to the database. When a file operation is requested, credentials are decrypted briefly in server memory, used to generate a pre-signed URL, and immediately discarded. Raw keys never leave the server process.",
      },
      {
        heading: "Authentication",
        text: "BucketHQ uses Supabase Auth with support for email/password, Google OAuth, and GitHub OAuth. Sessions are managed via secure HTTP-only cookies with automatic refresh token rotation.",
      },
      {
        heading: "Audit Trail",
        text: "Every significant operation (file uploads, downloads, connection changes, member invitations) is logged with timestamps, user identity, and affected resources. Admins can view the full audit log from the admin panel.",
      },
    ],
  },
];

export default function DocsPage() {
  return (
    <>

      <Flex maxW="7xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 10, md: 16 }} gap={10} flex="1">
        {/* Sidebar TOC — Desktop only */}
        <Box
          as="aside"
          display={{ base: "none", lg: "block" }}
          minW="220px"
          position="sticky"
          top="80px"
          alignSelf="flex-start"
          maxH="calc(100vh - 100px)"
          overflowY="auto"
        >
          <Stack gap={1.5}>
            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="fg.muted" letterSpacing="wider" mb={2}>
              On This Page
            </Text>
            {sections.map((section) => (
              <Link key={section.id} href={`#${section.id}`}>
                <Text
                  fontSize="sm"
                  color="fg.muted"
                  _hover={{ color: "teal.400" }}
                  transition="color 0.2s"
                  py={1}
                  cursor="pointer"
                >
                  {section.title}
                </Text>
              </Link>
            ))}
          </Stack>
        </Box>

        {/* Main Content */}
        <Box flex="1" maxW="4xl">
          <Stack gap={3} mb={{ base: 8, md: 12 }}>
            <Badge colorPalette="teal" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="semibold" w="fit-content">
              Documentation
            </Badge>
            <Heading as="h1" size={{ base: "2xl", md: "3xl" }} fontWeight="black">
              BucketHQ Documentation
            </Heading>
            <Text fontSize="md" color="fg.muted">
              Everything you need to configure, manage, and secure your cloud storage with BucketHQ.
            </Text>
          </Stack>

          <Stack gap={14}>
            {sections.map((section) => (
              <Box key={section.id} id={section.id} scrollMarginTop="100px">
                <Flex align="center" gap={3} mb={6}>
                  <Box color="teal.400">{section.icon}</Box>
                  <Heading as="h2" size={{ base: "lg", md: "xl" }} fontWeight="bold">
                    {section.title}
                  </Heading>
                </Flex>

                <Stack gap={8}>
                  {section.content.map((item) => (
                    <Box key={item.heading}>
                      <Heading as="h3" size="sm" fontWeight="semibold" mb={2}>
                        {item.heading}
                      </Heading>
                      <Text fontSize="sm" color="fg.muted" lineHeight="tall" mb={item.code ? 3 : 0}>
                        {item.text}
                      </Text>
                      {item.code && (
                        <Box
                          bg="bg.panel"
                          borderWidth="1px"
                          borderColor="border.subtle"
                          borderRadius="lg"
                          p={4}
                          overflowX="auto"
                        >
                          <Code fontSize="xs" whiteSpace="pre" bg="transparent" color="teal.300">
                            {item.code}
                          </Code>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>

          {/* Bottom CTA */}
          <Box
            mt={16}
            p={8}
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border.subtle"
            borderRadius="xl"
            textAlign="center"
          >
            <Stack gap={4} align="center">
              <Heading as="h3" size="md" fontWeight="bold">
                Need more help?
              </Heading>
              <Text fontSize="sm" color="fg.muted">
                Reach out to our team or check the source code on GitHub.
              </Text>
              <Flex gap={3}>
                <Link href="/contact">
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color="teal.400"
                    _hover={{ textDecoration: "underline" }}
                    cursor="pointer"
                  >
                    Contact Support <ArrowRight size={14} style={{ display: "inline", verticalAlign: "middle" }} />
                  </Text>
                </Link>
              </Flex>
            </Stack>
          </Box>
        </Box>
      </Flex>

    </>
  );
}
