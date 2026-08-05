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
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    try {
      await prisma.$executeRawUnsafe(
        `UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', $1) WHERE id = $2`,
        role,
        userId
      );
    } catch (err) {
      console.error("Failed to sync role to Supabase metadata during update:", err);
    }

    return updatedUser;
  }

  static async updateProfile(userId: string, data: { name?: string; image?: string }) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        image: data.image,
      },
    });

    try {
      const updates: Record<string, string> = {};
      if (data.name) updates.full_name = data.name;
      if (data.image) updates.avatar_url = data.image;

      if (Object.keys(updates).length > 0) {
        await prisma.$executeRawUnsafe(
          `UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || $1::jsonb WHERE id = $2`,
          JSON.stringify(updates),
          userId
        );
      }
    } catch (err) {
      console.error("Failed to sync updated profile to Supabase auth:", err);
    }

    return updatedUser;
  }
}
