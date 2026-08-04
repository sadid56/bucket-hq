import { prisma } from "@repo/database";
import { parseDevice } from "@utils";

export class UserService {

  static async getUsers(search: string = "") {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      where: search
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } }
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
  }

  static async toggleBanUser(userId: string, banned: boolean, reason?: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        banned,
        banReason: banned ? reason || "No reason specified" : null,
      },
    });
  }

  static async updateGlobalRole(userId: string, role: "ADMIN" | "MEMBER") {
    return await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }
}
