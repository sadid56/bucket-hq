import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuditService, AuditFilters } from "./audit.service";
import { prisma } from "@repo/database";
import { catchAsync, sendResponse, AppError } from "@utils";
import { AuthenticatedRequest } from "../../middlewares/auth";

export class AuditController {

  static getLogs = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { action, userId, storageConnectionId, startDate, endDate } = req.query;

    const filters: AuditFilters = {
      action: action as string,
      userId: userId as string,
      storageConnectionId: storageConnectionId as string,
      startDate: startDate as string,
      endDate: endDate as string,
    };

    if (req.user.role === "ADMIN") {
      const logs = await AuditService.getAuditLogs(filters);
      return sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "All system audit logs retrieved successfully",
        data: logs,
      });
    }

    const orgId = req.headers["x-organization-id"] as string || req.query.orgId as string;
    if (!orgId) {
      throw new AppError("Organization context (X-Organization-ID) required", StatusCodes.BAD_REQUEST);
    }

    const membership = await prisma.teamAccess.findUnique({
      where: {
        userId_organizationId: {
          userId: req.user.id,
          organizationId: orgId,
        },
      },
    });

    if (!membership) {
      throw new AppError("Forbidden: You are not a member of this organization", StatusCodes.FORBIDDEN);
    }

    const connections = await prisma.storageConnection.findMany({
      where: { organizationId: orgId },
      select: { id: true },
    });
    const connectionIds = connections.map((c) => c.id);

    const logs = await AuditService.getAuditLogs(filters, connectionIds);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Organization audit logs retrieved successfully",
      data: logs,
    });
  });

  static getStats = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await AuditService.getSystemStats();

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "System statistics retrieved successfully",
      data: stats,
    });
  });
}
