import { prisma } from "@repo/database";
import { getStorageClient } from "../../services/storage";
import { isPathAllowed } from "../../utils/path";
import { AppError } from "../../utils/AppError";
import { StatusCodes } from "http-status-codes";

export class SigningService {

  static async validatePathPermissions(
    userId: string,
    connectionId: string,
    requestedPath: string,
    requiredLevel: "READ" | "WRITE"
  ) {

    const restrictions = await prisma.pathRestriction.findMany({
      where: {
        userId,
        storageConnectionId: connectionId,
      },
    });

    if (restrictions.length === 0) {
      return true;
    }

    for (const restriction of restrictions) {
      const levelMatches =
        requiredLevel === "READ"
          ? ["READ", "READ_WRITE"].includes(restriction.accessLevel)
          : ["WRITE", "READ_WRITE"].includes(restriction.accessLevel);

      if (levelMatches && isPathAllowed(requestedPath, restriction.pathPrefix)) {
        return true;
      }
    }

    throw new AppError(
      `Access denied: You do not have permission to ${requiredLevel.toLowerCase()} at this path.`,
      StatusCodes.FORBIDDEN
    );
  }

  static async getUploadUrl(
    userId: string,
    connectionId: string,
    key: string,
    ipAddress?: string
  ) {

    const connection = await prisma.storageConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new AppError("Storage connection not found", StatusCodes.NOT_FOUND);
    }

    await this.validatePathPermissions(userId, connectionId, key, "WRITE");

    const client = getStorageClient(connection);
    const url = await client.generateUploadUrl(key);

    await prisma.auditLog.create({
      data: {
        userId,
        action: "SIGN_UPLOAD",
        ipAddress,
        objectPath: key,
        storageConnectionId: connectionId,
        details: JSON.stringify({
          providerType: connection.providerType,
          label: connection.label,
        }),
      },
    });

    return url;
  }

  static async getDownloadUrl(
    userId: string,
    connectionId: string,
    key: string,
    ipAddress?: string
  ) {
    const connection = await prisma.storageConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new AppError("Storage connection not found", StatusCodes.NOT_FOUND);
    }

    await this.validatePathPermissions(userId, connectionId, key, "READ");

    const client = getStorageClient(connection);
    const url = await client.generateDownloadUrl(key);

    await prisma.auditLog.create({
      data: {
        userId,
        action: "SIGN_DOWNLOAD",
        ipAddress,
        objectPath: key,
        storageConnectionId: connectionId,
        details: JSON.stringify({
          providerType: connection.providerType,
          label: connection.label,
        }),
      },
    });

    return url;
  }
}
