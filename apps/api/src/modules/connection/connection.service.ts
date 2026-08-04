import { prisma } from "@repo/database";
import { encrypt } from "../../utils/encryption";

export class ConnectionService {

  static async createConnection(data: {
    organizationId: string;
    label: string;
    providerType: "AWS_S3" | "CLOUDFLARE_R2" | "CLOUDINARY";
    credentials: any;
    bucketName?: string;
    region?: string;
  }) {
    const credsJson = JSON.stringify(data.credentials);
    const { iv, encryptedData, authTag } = encrypt(credsJson);

    return await prisma.storageConnection.create({
      data: {
        organizationId: data.organizationId,
        label: data.label,
        providerType: data.providerType,
        encryptedCreds: encryptedData,
        iv,
        authTag,
        bucketName: data.bucketName || null,
        region: data.region || null,
      },
      select: {
        id: true,
        label: true,
        providerType: true,
        bucketName: true,
        region: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async listConnections(organizationId: string) {
    return await prisma.storageConnection.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        label: true,
        providerType: true,
        bucketName: true,
        region: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async updateConnection(
    connectionId: string,
    data: {
      label?: string;
      bucketName?: string;
      region?: string;
      credentials?: any;
    }
  ) {
    const updateData: any = {};

    if (data.label !== undefined) updateData.label = data.label;
    if (data.bucketName !== undefined) updateData.bucketName = data.bucketName;
    if (data.region !== undefined) updateData.region = data.region;

    if (data.credentials) {
      const credsJson = JSON.stringify(data.credentials);
      const { iv, encryptedData, authTag } = encrypt(credsJson);
      updateData.encryptedCreds = encryptedData;
      updateData.iv = iv;
      updateData.authTag = authTag;
    }

    return await prisma.storageConnection.update({
      where: { id: connectionId },
      data: updateData,
      select: {
        id: true,
        label: true,
        providerType: true,
        bucketName: true,
        region: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async deleteConnection(connectionId: string) {
    return await prisma.storageConnection.delete({
      where: { id: connectionId },
    });
  }

  static async getConnectionWithCreds(connectionId: string) {
    return await prisma.storageConnection.findUnique({
      where: { id: connectionId },
    });
  }
}
