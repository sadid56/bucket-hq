import React from "react";
import Link from "next/link";
import { Box, Grid, Flex, Text, Heading, Stack } from "@chakra-ui/react";
import { Logo } from "@/components/shared/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex minHeight='100vh' align='center' justify='center' bg='bg.canvas' p={{ base: 4, md: 8 }}>
      {/* Centered Split Card */}
      <Grid
        templateColumns={{ base: "1fr", lg: "1.1fr 0.9fr" }}
        maxW='1200px'
        w='100%'
        minHeight='700px'
        borderRadius='3xl'
        borderWidth='1px'
        borderColor='border.subtle'
        overflow='hidden'
        bg='bg.panel'
        shadow='2xl'
      >
        {/* Left side: Premium Image/Illustration Showcase */}
        <Box
          position='relative'
          display={{ base: "none", lg: "flex" }}
          flexDirection='column'
          justifyContent='space-between'
          p={10}
          pl={{ lg: 12, xl: 16 }}
          bgImage="url('/auth_showcase.png')"
          bgSize='cover'
          bgPos='center'
          _before={{
            content: '""',
            position: "absolute",
            inset: 0,
            bg: "rgba(11, 12, 16, 0.7)", // Softer dark glass overlay
            zIndex: 1,
          }}
        >
          <Link href="/" style={{ textDecoration: "none", width: "fit-content", display: "block" }}>
            <Flex align='center' gap={3} position='relative' zIndex={2} cursor="pointer">
              <Logo size={28} />
              <Heading size='sm' color='teal.400' fontWeight='black' letterSpacing='tight'>
                BucketHQ
              </Heading>
            </Flex>
          </Link>

          <Stack gap={5} maxW='md' position='relative' zIndex={2} color='white'>
            <Heading size='4xl' fontWeight='black' lineHeight='short'>
              Unified Cloud Storage Control Panel
            </Heading>
            <Text fontSize='sm' color='slate.300' lineHeight='relaxed'>
              Connect AWS S3, Cloudflare R2, and Cloudinary once. Manage files, share secure pre-signed URLs, and collaborate with your
              team.
            </Text>
          </Stack>

          <Text fontSize='2xs' color='slate.400' position='relative' zIndex={2}>
            © {new Date().getFullYear()} BucketHQ. All rights reserved.
          </Text>
        </Box>

        {/* Right side: Authentication Form */}
        <Flex align='center' justify='center' p={{ base: 6, md: 10 }} position='relative' w='100%'>
          <Box w='100%' maxW='md' mx='auto'>
            {children}
          </Box>
        </Flex>
      </Grid>
    </Flex>
  );
}
