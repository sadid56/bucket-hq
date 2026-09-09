"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Box, Flex, Text, Button, Heading, Stack, SimpleGrid, Center, Textarea } from "@chakra-ui/react";

import { TextField } from "@/components/ui/text-field";
import { toaster } from "@/components/ui/toaster";
import { Mail, MessageSquare } from "lucide-react";
import { GithubIcon } from "@/components/shared/GithubIcon";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toaster.create({ title: "Please fill in all fields", type: "error" });
      return;
    }
    setSending(true);
    // Simulate send
    await new Promise((r) => setTimeout(r, 1000));
    toaster.create({ title: "Message sent! We'll get back to you soon.", type: "success" });
    setName("");
    setEmail("");
    setMessage("");
    setSending(false);
  };

  return (
    <>

      <Box py={{ base: 16, md: 24 }} flex="1">
        <Box maxW="5xl" mx="auto" px={{ base: 4, md: 8 }}>
          <Stack gap={3} textAlign="center" mb={{ base: 10, md: 14 }}>
            <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="widest" color="teal.500">
              Contact
            </Text>
            <Heading as="h1" size={{ base: "2xl", md: "3xl" }} fontWeight="black">
              Get in touch
            </Heading>
            <Text fontSize="md" color="fg.muted" maxW="lg" mx="auto">
              Have a question, found a bug, or want to request a feature? We&apos;d love to hear from you.
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={10}>
            {/* Contact Form */}
            <Box bg="bg.panel" p={{ base: 6, md: 8 }} borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
              <form onSubmit={handleSubmit}>
                <Stack gap={5}>
                  <Heading as="h2" size="sm" fontWeight="bold">
                    Send us a message
                  </Heading>

                  <TextField
                    label={<Text fontSize="xs" fontWeight="semibold" color="fg.muted">Your Name</Text>}
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />

                  <TextField
                    label={<Text fontSize="xs" fontWeight="semibold" color="fg.muted">Email Address</Text>}
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <Stack gap={1.5}>
                    <Text fontSize="xs" fontWeight="semibold" color="fg.muted">Message</Text>
                    <Textarea
                      placeholder="Tell us what's on your mind..."
                      value={message}
                      onChange={(e: any) => setMessage(e.target.value)}
                      rows={5}
                      bg="bg.canvas"
                      borderWidth="1px"
                      borderColor="border.subtle"
                      borderRadius="md"
                      px={3}
                      py={2}
                      fontSize="sm"
                      color="fg"
                      _focus={{
                        outline: "none",
                        borderColor: "teal.500",
                        boxShadow: "0 0 0 1px var(--chakra-colors-teal-500)",
                      }}
                      resize="vertical"
                      required
                    />
                  </Stack>

                  <Button type="submit" colorPalette="teal" loading={sending}>
                    Send Message
                  </Button>
                </Stack>
              </form>
            </Box>

            {/* Contact Info Cards */}
            <Stack gap={5}>
              <Box bg="bg.panel" p={6} borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
                <Flex align="center" gap={4}>
                  <Center w={12} h={12} borderRadius="lg" bg="teal.500/10" color="teal.400">
                    <Mail size={22} />
                  </Center>
                  <Stack gap={0.5}>
                    <Text fontSize="sm" fontWeight="bold">Email</Text>
                    <Text fontSize="sm" color="fg.muted">support@buckethq.dev</Text>
                  </Stack>
                </Flex>
              </Box>

              <Box bg="bg.panel" p={6} borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
                <Flex align="center" gap={4}>
                  <Center w={12} h={12} borderRadius="lg" bg="teal.500/10" color="teal.400">
                    <GithubIcon size={22} />
                  </Center>
                  <Stack gap={0.5}>
                    <Text fontSize="sm" fontWeight="bold">GitHub</Text>
                    <Link href="https://github.com" target="_blank">
                      <Text fontSize="sm" color="teal.400" _hover={{ textDecoration: "underline" }} cursor="pointer">
                        View on GitHub
                      </Text>
                    </Link>
                  </Stack>
                </Flex>
              </Box>

              <Box bg="bg.panel" p={6} borderRadius="xl" borderWidth="1px" borderColor="border.subtle">
                <Flex align="center" gap={4}>
                  <Center w={12} h={12} borderRadius="lg" bg="teal.500/10" color="teal.400">
                    <MessageSquare size={22} />
                  </Center>
                  <Stack gap={0.5}>
                    <Text fontSize="sm" fontWeight="bold">Response Time</Text>
                    <Text fontSize="sm" color="fg.muted">We typically respond within 24 hours</Text>
                  </Stack>
                </Flex>
              </Box>
            </Stack>
          </SimpleGrid>
        </Box>
      </Box>

    </>
  );
}
