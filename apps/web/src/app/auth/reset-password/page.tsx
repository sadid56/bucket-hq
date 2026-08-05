import React from "react";
import { Flex } from "@chakra-ui/react";
import { ResetPasswordForm } from "@/features/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Flex minHeight='100vh' align='center' justify='center' bg='bg.canvas' p={4}>
      <ResetPasswordForm />
    </Flex>
  );
}
