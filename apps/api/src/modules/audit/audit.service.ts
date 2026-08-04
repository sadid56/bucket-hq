import { prisma } from "@repo/database";

export interface AuditFilters {
  action?: string;
  userId?: string;
  storageConnectionId?: string;
  startDate?: string;
  endDate?: string;
}

export class AuditService {

  static async getAuditLogs(filters: AuditFilters, connectionIds?: string[]) {
    const whereClause: any = {};

    if (connectionIds) {
      whereClause.storageConnectionId = { in: connectionIds };
    } else if (filters.storageConnectionId) {
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
  }

  static async getSystemStats() {
    const [
      totalUsers,
      totalOrgs,
      totalLogs,
      activeSessions,
      connections,
    ] = await Promise.all([
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
  }
}
