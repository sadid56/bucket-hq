import { z } from "zod";
import { authedProcedure, requireOrgRole } from "../base";
import { prisma } from "@/server/db";
import { encrypt } from "@/server/utils/encryption";

export const connectionRouter = {
  list: authedProcedure
    .input(
      z
        .object({
          orgId: z.string().optional(),
        })
        .optional()
    )
    .use(requireOrgRole(["OWNER", "EDITOR", "VIEWER"]))
    .handler(async ({ context }) => {
      return await prisma.storageConnection.findMany({
        where: { organizationId: context.orgId! },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          label: true,
          providerType: true,
          bucketName: true,
          region: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }),

  create: authedProcedure
    .input(
      z.object({
        orgId: z.string().optional(),
        label: z.string().min(1, "Connection label is required"),
        providerType: z.enum(["AWS_S3", "CLOUDFLARE_R2", "CLOUDINARY"]),
        credentials: z.any(),
        bucketName: z.string().optional(),
        region: z.string().optional(),
      })
    )
    .use(requireOrgRole(["OWNER", "EDITOR"]))
    .handler(async ({ context, input }) => {
      const credsJson = JSON.stringify(input.credentials);
      const { iv, encryptedData, authTag } = encrypt(credsJson);

      return await prisma.storageConnection.create({
        data: {
          organizationId: context.orgId!,
          label: input.label,
          providerType: input.providerType,
          encryptedCreds: encryptedData,
          iv,
          authTag,
          bucketName: input.bucketName || null,
          region: input.region || null,
        },
        select: {
          id: true,
          label: true,
          providerType: true,
          bucketName: true,
          region: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }),

  update: authedProcedure
    .input(
      z.object({
        orgId: z.string().optional(),
        connectionId: z.string(),
        label: z.string().optional(),
        bucketName: z.string().optional(),
        region: z.string().optional(),
        credentials: z.any().optional(),
      })
    )
    .use(requireOrgRole(["OWNER", "EDITOR"]))
    .handler(async ({ input }) => {
      const updateData: any = {};

      if (input.label !== undefined) updateData.label = input.label;
      if (input.bucketName !== undefined) updateData.bucketName = input.bucketName;
      if (input.region !== undefined) updateData.region = input.region;

      if (input.credentials) {
        const credsJson = JSON.stringify(input.credentials);
        const { iv, encryptedData, authTag } = encrypt(credsJson);
        updateData.encryptedCreds = encryptedData;
        updateData.iv = iv;
        updateData.authTag = authTag;
      }

      return await prisma.storageConnection.update({
        where: { id: input.connectionId },
        data: updateData,
        select: {
          id: true,
          label: true,
          providerType: true,
          bucketName: true,
          region: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }),

  delete: authedProcedure
    .input(
      z.object({
        orgId: z.string().optional(),
        connectionId: z.string(),
      })
    )
    .use(requireOrgRole(["OWNER"]))
    .handler(async ({ input }) => {
      return await prisma.storageConnection.delete({
        where: { id: input.connectionId },
      });
    }),
};
