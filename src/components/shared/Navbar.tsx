"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Box, Flex, Heading, Button, Stack, Text } from "@chakra-ui/react";
import { Logo } from "@/components/shared/Logo";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Docs", href: "/docs" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={100}
      bg="bg.canvas/80"
      backdropFilter="blur(12px)"
      borderBottomWidth="1px"
      borderColor="border.subtle"
    >
      <Flex
        maxW="7xl"
        mx="auto"
        px={{ base: 4, md: 8 }}
        py={4}
        align="center"
        justify="space-between"
      >
        {/* Logo */}
        <Link href="/">
          <Flex align="center" gap={2} cursor="pointer">
            <Logo size={24} />
            <Heading size="md" color="teal.500" fontWeight="black" letterSpacing="tight">
              BucketHQ
            </Heading>
          </Flex>
        </Link>

        {/* Desktop Nav */}
        <Flex align="center" gap={8} display={{ base: "none", md: "flex" }}>
          <Flex gap={6}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color="fg.muted"
                  _hover={{ color: "teal.400" }}
                  transition="color 0.2s"
                  cursor="pointer"
                >
                  {link.label}
                </Text>
              </Link>
            ))}
          </Flex>
          <Flex gap={3}>
            <Button asChild size="sm" variant="ghost">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" colorPalette="teal">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </Flex>
        </Flex>

        {/* Mobile Toggle */}
        <Button
          variant="ghost"
          size="sm"
          display={{ base: "flex", md: "none" }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </Flex>

      {/* Mobile Menu */}
      {mobileOpen && (
        <Stack
          px={4}
          pb={5}
          gap={3}
          display={{ base: "flex", md: "none" }}
          borderTopWidth="1px"
          borderColor="border.subtle"
        >
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Text
                fontSize="sm"
                fontWeight="medium"
                color="fg.muted"
                py={2}
                _hover={{ color: "teal.400" }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Text>
            </Link>
          ))}
          <Flex gap={3} pt={2}>
            <Button asChild size="sm" variant="ghost" flex="1">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" colorPalette="teal" flex="1">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </Flex>
        </Stack>
      )}
    </Box>
  );
}
