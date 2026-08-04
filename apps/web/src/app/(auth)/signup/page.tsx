"use client";

import React from "react";
import { Flex } from "@chakra-ui/react";
import { SignupForm } from "@/features/auth/components/SignupForm";

export default function SignupPage() {
  return (
    <Flex minHeight="100vh" align="center" justify="center" bg="bg.canvas" p={4}>
      <SignupForm />
    </Flex>
  );
}
