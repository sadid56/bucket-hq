"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Flex, Heading, Button, Stack, Text, Avatar } from "@chakra-ui/react";
import { Logo } from "@/components/shared/Logo";
import { Menu, X, LogOut, LayoutDashboard, Settings, User as UserIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { label: "Docs", href: "/docs" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

interface NavbarProps {
  user: User | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const email = user?.email || "";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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

          {user ? (
            <Box position="relative" ref={dropdownRef}>
              {/* Avatar Trigger */}
              <Box
                as="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                borderRadius="full"
                p="2px"
                border="2px solid"
                borderColor={dropdownOpen ? "teal.400" : "transparent"}
                transition="border-color 0.2s"
                cursor="pointer"
                _hover={{ borderColor: "teal.400/50" }}
                aria-label="Account menu"
              >
                <Avatar.Root size="sm" colorPalette="teal">
                  {avatarUrl && <Avatar.Image src={avatarUrl} />}
                  <Avatar.Fallback>{initials}</Avatar.Fallback>
                </Avatar.Root>
              </Box>

              {/* Google-style Dropdown */}
              {dropdownOpen && (
                <Box
                  position="absolute"
                  top="calc(100% + 12px)"
                  right={0}
                  w="320px"
                  bg="bg.panel"
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor="border.subtle"
                  shadow="lg"
                  overflow="hidden"
                  zIndex={200}
                  animation="fadeIn 0.15s ease-out"
                >
                  {/* Profile Header */}
                  <Flex direction="column" align="center" pt={6} pb={4} px={5}>
                    <Avatar.Root size="xl" colorPalette="teal" mb={3}>
                      {avatarUrl && <Avatar.Image src={avatarUrl} />}
                      <Avatar.Fallback fontSize="lg">{initials}</Avatar.Fallback>
                    </Avatar.Root>
                    <Text fontWeight="semibold" fontSize="md" color="fg.default">
                      {displayName}
                    </Text>
                    <Text fontSize="xs" color="fg.muted" mt={0.5}>
                      {email}
                    </Text>
                  </Flex>

                  {/* Divider */}
                  <Box h="1px" bg="border.subtle" />

                  {/* Menu Items */}
                  <Stack gap={0} py={1.5}>
                    <Link href="/dashboard" onClick={() => setDropdownOpen(false)}>
                      <Flex
                        align="center"
                        gap={3}
                        px={5}
                        py={2.5}
                        _hover={{ bg: "bg.subtle" }}
                        transition="background 0.15s"
                        cursor="pointer"
                      >
                        <LayoutDashboard size={16} />
                        <Text fontSize="sm">Dashboard</Text>
                      </Flex>
                    </Link>
                    <Link href="/dashboard/settings" onClick={() => setDropdownOpen(false)}>
                      <Flex
                        align="center"
                        gap={3}
                        px={5}
                        py={2.5}
                        _hover={{ bg: "bg.subtle" }}
                        transition="background 0.15s"
                        cursor="pointer"
                      >
                        <Settings size={16} />
                        <Text fontSize="sm">Settings</Text>
                      </Flex>
                    </Link>
                    <Link href="/dashboard" onClick={() => setDropdownOpen(false)}>
                      <Flex
                        align="center"
                        gap={3}
                        px={5}
                        py={2.5}
                        _hover={{ bg: "bg.subtle" }}
                        transition="background 0.15s"
                        cursor="pointer"
                      >
                        <UserIcon size={16} />
                        <Text fontSize="sm">Profile</Text>
                      </Flex>
                    </Link>
                  </Stack>

                  {/* Divider */}
                  <Box h="1px" bg="border.subtle" />

                  {/* Sign Out */}
                  <Box py={1.5}>
                    <Flex
                      as="button"
                      align="center"
                      gap={3}
                      px={5}
                      py={2.5}
                      w="100%"
                      _hover={{ bg: "bg.subtle" }}
                      transition="background 0.15s"
                      cursor="pointer"
                      onClick={handleSignOut}
                    >
                      <LogOut size={16} />
                      <Text fontSize="sm">Sign out</Text>
                    </Flex>
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Flex gap={3}>
              <Button asChild size="sm" variant="ghost">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" colorPalette="teal">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </Flex>
          )}
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

          {user ? (
            <Stack gap={3} pt={2}>
              <Flex align="center" gap={2.5} py={1}>
                <Avatar.Root size="xs" colorPalette="teal">
                  {avatarUrl && <Avatar.Image src={avatarUrl} />}
                  <Avatar.Fallback>{initials}</Avatar.Fallback>
                </Avatar.Root>
                <Stack gap={0}>
                  <Text fontSize="sm" fontWeight="medium">
                    {displayName}
                  </Text>
                  <Text fontSize="2xs" color="fg.muted">
                    {email}
                  </Text>
                </Stack>
              </Flex>
              <Flex gap={3}>
                <Button asChild size="sm" colorPalette="teal" flex="1">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  flex="1"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </Flex>
            </Stack>
          ) : (
            <Flex gap={3} pt={2}>
              <Button asChild size="sm" variant="ghost" flex="1">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" colorPalette="teal" flex="1">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </Flex>
          )}
        </Stack>
      )}
    </Box>
  );
}
