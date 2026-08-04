import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { SigningService } from "./signing.service";
import { catchAsync, sendResponse, AppError } from "@utils";
import { AuthenticatedRequest } from "../../middlewares/auth";

export class SigningController {
  static getUploadUrl = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { connectionId, key } = req.body;

    if (!connectionId || !key) {
      throw new AppError("connectionId and key are required", StatusCodes.BAD_REQUEST);
    }

    const url = await SigningService.getUploadUrl(
      req.user.id,
      connectionId,
      key,
      req.ip
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Pre-signed upload URL generated successfully",
      data: { url },
    });
  });

  static getDownloadUrl = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { connectionId, key } = req.body;

    if (!connectionId || !key) {
      throw new AppError("connectionId and key are required", StatusCodes.BAD_REQUEST);
    }

    const url = await SigningService.getDownloadUrl(
      req.user.id,
      connectionId,
      key,
      req.ip
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Pre-signed download URL generated successfully",
      data: { url },
    });
  });
}
