import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { OrganizationService } from "./organization.service";
import { catchAsync, sendResponse, AppError } from "@utils";
import { AuthenticatedRequest } from "../../middlewares/auth";

export class OrganizationController {
  static create = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { name } = req.body;
    if (!name || name.trim() === "") {
      throw new AppError("Organization name is required", StatusCodes.BAD_REQUEST);
    }

    const org = await OrganizationService.createOrganization(name, req.user.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Organization created successfully",
      data: org,
    });
  });

  static list = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const orgs = await OrganizationService.listUserOrganizations(req.user.id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Organizations retrieved successfully",
      data: orgs,
    });
  });

  static update = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { orgId } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      throw new AppError("Organization name is required", StatusCodes.BAD_REQUEST);
    }

    const org = await OrganizationService.updateOrganization(orgId, name);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Organization updated successfully",
      data: org,
    });
  });

  static delete = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { orgId } = req.params;

    await OrganizationService.deleteOrganization(orgId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Organization deleted successfully",
      data: null,
    });
  });
}
