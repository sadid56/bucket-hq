import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { authedProcedure, requireOrgRole } from "../base";
import { prisma } from "@/server/db";

export const teamRouter = {
  listMembers: authedProcedure
    .input(
      z
        .object({
          orgId: z.string().optional(),
        })
        .optional(),
    )
    .use(requireOrgRole(["OWNER", "EDITOR", "VIEWER"]))
    .handler(async ({ context }) => {
      const accesses = await prisma.teamAccess.findMany({
        where: { organizationId: context.orgId! },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              banned: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      return accesses.map((acc) => ({
        userId: acc.userId,
        role: acc.role,
        name: acc.user.name,
        email: acc.user.email,
        globalRole: acc.user.role,
        banned: acc.user.banned,
        joinedAt: acc.createdAt,
      }));
    }),

  inviteMember: authedProcedure
    .input(
      z.object({
        orgId: z.string().optional(),
        email: z.string().email(),
        role: z.enum(["OWNER", "EDITOR", "VIEWER"]),
      }),
    )
    .use(requireOrgRole(["OWNER"]))
    .handler(async ({ context, input }) => {
      let user = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        const tempId = `invited-${input.email}-${Date.now()}`;
        user = await prisma.user.create({
          data: {
            id: tempId,
            email: input.email,
            name: input.email.split("@")[0] || "Invited User",
          },
        });
      }

      const existingAccess = await prisma.teamAccess.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: context.orgId!,
          },
        },
      });

      if (existingAccess) {
        throw new ORPCError("BAD_REQUEST", {
          message: "User is already a member of this organization",
        });
      }

      return await prisma.teamAccess.create({
        data: {
          userId: user.id,
          organizationId: context.orgId!,
          role: input.role,
        },
      });
    }),

  updateMemberRole: authedProcedure
    .input(
      z.object({
        orgId: z.string().optional(),
        userId: z.string(),
        role: z.enum(["OWNER", "EDITOR", "VIEWER"]),
      }),
    )
    .use(requireOrgRole(["OWNER"]))
    .handler(async ({ context, input }) => {
      return await prisma.teamAccess.update({
        where: {
          userId_organizationId: {
            userId: input.userId,
            organizationId: context.orgId!,
          },
        },
        data: { role: input.role },
      });
    }),

  removeMember: authedProcedure
    .input(
      z.object({
        orgId: z.string().optional(),
        userId: z.string(),
      }),
    )
    .use(requireOrgRole(["OWNER"]))
    .handler(async ({ context, input }) => {
      const ownersCount = await prisma.teamAccess.count({
        where: { organizationId: context.orgId!, role: "OWNER" },
      });

      const targetAccess = await prisma.teamAccess.findUnique({
        where: {
          userId_organizationId: {
            userId: input.userId,
            organizationId: context.orgId!,
          },
        },
      });

      if (targetAccess?.role === "OWNER" && ownersCount <= 1) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Cannot remove the last owner of the organization",
        });
      }

      return await prisma.$transaction(async (tx) => {
        const connections = await tx.storageConnection.findMany({
          where: { organizationId: context.orgId! },
          select: { id: true },
        });
        const connectionIds = connections.map((c) => c.id);

        await tx.pathRestriction.deleteMany({
          where: {
            userId: input.userId,
            storageConnectionId: { in: connectionIds },
          },
        });

        return await tx.teamAccess.delete({
          where: {
            userId_organizationId: {
              userId: input.userId,
              organizationId: context.orgId!,
            },
          },
        });
      });
    }),

  listPathRestrictions: authedProcedure
    .input(
      z.object({
        orgId: z.string().optional(),
        userId: z.string(),
        connectionId: z.string(),
      }),
    )
    .use(requireOrgRole(["OWNER", "EDITOR", "VIEWER"]))
    .handler(async ({ input }) => {
      return await prisma.pathRestriction.findMany({
        where: {
          userId: input.userId,
          storageConnectionId: input.connectionId,
        },
      });
    }),

  addPathRestriction: authedProcedure
    .input(
      z.object({
        orgId: z.string().optional(),
        userId: z.string(),
        storageConnectionId: z.string(),
        pathPrefix: z.string(),
        accessLevel: z.enum(["READ", "WRITE", "READ_WRITE"]),
      }),
    )
    .use(requireOrgRole(["OWNER"]))
    .handler(async ({ input }) => {
      const cleanPrefix = input.pathPrefix.replace(/^\/+/g, "").replace(/\/+$/g, "") + "/";

      return await prisma.pathRestriction.upsert({
        where: {
          userId_storageConnectionId_pathPrefix: {
            userId: input.userId,
            storageConnectionId: input.storageConnectionId,
            pathPrefix: cleanPrefix,
          },
        },
        update: { accessLevel: input.accessLevel },
        create: {
          userId: input.userId,
          storageConnectionId: input.storageConnectionId,
          pathPrefix: cleanPrefix,
          accessLevel: input.accessLevel,
        },
      });
    }),

  removePathRestriction: authedProcedure
    .input(
      z.object({
        orgId: z.string().optional(),
        restrictionId: z.string(),
      }),
    )
    .use(requireOrgRole(["OWNER"]))
    .handler(async ({ input }) => {
      return await prisma.pathRestriction.delete({
        where: { id: input.restrictionId },
      });
    }),
};
