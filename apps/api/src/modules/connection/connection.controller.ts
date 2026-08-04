import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ConnectionService } from "./connection.service";
import { catchAsync, sendResponse, AppError } from "@utils";
import { AuthenticatedRequest } from "../../middlewares/auth";

export class ConnectionController {
  static create = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const orgId = req.headers["x-organization-id"] as string;
    const { label, providerType, credentials, bucketName, region } = req.body;

    if (!label || !providerType || !credentials) {
      throw new AppError("Label, provider type, and credentials are required", StatusCodes.BAD_REQUEST);
    }

    if (providerType !== "AWS_S3" && providerType !== "CLOUDFLARE_R2" && providerType !== "CLOUDINARY") {
      throw new AppError("Invalid provider type", StatusCodes.BAD_REQUEST);
    }

    const connection = await ConnectionService.createConnection({
      organizationId: orgId,
      label,
      providerType,
      credentials,
      bucketName,
      region,
    });

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Storage connection created successfully",
      data: connection,
    });
  });

  static list = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const orgId = req.headers["x-organization-id"] as string;
    const connections = await ConnectionService.listConnections(orgId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Storage connections retrieved successfully",
      data: connections,
    });
  });

  static update = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { connectionId } = req.params;
    const { label, bucketName, region, credentials } = req.body;

    const connection = await ConnectionService.updateConnection(connectionId, {
      label,
      bucketName,
      region,
      credentials,
    });

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Storage connection updated successfully",
      data: connection,
    });
  });

  static delete = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { connectionId } = req.params;

    await ConnectionService.deleteConnection(connectionId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Storage connection revoked successfully",
      data: null,
    });
  });
}
