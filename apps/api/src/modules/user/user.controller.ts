import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UserService } from "./user.service";
import { catchAsync, sendResponse, AppError } from "@utils";
import { AuthenticatedRequest } from "../../middlewares/auth";

export class UserController {
  static getMe = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "User profile retrieved successfully",
      data: req.user,
    });
  });

  static getUsers = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const search = (req.query.search as string) || "";
    const users = await UserService.getUsers(search);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Users retrieved successfully",
      data: users,
    });
  });

  static toggleBan = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    const { banned, reason } = req.body;

    if (userId === req.user.id) {
      throw new AppError("You cannot ban yourself", StatusCodes.BAD_REQUEST);
    }

    const updatedUser = await UserService.toggleBanUser(userId, banned, reason);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: banned ? "User banned successfully" : "User unbanned successfully",
      data: updatedUser,
    });
  });

  static updateRole = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (userId === req.user.id) {
      throw new AppError("You cannot modify your own global role", StatusCodes.BAD_REQUEST);
    }

    if (role !== "ADMIN" && role !== "MEMBER") {
      throw new AppError("Invalid global role. Must be ADMIN or MEMBER", StatusCodes.BAD_REQUEST);
    }

    const updatedUser = await UserService.updateGlobalRole(userId, role);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Global role updated successfully",
      data: updatedUser,
    });
  });
}
