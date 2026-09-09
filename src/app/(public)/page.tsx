import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Box, Flex, Text, Button, Heading, Stack, SimpleGrid, Badge, Center } from "@chakra-ui/react";

import { Shield, Zap, Database, Users, FolderOpen, Lock, ArrowRight, CloudCog, Link2, Share2 } from "lucide-react";

export const metadata: Metadata = {
  title: "BucketHQ — Unified Cloud Storage Management",
  description:
    "Manage your AWS S3, Cloudflare R2, and Cloudinary buckets in one workspace. Secure pre-signed URLs, team collaboration, and AES-256 encryption.",
  openGraph: {
    title: "BucketHQ — Unified Cloud Storage Management",
    description: "Connect your cloud providers once. Browse, upload, and share files securely with short-lived pre-signed URLs.",
    type: "website",
  },
};

const features = [
  {
    icon: <Database size={24} />,
    title: "Multi-Provider Support",
    description: "Connect AWS S3, Cloudflare R2, and Cloudinary from a single dashboard. No provider lock-in.",
  },
  {
    icon: <Zap size={24} />,
    title: "Pre-Signed URLs",
    description: "Generate secure, time-limited download and upload links. BucketHQ never touches your binary data.",
  },
  {
    icon: <Lock size={24} />,
    title: "AES-256 Encryption",
    description: "All credentials encrypted at rest with AES-256-GCM. Raw keys only exist briefly in process memory.",
  },
  {
    icon: <FolderOpen size={24} />,
    title: "Visual File Explorer",
    description: "Browse folders, preview files, and manage objects across all your buckets with an intuitive UI.",
  },
  {
    icon: <Users size={24} />,
    title: "Team Collaboration",
    description: "Invite teammates, assign roles, and define path-level access restrictions per workspace.",
  },
  {
    icon: <Shield size={24} />,
    title: "Audit Logging",
    description: "Track every file operation, login, and configuration change with detailed audit trails.",
  },
];

const steps = [
  {
    number: "01",
    icon: <CloudCog size={28} />,
    title: "Connect Providers",
    description: "Add your S3, R2, or Cloudinary credentials. They're encrypted instantly with AES-256-GCM.",
  },
  {
    number: "02",
    icon: <Link2 size={28} />,
    title: "Browse & Manage",
    description: "Use the visual file explorer to navigate folders, upload files, and generate pre-signed URLs.",
  },
  {
    number: "03",
    icon: <Share2 size={28} />,
    title: "Share Securely",
    description: "Distribute time-limited links to clients or teammates. Full audit trail included.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <Box as='section' position='relative' overflow='hidden'>
        {/* Modern Top-Left Gradient Orb */}
        <Box
          position='absolute'
          top='-100px'
          left='-100px'
          width={{ base: '300px', md: '800px' }}
          height={{ base: '300px', md: '800px' }}
          borderRadius='full'
          background='radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, rgba(99, 102, 241, 0.04) 50%, transparent 80%)'
          filter='blur(100px)'
          pointerEvents='none'
          zIndex={0}
        />

        <Flex
          maxW='6xl'
          mx='auto'
          px={{ base: 4, md: 8 }}
          py={12}
          minH='calc(100vh - 72px)'
          direction='column'
          align='center'
          justify='center'
          textAlign='center'
          position='relative'
          zIndex={1}
        >
          <Stack gap={6} maxW='3xl' align='center'>
            <Heading as='h1' size={{ base: "3xl", md: "6xl" }} fontWeight='black' lineHeight='tight' letterSpacing='tight'>
              Manage your buckets in{" "}
              <Text
                as='span'
                bgGradient='to-r'
                gradientFrom='teal.400'
                gradientTo='cyan.300'
                bgClip='text'
              >
                one workspace
              </Text>
            </Heading>

            <Text fontSize={{ base: "md", md: "lg" }} color='fg.muted' maxW='2xl' lineHeight='tall'>
              Connect your own cloud providers once. Broker file access securely via short-lived pre-signed URLs. BucketHQ never relays your
              binary data — keeping file transfers lightning fast.
            </Text>

            <Stack direction={{ base: "column", sm: "row" }} gap={4} mt={4}>
              <Button asChild size='lg' colorPalette='teal' px={8}>
                <Link href='/auth/signup'>
                  Create Free Account <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild size='lg' variant='outline' px={8}>
                <Link href='/docs'>Read the Docs</Link>
              </Button>
            </Stack>
          </Stack>
        </Flex>
      </Box>

      {/* Features Section */}
      <Box as='section' id='features' py={{ base: 16, md: 24 }}>
        <Box maxW='7xl' mx='auto' px={{ base: 4, md: 8 }}>
          <Stack gap={3} textAlign='center' mb={{ base: 10, md: 14 }}>
            <Text fontSize='xs' fontWeight='bold' textTransform='uppercase' letterSpacing='widest' color='teal.500'>
              Features
            </Text>
            <Heading as='h2' size={{ base: "xl", md: "2xl" }} fontWeight='black'>
              Everything you need to manage cloud storage
            </Heading>
            <Text fontSize='md' color='fg.muted' maxW='xl' mx='auto'>
              A complete toolkit for teams that work with multiple cloud providers.
            </Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {features.map((feature) => (
              <Box
                key={feature.title}
                p={6}
                bg='bg.panel'
                borderWidth='1px'
                borderColor='border.subtle'
                borderRadius='xl'
                transition='all 0.2s'
              >
                <Stack gap={4}>
                  <Center w={12} h={12} borderRadius='lg' bg='teal.500/10' color='teal.400'>
                    {feature.icon}
                  </Center>
                  <Heading as='h3' size='sm' fontWeight='bold'>
                    {feature.title}
                  </Heading>
                  <Text fontSize='sm' color='fg.muted' lineHeight='tall'>
                    {feature.description}
                  </Text>
                </Stack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* CTA Section */}
      <Box as='section' py={{ base: 16, md: 24 }}>
        <Box maxW='3xl' mx='auto' px={{ base: 4, md: 8 }} textAlign='center'>
          <Stack gap={6} align='center'>
            <Heading as='h2' size={{ base: "xl", md: "2xl" }} fontWeight='black'>
              Ready to simplify your cloud storage?
            </Heading>
            <Text fontSize='md' color='fg.muted' maxW='lg'>
              Join teams who manage their S3, R2, and Cloudinary buckets from a single, secure dashboard.
            </Text>
            <Stack direction={{ base: "column", sm: "row" }} gap={4}>
              <Button asChild size='lg' colorPalette='teal' px={8}>
                <Link href='/auth/signup'>
                  Get Started for Free <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild size='lg' variant='outline' px={8}>
                <Link href='/contact'>Contact Us</Link>
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </>
  );
}
