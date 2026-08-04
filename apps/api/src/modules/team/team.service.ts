import { prisma } from "@repo/database";
import { AppError } from "../../utils/AppError";
import { StatusCodes } from "http-status-codes";

export class TeamService {

  static async listMembers(organizationId: string) {
    const accesses = await prisma.teamAccess.findMany({
      where: { organizationId },
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
  }

  static async inviteMember(organizationId: string, email: string, role: "OWNER" | "EDITOR" | "VIEWER") {

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const tempId = `invited-${email}-${Date.now()}`;
      user = await prisma.user.create({
        data: {
          id: tempId,
          email,
          name: email.split("@")[0] || "Invited User",
        },
      });
    }

    const existingAccess = await prisma.teamAccess.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
    });

    if (existingAccess) {
      throw new AppError("User is already a member of this organization", StatusCodes.BAD_REQUEST);
    }

    return await prisma.teamAccess.create({
      data: {
        userId: user.id,
        organizationId,
        role,
      },
    });
  }

  static async updateMemberRole(organizationId: string, userId: string, role: "OWNER" | "EDITOR" | "VIEWER") {
    return await prisma.teamAccess.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
      data: { role },
    });
  }

  static async removeMember(organizationId: string, userId: string) {

    const ownersCount = await prisma.teamAccess.count({
      where: { organizationId, role: "OWNER" },
    });

    const targetAccess = await prisma.teamAccess.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
    });

    if (targetAccess?.role === "OWNER" && ownersCount <= 1) {
      throw new AppError("Cannot remove the last owner of the organization", StatusCodes.BAD_REQUEST);
    }

    return await prisma.$transaction(async (tx) => {

      const connections = await tx.storageConnection.findMany({
        where: { organizationId },
        select: { id: true },
      });
      const connectionIds = connections.map((c) => c.id);

      await tx.pathRestriction.deleteMany({
        where: {
          userId,
          storageConnectionId: { in: connectionIds },
        },
      });

      return await tx.teamAccess.delete({
        where: {
          userId_organizationId: {
            userId,
            organizationId,
          },
        },
      });
    });
  }

  static async listPathRestrictions(userId: string, connectionId: string) {
    return await prisma.pathRestriction.findMany({
      where: {
        userId,
        storageConnectionId: connectionId,
      },
    });
  }

  static async addPathRestriction(
    userId: string,
    connectionId: string,
    pathPrefix: string,
    accessLevel: "READ" | "WRITE" | "READ_WRITE"
  ) {

    const cleanPrefix = pathPrefix.replace(/^\/+/g, "").replace(/\/+$/g, "") + "/";

    return await prisma.pathRestriction.upsert({
      where: {
        userId_storageConnectionId_pathPrefix: {
          userId,
          storageConnectionId: connectionId,
          pathPrefix: cleanPrefix,
        },
      },
      update: { accessLevel },
      create: {
        userId,
        storageConnectionId: connectionId,
        pathPrefix: cleanPrefix,
        accessLevel,
      },
    });
  }

  static async removePathRestriction(restrictionId: string) {
    return await prisma.pathRestriction.delete({
      where: { id: restrictionId },
    });
  }
}
