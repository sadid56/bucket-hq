import React from "react";
import type { Metadata } from "next";
import { Box, Text, Heading, Stack } from "@chakra-ui/react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for BucketHQ — Learn how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <Box py={{ base: 16, md: 24 }}>
      <Box maxW="3xl" mx="auto" px={{ base: 4, md: 8 }}>
        <Stack gap={8}>
          <Stack gap={3}>
            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color="teal.500">
              Legal
            </Text>
            <Heading as="h1" size={{ base: "2xl", md: "3xl" }} fontWeight="black">
              Privacy Policy
            </Heading>
            <Text fontSize="sm" color="fg.muted">
              Last updated: August 5, 2026
            </Text>
          </Stack>

          <Box bg="bg.panel" p={{ base: 6, md: 10 }} borderRadius="2xl" borderWidth="1px" borderColor="border.subtle">
            <Stack gap={6} fontSize="sm" lineHeight="tall" color="fg.muted">
              <Text>
                At BucketHQ, we take your privacy and the security of your data extremely seriously. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
              </Text>

              <Heading as="h2" size="sm" color="fg" fontWeight="bold" mt={4}>
                1. Information We Collect
              </Heading>
              <Text>
                <strong>Account Information:</strong> When you register, we collect basic details such as your email address and profile information.
              </Text>
              <Text>
                <strong>API Credentials:</strong> To connect your storage buckets, you may provide AWS S3, Cloudflare R2, or Cloudinary credentials.
              </Text>
              <Text>
                <strong>Usage Data:</strong> We may collect logs and analytics data about platform interactions to help debug issues and improve services.
              </Text>

              <Heading as="h2" size="sm" color="fg" fontWeight="bold" mt={4}>
                2. Security and Encryption
              </Heading>
              <Text>
                We employ enterprise-grade security standards. All storage credentials (such as API keys and secret keys) are encrypted using AES-256-GCM before being stored in the database. Raw keys only exist in temporary volatile process memory when signing requests. We never proxy or store your actual file content; files are transferred directly between your browser and your storage providers.
              </Text>

              <Heading as="h2" size="sm" color="fg" fontWeight="bold" mt={4}>
                3. Cookies and Tracking
              </Heading>
              <Text>
                We use secure cookies for authentication, session management, and CSRF protection. You can control cookie preferences via browser settings.
              </Text>

              <Heading as="h2" size="sm" color="fg" fontWeight="bold" mt={4}>
                4. Sharing of Information
              </Heading>
              <Text>
                We do not sell, trade, or rent your personal information to third parties. We may share data with service providers who assist in operating our website and conducting our business, subject to strict confidentiality agreements.
              </Text>

              <Heading as="h2" size="sm" color="fg" fontWeight="bold" mt={4}>
                5. Contact Us
              </Heading>
              <Text>
                If you have any questions or concerns regarding this Privacy Policy, please reach out to us at support@buckethq.dev.
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
