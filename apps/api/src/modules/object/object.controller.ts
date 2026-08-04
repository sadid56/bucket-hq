import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ObjectService } from "./object.service";
import { catchAsync, sendResponse, AppError } from "@utils";
import { AuthenticatedRequest } from "../../middlewares/auth";

export class ObjectController {
  static listObjects = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const connectionId = req.query.connectionId as string;
    const prefix = (req.query.prefix as string) || "";

    if (!connectionId) {
      throw new AppError("connectionId query parameter is required", StatusCodes.BAD_REQUEST);
    }

    const result = await ObjectService.listObjects(req.user.id, connectionId, prefix);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Objects listed successfully",
      data: result,
    });
  });

  static deleteObject = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { connectionId, key } = req.body;

    if (!connectionId || !key) {
      throw new AppError("connectionId and key are required", StatusCodes.BAD_REQUEST);
    }

    await ObjectService.deleteObject(req.user.id, connectionId, key, req.ip);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Object deleted successfully",
      data: null,
    });
  });
}
