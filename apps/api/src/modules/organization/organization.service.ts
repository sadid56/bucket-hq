import { prisma } from "@repo/database";

export class OrganizationService {

  static async createOrganization(name: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name,
        },
      });

      await tx.teamAccess.create({
        data: {
          userId,
          organizationId: org.id,
          role: "OWNER",
        },
      });

      return org;
    });
  }

  static async listUserOrganizations(userId: string) {
    const teamAccesses = await prisma.teamAccess.findMany({
      where: { userId },
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
    });

    return teamAccesses.map((ta) => ({
      ...ta.organization,
      userRole: ta.role,
    }));
  }

  static async updateOrganization(organizationId: string, name: string) {
    return await prisma.organization.update({
      where: { id: organizationId },
      data: { name },
    });
  }

  static async deleteOrganization(organizationId: string) {
    return await prisma.organization.delete({
      where: { id: organizationId },
    });
  }
}
