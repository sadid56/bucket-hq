"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Stack, Text, Heading, Flex } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { loginAction } from "@/actions/auth";
import { toaster } from "@/components/ui/toaster";
import { TextField } from "@/components/ui/text-field";
import { SocialLogin } from "./SocialLogin";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await loginAction(data);
      if (res?.error) {
        throw new Error(res.error);
      }

      toaster.create({
        title: "Logged in successfully",
        type: "success",
      });

      router.push("/dashboard");
    } catch (err: any) {
      toaster.create({
        title: err.message || "Failed to log in",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box w='100%' maxW='md' p={8} bg='bg.panel' borderRadius='lg' borderWidth='1px' shadow='md'>
      <Stack gap={6}>
        <Heading size='2xl' textAlign='center' color='teal.500' fontWeight='extrabold'>
          BucketHQ
        </Heading>
        <Text fontSize='sm' color='fg.muted' textAlign='center'>
          Log in to manage your unified cloud storage
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

            <TextField
              label={
                <Flex justify='space-between' align='center' width='100%'>
                  <Text fontSize='sm' fontWeight='medium'>
                    Password
                  </Text>
                  <Button variant='plain' size='xs' colorPalette='teal' type='button' onClick={() => router.push("/reset-password")}>
                    Forgot password?
                  </Button>
                </Flex>
              }
              type='password'
              placeholder='••••••••'
              error={errors.password}
              {...register("password", { required: "Password is required" })}
            />

            <Button type='submit' colorPalette='teal' loading={loading} width='100%' mt={2}>
              Sign In
            </Button>
          </Stack>
        </form>

        <SocialLogin mode="login" />

        <Text fontSize='xs' color='fg.muted' textAlign='center'>
          Don't have an account?{" "}
          <Button variant='plain' size='xs' colorPalette='teal' onClick={() => router.push("/auth/signup")}>
            Create account
          </Button>
        </Text>
      </Stack>
    </Box>
  );
}

