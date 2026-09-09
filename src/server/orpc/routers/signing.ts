import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { authedProcedure } from "../base";
import { prisma } from "@/server/db";
import { getStorageClient } from "@/server/services/storage";
import { isPathAllowed } from "@/server/utils/path";

export async function validatePathPermissions(
  userId: string,
  connectionId: string,
  requestedPath: string,
  requiredLevel: "READ" | "WRITE"
) {
  const restrictions = await prisma.pathRestriction.findMany({
    where: {
      userId,
      storageConnectionId: connectionId,
    },
  });

  if (restrictions.length === 0) {
    return true;
  }

  for (const restriction of restrictions) {
    const levelMatches =
      requiredLevel === "READ"
        ? ["READ", "READ_WRITE"].includes(restriction.accessLevel)
        : ["WRITE", "READ_WRITE"].includes(restriction.accessLevel);

    if (levelMatches && isPathAllowed(requestedPath, restriction.pathPrefix)) {
      return true;
    }
  }

  throw new ORPCError("FORBIDDEN", {
    message: `Access denied: You do not have permission to ${requiredLevel.toLowerCase()} at this path.`,
  });
}

export const signingRouter = {
  getUploadUrl: authedProcedure
    .input(
      z.object({
        connectionId: z.string(),
        key: z.string(),
      })
    )
    .handler(async ({ context, input }) => {
      const connection = await prisma.storageConnection.findUnique({
        where: { id: input.connectionId },
      });

      if (!connection) {
        throw new ORPCError("NOT_FOUND", { message: "Storage connection not found" });
      }

      await validatePathPermissions(context.user.id, input.connectionId, input.key, "WRITE");

      const client = getStorageClient(connection);
      const url = await client.generateUploadUrl(input.key);

      const ipAddress =
        context.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;

      await prisma.auditLog.create({
        data: {
          userId: context.user.id,
          action: "SIGN_UPLOAD",
          ipAddress,
          objectPath: input.key,
          storageConnectionId: input.connectionId,
          details: JSON.stringify({
            providerType: connection.providerType,
            label: connection.label,
          }),
        },
      });

      return { url };
    }),

  getDownloadUrl: authedProcedure
    .input(
      z.object({
        connectionId: z.string(),
        key: z.string(),
      })
    )
    .handler(async ({ context, input }) => {
      const connection = await prisma.storageConnection.findUnique({
        where: { id: input.connectionId },
      });

      if (!connection) {
        throw new ORPCError("NOT_FOUND", { message: "Storage connection not found" });
      }

      await validatePathPermissions(context.user.id, input.connectionId, input.key, "READ");

      const client = getStorageClient(connection);
      const url = await client.generateDownloadUrl(input.key);

      const ipAddress =
        context.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;

      await prisma.auditLog.create({
        data: {
          userId: context.user.id,
          action: "SIGN_DOWNLOAD",
          ipAddress,
          objectPath: input.key,
          storageConnectionId: input.connectionId,
          details: JSON.stringify({
            providerType: connection.providerType,
            label: connection.label,
          }),
        },
      });

      return { url };
    }),
};
