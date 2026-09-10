"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Button, Stack, Text, Heading, Flex } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { signupAction } from "@/actions/auth";
import { toaster } from "@/components/ui/toaster";
import { TextField } from "@/components/ui/text-field";
import { SocialLogin } from "./SocialLogin";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite") || undefined;
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      orgName: "",
      password: "",
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await signupAction({ ...data, inviteToken });

      if (res?.error) {
        throw new Error(res.error);
      }

      if (res?.requiresConfirmation) {
        toaster.create({
          title: "Registration successful!",
          description: "Please check your inbox to verify your email address.",
          type: "success",
        });
        router.push("/auth/login");
      } else {
        toaster.create({
          title: inviteToken ? "Welcome to the team!" : "Account created successfully",
          type: "success",
        });

        if (res?.orgId) {
          router.push(`/dashboard/${res.orgId}`);
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      toaster.create({
        title: err.message || "Failed to sign up",
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
          {inviteToken ? "Join Your Team" : "Create Account"}
        </Heading>
        <Text fontSize='sm' color='fg.muted' textAlign='center'>
          {inviteToken
            ? "Create an account to accept the invitation"
            : "Get started with BucketHQ today"}
        </Text>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={4}>
            <TextField
              label='Full Name'
              type='text'
              placeholder='John Doe'
              error={errors.name}
              {...register("name", { required: "Full name is required" })}
            />

            <TextField
              label='Email Address'
              type='email'
              placeholder='you@example.com'
              error={errors.email}
              {...register("email", { required: "Email is required" })}
            />

            {!inviteToken && (
              <TextField
                label='Company / Organization Name'
                type='text'
                placeholder='e.g. Official or Acme Corp'
                error={errors.orgName}
                {...register("orgName", { required: !inviteToken ? "Company name is required" : false })}
              />
            )}

            <TextField
              label='Password'
              type='password'
              placeholder='Min. 8 characters'
              error={errors.password}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters" },
              })}
            />

            <Button type='submit' colorPalette='teal' loading={loading} width='100%' mt={2}>
              {inviteToken ? "Create Account & Join" : "Get Started"}
            </Button>
          </Stack>
        </form>

        <SocialLogin mode="signup" />

        <Text fontSize='xs' color='fg.muted' textAlign='center'>
          Already have an account?{" "}
          <Button
            variant='plain'
            size='xs'
            colorPalette='teal'
            type='button'
            onClick={() =>
              router.push(inviteToken ? `/auth/login?invite=${inviteToken}` : "/auth/login")
            }
          >
            Log in
          </Button>
        </Text>
      </Stack>
    </Box>
  );
}

