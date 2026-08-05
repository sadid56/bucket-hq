import React from "react";
import type { Metadata } from "next";
import { Box, Text, Heading, Stack } from "@chakra-ui/react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for BucketHQ — Our rules and terms for using the platform.",
};

export default function TermsPage() {
  return (
    <Box py={{ base: 16, md: 24 }}>
      <Box maxW="3xl" mx="auto" px={{ base: 4, md: 8 }}>
        <Stack gap={8}>
          <Stack gap={3}>
            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color="teal.500">
              Legal
            </Text>
            <Heading as="h1" size={{ base: "2xl", md: "3xl" }} fontWeight="black">
              Terms of Service
            </Heading>
            <Text fontSize="sm" color="fg.muted">
              Last updated: August 5, 2026
            </Text>
          </Stack>

          <Box bg="bg.panel" p={{ base: 6, md: 10 }} borderRadius="2xl" borderWidth="1px" borderColor="border.subtle">
            <Stack gap={6} fontSize="sm" lineHeight="tall" color="fg.muted">
              <Text>
                Welcome to BucketHQ. By accessing or using our platform, you agree to comply with and be bound by the following Terms of Service.
              </Text>

              <Heading as="h2" size="sm" color="fg" fontWeight="bold" mt={4}>
                1. Acceptance of Terms
              </Heading>
              <Text>
                By creating an account, accessing, or using BucketHQ, you agree to these Terms of Service. If you do not agree, you must not access or use our services.
              </Text>

              <Heading as="h2" size="sm" color="fg" fontWeight="bold" mt={4}>
                2. Accounts and Security
              </Heading>
              <Text>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use or security breach.
              </Text>

              <Heading as="h2" size="sm" color="fg" fontWeight="bold" mt={4}>
                3. Acceptable Use
              </Heading>
              <Text>
                You agree to use BucketHQ only for lawful purposes. You must not use the service to transmit malware, violate third-party intellectual property, or engage in abusive, harassing, or malicious behavior.
              </Text>

              <Heading as="h2" size="sm" color="fg" fontWeight="bold" mt={4}>
                4. Disclaimer of Warranties
              </Heading>
              <Text>
                BucketHQ is provided on an &quot;as is&quot; and &quot;as available&quot; basis, without warranty of any kind. We do not guarantee that the service will be uninterrupted, error-free, or completely secure.
              </Text>

              <Heading as="h2" size="sm" color="fg" fontWeight="bold" mt={4}>
                5. Limitation of Liability
              </Heading>
              <Text>
                To the maximum extent permitted by law, BucketHQ and its operators shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our service.
              </Text>

              <Heading as="h2" size="sm" color="fg" fontWeight="bold" mt={4}>
                6. Changes to Terms
              </Heading>
              <Text>
                We reserve the right to modify these Terms of Service at any time. Your continued use of the platform following the posting of changes constitutes acceptance of the new terms.
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
