import React from "react";
import { Flex } from "@chakra-ui/react";
import { LoginForm } from "@/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <Flex minHeight='100vh' align='center' justify='center' bg='bg.canvas' p={4}>
      <LoginForm />
    </Flex>
  );
}
