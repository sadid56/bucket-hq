import { prisma } from "@repo/database";
import { getStorageClient } from "../../services/storage";
import { SigningService } from "../signing/signing.service";
import { AppError } from "../../utils/AppError";
import { StatusCodes } from "http-status-codes";

export class ObjectService {

  static async listObjects(userId: string, connectionId: string, prefix: string = "") {
    const connection = await prisma.storageConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new AppError("Storage connection not found", StatusCodes.NOT_FOUND);
    }

    await SigningService.validatePathPermissions(userId, connectionId, prefix, "READ");

    const client = getStorageClient(connection);
    return await client.listObjects(prefix);
  }

  static async deleteObject(
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

    await SigningService.validatePathPermissions(userId, connectionId, key, "WRITE");

    const client = getStorageClient(connection);
    await client.deleteObject(key);

    await prisma.auditLog.create({
      data: {
        userId,
        action: "DELETE_OBJECT",
        ipAddress,
        objectPath: key,
        storageConnectionId: connectionId,
        details: JSON.stringify({
          providerType: connection.providerType,
          label: connection.label,
        }),
      },
    });
  }
}
