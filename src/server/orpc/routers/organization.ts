import { z } from "zod";
import { authedProcedure, requireOrgRole } from "../base";
import { prisma } from "@/server/db";
import { generateUniqueOrgSlug } from "@/server/utils/generateSlug";
import { ORPCError } from "@orpc/server";
import { invalidateUserCache } from "@/server/lib/auth";

export const organizationRouter = {
  list: authedProcedure.handler(async ({ context }) => {
    const teamAccesses = await prisma.teamAccess.findMany({
      where: { userId: context.user.id },
      include: {
        organization: {
          include: {
            storageConnections: {
              select: {
                id: true,
                label: true,
                providerType: true,
                bucketName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return teamAccesses.map((ta) => ({
      ...ta.organization,
      userRole: ta.role,
    }));
  }),

  get: authedProcedure.input(z.object({ identifier: z.string() })).handler(async ({ context, input }) => {
    const org = await prisma.organization.findFirst({
      where: {
        OR: [{ id: input.identifier }, { slug: input.identifier }],
      },
      include: {
        teamAccesses: {
          where: { userId: context.user.id },
        },
      },
    });

    if (!org || org.teamAccesses.length === 0) {
      throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
    }

    return {
      ...org,
      userRole: org.teamAccesses[0]?.role,
    };
  }),

  create: authedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Organization name is required"),
      }),
    )
    .handler(async ({ context, input }) => {
      const slug = await generateUniqueOrgSlug(input.name);
      return await prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
          data: {
            name: input.name,
            slug,
          },
        });

        await tx.teamAccess.create({
          data: {
            userId: context.user.id,
            organizationId: org.id,
            role: "OWNER",
          },
        });

        invalidateUserCache(context.user.id);
        return org;
      });
    }),

  update: authedProcedure
    .input(
      z.object({
        orgId: z.string(),
        name: z.string().min(1, "Organization name is required"),
      }),
    )
    .use(requireOrgRole(["OWNER"]))
    .handler(async ({ context, input }) => {
      const slug = await generateUniqueOrgSlug(input.name, context.orgId!);
      invalidateUserCache(context.user.id);
      return await prisma.organization.update({
        where: { id: context.orgId! },
        data: {
          name: input.name,
          slug,
        },
      });
    }),

  delete: authedProcedure
    .input(
      z.object({
        orgId: z.string(),
      }),
    )
    .use(requireOrgRole(["OWNER"]))
    .handler(async ({ context }) => {
      invalidateUserCache(context.user.id);
      return await prisma.organization.delete({
        where: { id: context.orgId! },
      });
    }),
};
