import { z } from "zod";
import crypto from "crypto";
import { ORPCError } from "@orpc/server";
import { authedProcedure, requireOrgRole } from "../base";
import { prisma } from "@/server/db";
import { invalidateUserCache } from "@/server/lib/auth";
import { sendTeamInviteEmail } from "@/server/lib/mailer";

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

  listInvitations: authedProcedure
    .input(
      z
        .object({
          orgId: z.string().optional(),
        })
        .optional(),
    )
    .use(requireOrgRole(["OWNER", "EDITOR", "VIEWER"]))
    .handler(async ({ context }) => {
      const invites = await prisma.teamInvitation.findMany({
        where: { organizationId: context.orgId! },
        include: {
          invitedBy: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return invites.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        token: inv.token,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
        invitedBy: inv.invitedBy.name || inv.invitedBy.email,
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
      // Check if user is already in this organization
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
        include: {
          teamAccesses: {
            where: { organizationId: context.orgId! },
          },
        },
      });

      if (existingUser && existingUser.teamAccesses.length > 0) {
        throw new ORPCError("BAD_REQUEST", {
          message: "User is already a member of this organization",
        });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const invitation = await prisma.teamInvitation.upsert({
        where: {
          organizationId_email: {
            organizationId: context.orgId!,
            email: input.email,
          },
        },
        update: {
          role: input.role,
          token,
          expiresAt,
          invitedById: context.user.id,
        },
        create: {
          organizationId: context.orgId!,
          email: input.email,
          role: input.role,
          token,
          expiresAt,
          invitedById: context.user.id,
        },
        include: {
          organization: true,
        },
      });

      // Resolve base URL for invite link
      const origin =
        context.req.headers.get("origin") ||
        context.req.headers.get("referer") ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000";
      const baseUrl = origin.startsWith("http") ? new URL(origin).origin : "http://localhost:3000";
      const inviteUrl = `${baseUrl}/invite/${token}`;

      // Dispatch invitation email
      await sendTeamInviteEmail({
        to: input.email,
        inviterName: context.user.name || "A team owner",
        orgName: invitation.organization.name,
        role: input.role,
        inviteUrl,
      });

      return {
        success: true,
        inviteUrl,
        token,
        email: input.email,
      };
    }),

  revokeInvitation: authedProcedure
    .input(
      z.object({
        orgId: z.string().optional(),
        invitationId: z.string(),
      }),
    )
    .use(requireOrgRole(["OWNER"]))
    .handler(async ({ context, input }) => {
      return await prisma.teamInvitation.delete({
        where: {
          id: input.invitationId,
          organizationId: context.orgId!,
        },
      });
    }),

  getInvitation: authedProcedure
    .input(z.object({ token: z.string() }))
    .handler(async ({ input }) => {
      const invitation = await prisma.teamInvitation.findUnique({
        where: { token: input.token },
        include: {
          organization: {
            select: { id: true, name: true, slug: true },
          },
          invitedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (!invitation) {
        throw new ORPCError("NOT_FOUND", { message: "Invitation not found" });
      }

      if (invitation.expiresAt < new Date()) {
        throw new ORPCError("BAD_REQUEST", { message: "Invitation has expired" });
      }

      return invitation;
    }),

  acceptInvitation: authedProcedure
    .input(z.object({ token: z.string() }))
    .handler(async ({ context, input }) => {
      const invitation = await prisma.teamInvitation.findUnique({
        where: { token: input.token },
        include: { organization: true },
      });

      if (!invitation) {
        throw new ORPCError("NOT_FOUND", { message: "Invalid or expired invitation" });
      }

      if (invitation.expiresAt < new Date()) {
        throw new ORPCError("BAD_REQUEST", { message: "This invitation has expired" });
      }

      // Add to organization team
      const access = await prisma.teamAccess.upsert({
        where: {
          userId_organizationId: {
            userId: context.user.id,
            organizationId: invitation.organizationId,
          },
        },
        update: {
          role: invitation.role,
        },
        create: {
          userId: context.user.id,
          organizationId: invitation.organizationId,
          role: invitation.role,
        },
      });

      // Delete accepted invitation
      await prisma.teamInvitation.delete({
        where: { id: invitation.id },
      });

      invalidateUserCache(context.user.id);

      return {
        success: true,
        organization: invitation.organization,
        role: access.role,
      };
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
      invalidateUserCache(input.userId);
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
      if (input.userId === context.user.id) {
        throw new ORPCError("BAD_REQUEST", {
          message: "You cannot remove yourself from the organization",
        });
      }

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

      invalidateUserCache(input.userId);
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
