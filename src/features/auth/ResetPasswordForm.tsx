"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Stack, Text, Heading } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { resetPasswordAction } from "@/actions/auth";
import { toaster } from "@/components/ui/toaster";
import { TextField } from "@/components/ui/text-field";

export function ResetPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await resetPasswordAction({
        email: data.email,
        redirectTo: `${window.location.origin}/auth/login`,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      toaster.create({
        title: "Reset link sent!",
        description: "Please check your inbox for instructions to restore access.",
        type: "success",
      });

      router.push("/auth/login");
    } catch (err: any) {
      toaster.create({
        title: err.message || "Failed to send reset link",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box w='100%' maxW='md' p={8} bg='bg.panel' borderRadius='lg' borderWidth='1px' shadow='md'>
      <Stack gap={6}>
        <Heading size='xl' textAlign='center' color='teal.500' fontWeight='extrabold'>
          Reset Password
        </Heading>
        <Text fontSize='sm' color='fg.muted' textAlign='center'>
          Enter your email to receive a recovery link
        </Text>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={4}>
            <TextField
              label='Email Address'
              type='email'
              placeholder='you@example.com'
              error={errors.email}
              {...register("email", { required: "Email is required" })}
            />

            <Button type='submit' colorPalette='teal' loading={loading} width='100%' mt={2}>
              Send Reset Link
            </Button>
          </Stack>
        </form>

        <Button variant='plain' size='xs' colorPalette='teal' type='button' onClick={() => router.push("/auth/login")} alignSelf='center'>
          Back to Login
        </Button>
      </Stack>
    </Box>
  );
}

