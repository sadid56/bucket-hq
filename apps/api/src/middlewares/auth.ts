import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "@repo/database";
import { AppError, catchAsync } from "@utils";
import { getSupabaseAdmin } from "../lib/supabase";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateUser = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Authentication credentials missing or invalid", StatusCodes.UNAUTHORIZED);
  }

  const token = authHeader.split(" ")[1];
  try {
    const supabase = getSupabaseAdmin();
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

    if (error || !supabaseUser) {
      throw new AppError("Invalid or expired authentication token", StatusCodes.UNAUTHORIZED);
    }

    let user = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
      include: { teamAccesses: true },
    });

    if (!user && supabaseUser.email) {
      const invitedUser = await prisma.user.findUnique({
        where: { email: supabaseUser.email },
      });

      if (invitedUser) {
        user = await prisma.user.update({
          where: { email: supabaseUser.email },
          data: { id: supabaseUser.id },
          include: { teamAccesses: true },
        });
      }
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email!,
          name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split("@")[0] || "User",
        },
        include: { teamAccesses: true },
      });
    }

    if (user.banned) {
      throw new AppError(`Access denied: This account has been banned. Reason: ${user.banReason || "No reason provided"}`, StatusCodes.FORBIDDEN);
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError("Invalid or expired authentication token", StatusCodes.UNAUTHORIZED);
  }
});

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "ADMIN") {
    throw new AppError("Forbidden: Administrator privileges required", StatusCodes.FORBIDDEN);
  }
  next();
}

export function requireOrgRole(allowedRoles: ("OWNER" | "EDITOR" | "VIEWER")[]) {
  return catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("User not authenticated", StatusCodes.UNAUTHORIZED);
    }

    const orgId = req.headers["x-organization-id"] as string || req.query.orgId as string;
    if (!orgId) {
      throw new AppError("Organization ID must be provided in X-Organization-ID header or orgId query param", StatusCodes.BAD_REQUEST);
    }

    const membership = await prisma.teamAccess.findUnique({
      where: {
        userId_organizationId: {
          userId: req.user.id,
          organizationId: orgId,
        },
      },
    });

    if (req.user.role === "ADMIN") {
      return next();
    }

    if (!membership || !allowedRoles.includes(membership.role)) {
      throw new AppError("Forbidden: Insufficient privileges for this organization", StatusCodes.FORBIDDEN);
    }

    req.user.orgMembership = membership;
    next();
  });
}
