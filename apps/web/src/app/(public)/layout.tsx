import React from "react";
import { Flex, Box } from "@chakra-ui/react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Flex
      minHeight="100vh"
      direction="column"
      bg="bg.canvas"
      color="fg"
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxW: "1400px",
        height: "600px",
        background: "radial-gradient(ellipse at top, rgba(20, 184, 166, 0.06), transparent 60%)",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <Navbar />
      <Box as="main" flex="1" position="relative" zIndex={1}>
        {children}
      </Box>
      <Footer />
    </Flex>
  );
}
