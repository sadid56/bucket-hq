"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Stack,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { Logo } from "@/components/shared/Logo";
import { acceptInvitationAction } from "@/actions/team";
import { toaster } from "@/components/ui/toaster";
import {
  LuMailCheck,
  LuShieldAlert,
  LuClock,
  LuUsers,
  LuArrowRight,
} from "react-icons/lu";

interface InviteAcceptClientProps {
  status: "valid" | "invalid" | "expired";
  token: string;
  orgName?: string;
  role?: string;
  inviterName?: string;
  inviterEmail?: string;
  inviteeEmail?: string;
  isAuthenticated?: boolean;
}

export function InviteAcceptClient({
  status,
  token,
  orgName,
  role,
  inviterName,
  inviteeEmail,
  isAuthenticated,
}: InviteAcceptClientProps) {
  const router = useRouter();
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const res = await acceptInvitationAction(token);
      if (res.error) {
        throw new Error(res.error);
      }
      toaster.create({
        title: `Welcome to ${orgName}!`,
        description: "You've successfully joined the workspace.",
        type: "success",
      });
      if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      toaster.create({
        title: err.message || "Failed to accept invitation",
        type: "error",
      });
      setAccepting(false);
    }
  };

  const roleLabel =
    role === "OWNER" ? "Owner" : role === "EDITOR" ? "Editor" : "Viewer";

  const roleColor =
    role === "OWNER" ? "orange" : role === "EDITOR" ? "blue" : "gray";

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="bg.canvas"
      p={{ base: 4, md: 8 }}
    >
      <Box
        maxW="480px"
        w="100%"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="border.subtle"
        bg="bg.panel"
        shadow="2xl"
        overflow="hidden"
      >
        {/* Header */}
        <Box
          px={8}
          pt={8}
          pb={6}
          borderBottomWidth="1px"
          borderColor="border.subtle"
        >
          <Link
            href="/"
            style={{
              textDecoration: "none",
              width: "fit-content",
              display: "block",
            }}
          >
            <Flex align="center" gap={2.5} mb={6} cursor="pointer">
              <Logo size={24} />
              <Heading
                size="sm"
                color="teal.400"
                fontWeight="black"
                letterSpacing="tight"
              >
                BucketHQ
              </Heading>
            </Flex>
          </Link>

          {status === "valid" && (
            <>
              <Flex
                align="center"
                justify="center"
                w={12}
                h={12}
                borderRadius="xl"
                bg="teal.500/10"
                mb={5}
              >
                <Icon color="teal.400" boxSize={6}>
                  <LuMailCheck />
                </Icon>
              </Flex>
              <Heading size="lg" fontWeight="bold" mb={2}>
                You&apos;re invited!
              </Heading>
              <Text fontSize="sm" color="fg.muted" lineHeight="relaxed">
                <Text as="span" color="fg" fontWeight="semibold">
                  {inviterName}
                </Text>{" "}
                has invited you to join{" "}
                <Text as="span" color="fg" fontWeight="semibold">
                  {orgName}
                </Text>{" "}
                on BucketHQ.
              </Text>
            </>
          )}

          {status === "invalid" && (
            <>
              <Flex
                align="center"
                justify="center"
                w={12}
                h={12}
                borderRadius="xl"
                bg="red.500/10"
                mb={5}
              >
                <Icon color="red.400" boxSize={6}>
                  <LuShieldAlert />
                </Icon>
              </Flex>
              <Heading size="lg" fontWeight="bold" mb={2}>
                Invalid Invitation
              </Heading>
              <Text fontSize="sm" color="fg.muted" lineHeight="relaxed">
                This invitation link is invalid or has already been used. Please
                ask the team owner to send a new one.
              </Text>
            </>
          )}

          {status === "expired" && (
            <>
              <Flex
                align="center"
                justify="center"
                w={12}
                h={12}
                borderRadius="xl"
                bg="yellow.500/10"
                mb={5}
              >
                <Icon color="yellow.400" boxSize={6}>
                  <LuClock />
                </Icon>
              </Flex>
              <Heading size="lg" fontWeight="bold" mb={2}>
                Invitation Expired
              </Heading>
              <Text fontSize="sm" color="fg.muted" lineHeight="relaxed">
                Your invitation to{" "}
                <Text as="span" color="fg" fontWeight="semibold">
                  {orgName}
                </Text>{" "}
                has expired. Please ask the team owner to resend the invitation.
              </Text>
            </>
          )}
        </Box>

        {/* Body */}
        <Box px={8} py={6}>
          {status === "valid" && (
            <Stack gap={5}>
              {/* Invitation Details Card */}
              <Box
                borderRadius="xl"
                borderWidth="1px"
                borderColor="border.subtle"
                bg="bg.subtle"
                p={4}
              >
                <Stack gap={3}>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="xs" color="fg.muted" fontWeight="medium">
                      Workspace
                    </Text>
                    <Flex align="center" gap={1.5}>
                      <Icon color="fg.muted" boxSize={3.5}>
                        <LuUsers />
                      </Icon>
                      <Text fontSize="sm" fontWeight="semibold">
                        {orgName}
                      </Text>
                    </Flex>
                  </Flex>
                  <Flex justify="space-between" align="center">
                    <Text fontSize="xs" color="fg.muted" fontWeight="medium">
                      Your Role
                    </Text>
                    <Badge
                      size="sm"
                      colorPalette={roleColor}
                      variant="subtle"
                    >
                      {roleLabel}
                    </Badge>
                  </Flex>
                  {inviteeEmail && (
                    <Flex justify="space-between" align="center">
                      <Text fontSize="xs" color="fg.muted" fontWeight="medium">
                        Invited As
                      </Text>
                      <Text fontSize="sm" color="fg" fontWeight="medium">
                        {inviteeEmail}
                      </Text>
                    </Flex>
                  )}
                </Stack>
              </Box>

              {/* Action Buttons */}
              {isAuthenticated ? (
                <Button
                  colorPalette="teal"
                  size="lg"
                  w="100%"
                  loading={accepting}
                  loadingText="Joining..."
                  onClick={handleAccept}
                >
                  Accept & Join Workspace
                </Button>
              ) : (
                <Stack gap={3}>
                  <Text
                    fontSize="xs"
                    color="fg.muted"
                    textAlign="center"
                    lineHeight="relaxed"
                  >
                    Sign in or create an account to accept this invitation.
                  </Text>
                  <Button
                    colorPalette="teal"
                    size="lg"
                    w="100%"
                    onClick={() =>
                      router.push(`/auth/signup?invite=${token}`)
                    }
                  >
                    Create Account & Join
                    <Icon>
                      <LuArrowRight />
                    </Icon>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    w="100%"
                    onClick={() =>
                      router.push(`/auth/login?invite=${token}`)
                    }
                  >
                    Sign In & Join
                  </Button>
                </Stack>
              )}
            </Stack>
          )}

          {(status === "invalid" || status === "expired") && (
            <Stack gap={3}>
              <Button
                colorPalette="teal"
                size="lg"
                w="100%"
                onClick={() => router.push("/auth/login")}
              >
                Go to Login
              </Button>
              <Button
                variant="outline"
                size="lg"
                w="100%"
                onClick={() => router.push("/")}
              >
                Back to Home
              </Button>
            </Stack>
          )}
        </Box>

        {/* Footer */}
        <Box px={8} pb={6}>
          <Text fontSize="2xs" color="fg.subtle" textAlign="center">
            © {new Date().getFullYear()} BucketHQ. All rights reserved.
          </Text>
        </Box>
      </Box>
    </Flex>
  );
}
