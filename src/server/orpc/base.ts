import { os, ORPCError } from "@orpc/server";
import { ORPCContext, UserWithTeamAccess } from "./context";
import { prisma, OrgRole } from "@/server/db";

export const base = os.$context<ORPCContext>();

export const publicProcedure = base;

export const authedProcedure = base.use(async ({ context, next }) => {
  if (!context.user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Authentication credentials missing or invalid",
    });
  }

  if (context.user.banned) {
    throw new ORPCError("FORBIDDEN", {
      message: `Access denied: This account has been banned. Reason: ${
        context.user.banReason || "No reason provided"
      }`,
    });
  }

  return next({
    context: {
      ...context,
      user: context.user as UserWithTeamAccess,
    },
  });
});

export const adminProcedure = authedProcedure.use(async ({ context, next }) => {
  if (context.user.role !== "ADMIN") {
    throw new ORPCError("FORBIDDEN", {
      message: "Forbidden: Administrator privileges required",
    });
  }

  return next();
});

export function requireOrgRole(allowedRoles: OrgRole[]) {
  return os
    .$context<ORPCContext & { user: UserWithTeamAccess }>()
    .middleware(async ({ context, next }, input: any) => {
      const orgIdentifier = (input && input.orgId) || context.orgId;
      if (!orgIdentifier) {
        throw new ORPCError("BAD_REQUEST", {
          message:
            "Organization identifier must be provided in X-Organization-ID header or input",
        });
      }

      if (context.user.role === "ADMIN") {
        const org = await prisma.organization.findFirst({
          where: { OR: [{ id: orgIdentifier }, { slug: orgIdentifier }] },
          select: { id: true },
        });
        const resolvedId = org ? org.id : orgIdentifier;
        return next({
          context: {
            ...context,
            orgId: resolvedId,
            orgRole: "OWNER" as OrgRole,
          },
        });
      }

      const membership = context.user.teamAccesses.find(
        (ta) => ta.organizationId === orgIdentifier || ta.organization?.slug === orgIdentifier
      );

      if (!membership || !allowedRoles.includes(membership.role)) {
        throw new ORPCError("FORBIDDEN", {
          message: "Forbidden: Insufficient privileges for this organization",
        });
      }

      return next({
        context: {
          ...context,
          orgId: membership.organizationId,
          orgRole: membership.role,
          membership,
        },
      });
    });
}
