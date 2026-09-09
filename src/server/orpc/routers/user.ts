import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { authedProcedure, adminProcedure } from "../base";
import { prisma } from "@/server/db";
import { parseDevice } from "@/server/utils/parseDevice";

export const userRouter = {
  getMe: authedProcedure.handler(async ({ context }) => {
    return context.user;
  }),

  updateProfile: authedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        image: z.string().optional(),
      })
    )
    .handler(async ({ context, input }) => {
      const updatedUser = await prisma.user.update({
        where: { id: context.user.id },
        data: {
          name: input.name,
          image: input.image,
        },
      });

      try {
        const updates: Record<string, string> = {};
        if (input.name) updates.full_name = input.name;
        if (input.image) updates.avatar_url = input.image;

        if (Object.keys(updates).length > 0) {
          await prisma.$executeRawUnsafe(
            `UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || $1::jsonb WHERE id = $2`,
            JSON.stringify(updates),
            context.user.id
          );
        }
      } catch (err) {
        console.error("Failed to sync updated profile to Supabase auth:", err);
      }

      return updatedUser;
    }),

  list: adminProcedure
    .input(
      z.object({
        search: z.string().optional().default(""),
      })
    )
    .handler(async ({ input }) => {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        where: input.search
          ? {
              OR: [
                { email: { contains: input.search, mode: "insensitive" } },
                { name: { contains: input.search, mode: "insensitive" } },
              ],
            }
          : undefined,
        include: {
          sessions: {
            orderBy: { updatedAt: "desc" },
          },
          accounts: true,
          teamAccesses: {
            include: {
              organization: true,
            },
          },
        },
      });

      return users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        role: user.role,
        banned: user.banned,
        banReason: user.banReason,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        accounts: user.accounts,
        sessions: user.sessions.map((session) => ({
          id: session.id,
          expiresAt: session.expiresAt,
          token: session.token,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          deviceInfo: parseDevice(session.userAgent),
        })),
        organizations: user.teamAccesses.map((access) => ({
          id: access.organization.id,
          name: access.organization.name,
          role: access.role,
        })),
      }));
    }),

  getUser: adminProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: { id: input.id },
        include: {
          teamAccesses: {
            include: { organization: true },
          },
        },
      });
      if (!user) {
        throw new ORPCError("NOT_FOUND", { message: "User not found" });
      }
      return user;
    }),

  toggleBan: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        banned: z.boolean(),
        reason: z.string().optional(),
      })
    )
    .handler(async ({ context, input }) => {
      if (input.userId === context.user.id) {
        throw new ORPCError("BAD_REQUEST", { message: "You cannot ban yourself" });
      }

      return await prisma.user.update({
        where: { id: input.userId },
        data: {
          banned: input.banned,
          banReason: input.banned ? input.reason || "No reason specified" : null,
        },
      });
    }),

  updateRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["ADMIN", "MEMBER"]),
      })
    )
    .handler(async ({ context, input }) => {
      if (input.userId === context.user.id) {
        throw new ORPCError("BAD_REQUEST", {
          message: "You cannot modify your own global role",
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: input.userId },
        data: { role: input.role },
      });

      try {
        await prisma.$executeRawUnsafe(
          `UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', $1) WHERE id = $2`,
          input.role,
          input.userId
        );
      } catch (err) {
        console.error("Failed to sync role to Supabase metadata:", err);
      }

      return updatedUser;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ context, input }) => {
      if (input.id === context.user.id) {
        throw new ORPCError("BAD_REQUEST", { message: "You cannot delete yourself" });
      }

      return await prisma.user.delete({
        where: { id: input.id },
      });
    }),
};
