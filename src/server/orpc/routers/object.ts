import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { authedProcedure } from "../base";
import { prisma } from "@/server/db";
import { getStorageClient } from "@/server/services/storage";
import { validatePathPermissions } from "./signing";

export const objectRouter = {
  list: authedProcedure
    .input(
      z.object({
        connectionId: z.string(),
        prefix: z.string().optional().default(""),
        continuationToken: z.string().optional(),
        pageSize: z.number().optional().default(25),
      })
    )
    .handler(async ({ context, input }) => {
      const [connection] = await Promise.all([
        prisma.storageConnection.findUnique({
          where: { id: input.connectionId },
        }),
        validatePathPermissions(
          context.user.id,
          input.connectionId,
          input.prefix,
          "READ"
        ),
      ]);

      if (!connection) {
        throw new ORPCError("NOT_FOUND", { message: "Storage connection not found" });
      }

      const client = getStorageClient(connection);
      const res = await client.listObjects(input.prefix, {
        continuationToken: input.continuationToken,
        maxKeys: input.pageSize,
      });
      return res;
    }),

  delete: authedProcedure
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

      await validatePathPermissions(
        context.user.id,
        input.connectionId,
        input.key,
        "WRITE"
      );

      const client = getStorageClient(connection);
      await client.deleteObject(input.key);

      const ipAddress =
        context.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;

      await prisma.auditLog.create({
        data: {
          userId: context.user.id,
          action: "DELETE_OBJECT",
          ipAddress,
          objectPath: input.key,
          storageConnectionId: input.connectionId,
          details: JSON.stringify({
            providerType: connection.providerType,
            label: connection.label,
          }),
        },
      });

      return { success: true };
    }),
};
