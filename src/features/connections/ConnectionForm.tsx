"use client";

import React, { useState } from "react";
import { Box, Button, Input, Stack, Text, Heading, Flex, SimpleGrid } from "@chakra-ui/react";
import { useCreateConnection } from "@/react-query/connections/actions";
import { HardDrive, Cloud, Image } from "lucide-react";

interface ConnectionFormProps {
  onSuccess?: () => void;
}

export function ConnectionForm({ onSuccess }: ConnectionFormProps) {
  const [providerType, setProviderType] = useState<"AWS_S3" | "CLOUDFLARE_R2" | "CLOUDINARY">("AWS_S3");
  const [label, setLabel] = useState("");
  const [bucketName, setBucketName] = useState("");
  const [region, setRegion] = useState("us-east-1");
  const [projectName, setProjectName] = useState("General");
  const [environment, setEnvironment] = useState<"PRODUCTION" | "STAGING" | "DEVELOPMENT">("PRODUCTION");

  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [accountId, setAccountId] = useState("");
  const [cloudName, setCloudName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  const createConnMutation = useCreateConnection();
  const loading = createConnMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    try {
      let credentials: any = {};
      if (providerType === "AWS_S3") {
        if (!accessKeyId || !secretAccessKey || !bucketName) {
          throw new Error("Access Key, Secret Key, and Bucket Name are required");
        }
        credentials = { accessKeyId, secretAccessKey };
      } else if (providerType === "CLOUDFLARE_R2") {
        if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
          throw new Error("Account ID, Access Key, Secret Key, and Bucket Name are required");
        }
        credentials = { accountId, accessKeyId, secretAccessKey };
      } else if (providerType === "CLOUDINARY") {
        if (!cloudName || !apiKey || !apiSecret) {
          throw new Error("Cloud Name, API Key, and API Secret are required");
        }
        credentials = { cloudName, apiKey, apiSecret };
      }

      await createConnMutation.mutateAsync({
        label,
        providerType,
        credentials,
        bucketName: providerType === "CLOUDINARY" ? null : bucketName,
        region: providerType === "AWS_S3" ? region : null,
        projectName: projectName.trim() || "General",
        environment,
      });

      setLabel("");
      setBucketName("");
      setProjectName("General");
      setEnvironment("PRODUCTION");
      setAccessKeyId("");
      setSecretAccessKey("");
      setAccountId("");
      setCloudName("");
      setApiKey("");
      setApiSecret("");

      onSuccess?.();
    } catch (err) {
    }
  };

  return (
    <Box bg="bg.panel" p={6} borderRadius="lg" borderWidth="1px" shadow="sm">
      <Stack gap={5}>
        <Heading size="md" fontWeight="bold">Connect Storage Account</Heading>

        {/* Provider Switcher Tabs */}
        <Flex gap={2} bg="bg.muted" p={1.5} borderRadius="lg" align="center">
          <Button
            size="sm"
            flex="1"
            variant={providerType === "AWS_S3" ? "solid" : "ghost"}
            colorPalette={providerType === "AWS_S3" ? "orange" : "gray"}
            onClick={() => setProviderType("AWS_S3")}
            gap={1.5}
          >
            <HardDrive size={14} />
            <span>AWS S3</span>
          </Button>
          <Button
            size="sm"
            flex="1"
            variant={providerType === "CLOUDFLARE_R2" ? "solid" : "ghost"}
            colorPalette={providerType === "CLOUDFLARE_R2" ? "blue" : "gray"}
            onClick={() => setProviderType("CLOUDFLARE_R2")}
            gap={1.5}
          >
            <Cloud size={14} />
            <span>Cloudflare R2</span>
          </Button>
          <Button
            size="sm"
            flex="1"
            variant={providerType === "CLOUDINARY" ? "solid" : "ghost"}
            colorPalette={providerType === "CLOUDINARY" ? "purple" : "gray"}
            onClick={() => setProviderType("CLOUDINARY")}
            gap={1.5}
          >
            <Image size={14} />
            <span>Cloudinary</span>
          </Button>
        </Flex>

        <form onSubmit={handleSubmit}>
          <Stack gap={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <Stack gap={1.5}>
                <Text fontSize="sm" fontWeight="semibold">Connection Label</Text>
                <Input
                  placeholder="e.g. User Avatars Bucket"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                />
              </Stack>

              <Stack gap={1.5}>
                <Text fontSize="sm" fontWeight="semibold">Project / Group</Text>
                <Input
                  placeholder="e.g. E-Commerce Store, Marketing App"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </Stack>
            </SimpleGrid>

            {/* Environment Selector */}
            <Stack gap={1.5}>
              <Text fontSize="xs" fontWeight="semibold" color="fg.muted">Target Environment</Text>
              <Flex gap={2}>
                <Button
                  type="button"
                  size="xs"
                  variant={environment === "PRODUCTION" ? "solid" : "outline"}
                  colorPalette={environment === "PRODUCTION" ? "red" : "gray"}
                  onClick={() => setEnvironment("PRODUCTION")}
                >
                  Production
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant={environment === "STAGING" ? "solid" : "outline"}
                  colorPalette={environment === "STAGING" ? "blue" : "gray"}
                  onClick={() => setEnvironment("STAGING")}
                >
                  Staging
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant={environment === "DEVELOPMENT" ? "solid" : "outline"}
                  colorPalette={environment === "DEVELOPMENT" ? "teal" : "gray"}
                  onClick={() => setEnvironment("DEVELOPMENT")}
                >
                  Development
                </Button>
              </Flex>
            </Stack>

            {/* AWS S3 Specific Fields */}
            {providerType === "AWS_S3" && (
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Stack gap={1.5}>
                  <Text fontSize="sm" fontWeight="semibold">Bucket Name</Text>
                  <Input
                    placeholder="my-s3-bucket-name"
                    value={bucketName}
                    onChange={(e) => setBucketName(e.target.value)}
                    required
                  />
                </Stack>
                <Stack gap={1.5}>
                  <Text fontSize="sm" fontWeight="semibold">AWS Region</Text>
                  <Input
                    placeholder="us-east-1"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    required
                  />
                </Stack>
                <Stack gap={1.5}>
                  <Text fontSize="sm" fontWeight="semibold">AWS Access Key ID</Text>
                  <Input
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                    value={accessKeyId}
                    onChange={(e) => setAccessKeyId(e.target.value)}
                    required
                  />
                </Stack>
                <Stack gap={1.5}>
                  <Text fontSize="sm" fontWeight="semibold">AWS Secret Access Key</Text>
                  <Input
                    type="password"
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    value={secretAccessKey}
                    onChange={(e) => setSecretAccessKey(e.target.value)}
                    required
                  />
                </Stack>
              </SimpleGrid>
            )}

            {/* Cloudflare R2 Specific Fields */}
            {providerType === "CLOUDFLARE_R2" && (
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Stack gap={1.5}>
                  <Text fontSize="sm" fontWeight="semibold">Bucket Name</Text>
                  <Input
                    placeholder="my-r2-bucket-name"
                    value={bucketName}
                    onChange={(e) => setBucketName(e.target.value)}
                    required
                  />
                </Stack>
                <Stack gap={1.5}>
                  <Text fontSize="sm" fontWeight="semibold">R2 Account ID</Text>
                  <Input
                    placeholder="e.g. 5e1194200dbf4e0c8de6e326example"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    required
                  />
                </Stack>
                <Stack gap={1.5}>
                  <Text fontSize="sm" fontWeight="semibold">R2 Access Key ID</Text>
                  <Input
                    placeholder="e.g. 7058a98ec517e4f9b8061example"
                    value={accessKeyId}
                    onChange={(e) => setAccessKeyId(e.target.value)}
                    required
                  />
                </Stack>
                <Stack gap={1.5}>
                  <Text fontSize="sm" fontWeight="semibold">R2 Secret Access Key</Text>
                  <Input
                    type="password"
                    placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    value={secretAccessKey}
                    onChange={(e) => setSecretAccessKey(e.target.value)}
                    required
                  />
                </Stack>
              </SimpleGrid>
            )}

            {/* Cloudinary Specific Fields */}
            {providerType === "CLOUDINARY" && (
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                <Stack gap={1.5}>
                  <Text fontSize="sm" fontWeight="semibold">Cloud Name</Text>
                  <Input
                    placeholder="my-cloudinary-cloud-name"
                    value={cloudName}
                    onChange={(e) => setCloudName(e.target.value)}
                    required
                  />
                </Stack>
                <Stack gap={1.5}>
                  <Text fontSize="sm" fontWeight="semibold">API Key</Text>
                  <Input
                    placeholder="e.g. 439281729381729"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required
                  />
                </Stack>
                <Stack gap={1.5}>
                  <Text fontSize="sm" fontWeight="semibold">API Secret</Text>
                  <Input
                    type="password"
                    placeholder="e.g. wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    required
                  />
                </Stack>
              </SimpleGrid>
            )}

            <Button type="submit" colorPalette="teal" loading={loading} mt={3} width="auto" alignSelf="flex-start">
              Create Connection
            </Button>
          </Stack>
        </form>
      </Stack>
    </Box>
  );
}
