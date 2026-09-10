import { z } from "zod";
import { authedProcedure, adminProcedure } from "../base";
import { prisma } from "@/server/db";

export const auditRouter = {
  list: authedProcedure
    .input(
      z
        .object({
          orgId: z.string().optional(),
          action: z.string().optional(),
          userId: z.string().optional(),
          storageConnectionId: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
        .optional()
    )
    .handler(async ({ context, input }) => {
      const filters = input || {};
      const whereClause: any = {};

      const targetOrgId = filters.orgId || context.orgId;

      if (context.user.role === "ADMIN" && !targetOrgId) {
        // Admin viewing global logs
      } else {
        // Member or viewing specific org
        let orgIds: string[] = [];
        if (targetOrgId) {
          const resolvedOrg = await prisma.organization.findFirst({
            where: { OR: [{ id: targetOrgId }, { slug: targetOrgId }] },
            select: { id: true },
          });
          if (resolvedOrg) {
            orgIds = [resolvedOrg.id];
          }
        } else {
          orgIds = context.user.teamAccesses.map((ta) => ta.organizationId);
        }

        const orgConnections = await prisma.storageConnection.findMany({
          where: { organizationId: { in: orgIds } },
          select: { id: true },
        });
        const connIds = orgConnections.map((c) => c.id);

        whereClause.storageConnectionId = { in: connIds };
      }

      if (filters.storageConnectionId) {
        whereClause.storageConnectionId = filters.storageConnectionId;
      }

      if (filters.action) {
        whereClause.action = filters.action;
      }

      if (filters.userId) {
        whereClause.userId = filters.userId;
      }

      if (filters.startDate || filters.endDate) {
        whereClause.createdAt = {};
        if (filters.startDate) {
          whereClause.createdAt.gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          whereClause.createdAt.lte = new Date(filters.endDate);
        }
      }

      return await prisma.auditLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          storageConnection: {
            select: {
              id: true,
              label: true,
              providerType: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getStats: adminProcedure.handler(async () => {
    const [totalUsers, totalOrgs, totalLogs, activeSessions, connections] =
      await Promise.all([
        prisma.user.count(),
        prisma.organization.count(),
        prisma.auditLog.count(),
        prisma.session.count({
          where: { expiresAt: { gte: new Date() } },
        }),
        prisma.storageConnection.findMany({
          select: { providerType: true },
        }),
      ]);

    const providerCounts = {
      AWS_S3: 0,
      CLOUDFLARE_R2: 0,
      CLOUDINARY: 0,
    };

    connections.forEach((conn) => {
      if (conn.providerType in providerCounts) {
        providerCounts[conn.providerType as keyof typeof providerCounts]++;
      }
    });

    const recentActivity = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return {
      totalUsers,
      totalOrgs,
      totalLogs,
      activeSessions,
      providerDistribution: providerCounts,
      recentActivity: recentActivity.map((log) => ({
        id: log.id,
        userName: log.user.name,
        userEmail: log.user.email,
        action: log.action,
        objectPath: log.objectPath,
        createdAt: log.createdAt,
      })),
    };
  }),
};
