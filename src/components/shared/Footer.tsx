import React from "react";
import Link from "next/link";
import { Box, Flex, Text, Stack, SimpleGrid, Heading } from "@chakra-ui/react";
import { Logo } from "@/components/shared/Logo";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Docs", href: "/docs" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <Box as="footer" borderTopWidth="1px" borderColor="border.subtle" bg="bg.panel">
      <Box maxW="7xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 10, md: 14 }}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={10}>
          {/* Brand */}
          <Stack gap={4}>
            <Flex align="center" gap={2}>
              <Logo size={20} />
              <Heading size="sm" color="teal.500" fontWeight="black">
                BucketHQ
              </Heading>
            </Flex>
            <Text fontSize="xs" color="fg.muted" lineHeight="tall">
              Unified cloud storage management for S3, R2, and Cloudinary. Secure, fast, and simple.
            </Text>
          </Stack>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <Stack key={category} gap={3}>
              <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="fg.muted" letterSpacing="wider">
                {category}
              </Text>
              {links.map((link) => (
                <Link key={link.label} href={link.href}>
                  <Text
                    fontSize="sm"
                    color="fg.muted"
                    _hover={{ color: "teal.400" }}
                    transition="color 0.2s"
                    cursor="pointer"
                  >
                    {link.label}
                  </Text>
                </Link>
              ))}
            </Stack>
          ))}
        </SimpleGrid>

        {/* Bottom Bar */}
        <Flex
          mt={10}
          pt={6}
          borderTopWidth="1px"
          borderColor="border.subtle"
          align="center"
          justify="space-between"
          direction={{ base: "column", sm: "row" }}
          gap={4}
        >
          <Text fontSize="xs" color="fg.muted">
            © {new Date().getFullYear()} BucketHQ. All rights reserved.
          </Text>
          <Flex gap={4}>
            <Link href="https://github.com" target="_blank">
              <Text fontSize="xs" color="fg.muted" _hover={{ color: "teal.400" }} cursor="pointer">
                GitHub
              </Text>
            </Link>
            <Link href="https://twitter.com" target="_blank">
              <Text fontSize="xs" color="fg.muted" _hover={{ color: "teal.400" }} cursor="pointer">
                Twitter
              </Text>
            </Link>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
