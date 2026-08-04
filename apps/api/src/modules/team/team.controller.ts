import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { TeamService } from "./team.service";
import { catchAsync, sendResponse, AppError } from "@utils";
import { AuthenticatedRequest } from "../../middlewares/auth";

export class TeamController {
  static listMembers = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const orgId = req.headers["x-organization-id"] as string;
    const members = await TeamService.listMembers(orgId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Team members list retrieved successfully",
      data: members,
    });
  });

  static inviteMember = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const orgId = req.headers["x-organization-id"] as string;
    const { email, role } = req.body;

    if (!email || !role) {
      throw new AppError("Email and role are required", StatusCodes.BAD_REQUEST);
    }

    if (role !== "OWNER" && role !== "EDITOR" && role !== "VIEWER") {
      throw new AppError("Invalid team role. Must be OWNER, EDITOR, or VIEWER", StatusCodes.BAD_REQUEST);
    }

    const invitation = await TeamService.inviteMember(orgId, email, role);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Team member invited successfully",
      data: invitation,
    });
  });

  static updateMemberRole = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const orgId = req.headers["x-organization-id"] as string;
    const { userId } = req.params;
    const { role } = req.body;

    if (!role) {
      throw new AppError("Role is required", StatusCodes.BAD_REQUEST);
    }

    if (role !== "OWNER" && role !== "EDITOR" && role !== "VIEWER") {
      throw new AppError("Invalid role. Must be OWNER, EDITOR, or VIEWER", StatusCodes.BAD_REQUEST);
    }

    if (userId === req.user.id) {
      throw new AppError("You cannot modify your own organization role", StatusCodes.BAD_REQUEST);
    }

    const updated = await TeamService.updateMemberRole(orgId, userId, role);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Member role updated successfully",
      data: updated,
    });
  });

  static removeMember = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const orgId = req.headers["x-organization-id"] as string;
    const { userId } = req.params;

    if (userId === req.user.id) {
      throw new AppError("You cannot remove yourself from the organization", StatusCodes.BAD_REQUEST);
    }

    await TeamService.removeMember(orgId, userId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Member removed from organization successfully",
      data: null,
    });
  });

  static listPathRestrictions = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { userId, connectionId } = req.params;

    if (!userId || !connectionId) {
      throw new AppError("userId and connectionId are required", StatusCodes.BAD_REQUEST);
    }

    const restrictions = await TeamService.listPathRestrictions(userId, connectionId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Path restrictions retrieved successfully",
      data: restrictions,
    });
  });

  static addPathRestriction = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    const { storageConnectionId, pathPrefix, accessLevel } = req.body;

    if (!userId || !storageConnectionId || !pathPrefix || !accessLevel) {
      throw new AppError("userId, storageConnectionId, pathPrefix, and accessLevel are required", StatusCodes.BAD_REQUEST);
    }

    if (accessLevel !== "READ" && accessLevel !== "WRITE" && accessLevel !== "READ_WRITE") {
      throw new AppError("Invalid accessLevel. Must be READ, WRITE, or READ_WRITE", StatusCodes.BAD_REQUEST);
    }

    const restriction = await TeamService.addPathRestriction(
      userId,
      storageConnectionId,
      pathPrefix,
      accessLevel
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Path restriction rule configured successfully",
      data: restriction,
    });
  });

  static removePathRestriction = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { restrictionId } = req.params;

    if (!restrictionId) {
      throw new AppError("restrictionId is required", StatusCodes.BAD_REQUEST);
    }

    await TeamService.removePathRestriction(restrictionId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Path restriction rule removed successfully",
      data: null,
    });
  });
}
