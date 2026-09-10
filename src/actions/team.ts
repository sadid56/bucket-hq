"use server";

import crypto from "crypto";
import { createClient } from "@/lib/supabaseServer";
import { prisma } from "@/server/db";
import { sendTeamInviteEmail } from "@/server/lib/mailer";

async function resolveOrgId(orgIdentifier: string): Promise<string> {
  const org = await prisma.organization.findFirst({
    where: { OR: [{ id: orgIdentifier }, { slug: orgIdentifier }] },
    select: { id: true },
  });
  return org ? org.id : orgIdentifier;
}

export async function inviteMemberAction(
  orgId: string,
  data: { email: string; role: "OWNER" | "EDITOR" | "VIEWER" }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Not authenticated" };
    }

    const resolvedOrgId = await resolveOrgId(orgId);

    const callerAccess = await prisma.teamAccess.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: resolvedOrgId,
        },
      },
    });

    if (!callerAccess || callerAccess.role !== "OWNER") {
      return { error: "Forbidden: Only owners can invite members" };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        teamAccesses: {
          where: { organizationId: resolvedOrgId },
        },
      },
    });

    if (existingUser && existingUser.teamAccesses.length > 0) {
      return { error: "User is already a member of this organization" };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await prisma.teamInvitation.upsert({
      where: {
        organizationId_email: {
          organizationId: resolvedOrgId,
          email: data.email,
        },
      },
      update: {
        role: data.role,
        token,
        expiresAt,
        invitedById: user.id,
      },
      create: {
        organizationId: resolvedOrgId,
        email: data.email,
        role: data.role,
        token,
        expiresAt,
        invitedById: user.id,
      },
      include: {
        organization: true,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${baseUrl}/invite/${token}`;

    const inviterRecord = await prisma.user.findUnique({ where: { id: user.id } });
    await sendTeamInviteEmail({
      to: data.email,
      inviterName: inviterRecord?.name || "A team owner",
      orgName: invitation.organization.name,
      role: data.role,
      inviteUrl,
    });

    return { success: true, inviteUrl, token };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" };
  }
}

export async function acceptInvitationAction(token: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Not authenticated" };
    }

    const invitation = await prisma.teamInvitation.findUnique({
      where: { token },
      include: { organization: true },
    });

    if (!invitation) {
      return { error: "Invitation not found or invalid" };
    }

    if (invitation.expiresAt < new Date()) {
      return { error: "Invitation has expired" };
    }

    await prisma.teamAccess.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: invitation.organizationId,
        },
      },
      update: {
        role: invitation.role,
      },
      create: {
        userId: user.id,
        organizationId: invitation.organizationId,
        role: invitation.role,
      },
    });

    await prisma.teamInvitation.delete({
      where: { id: invitation.id },
    });

    return {
      success: true,
      redirectUrl: `/dashboard/${invitation.organization.slug || invitation.organization.id}`,
    };
  } catch (err: any) {
    return { error: err.message || "Failed to accept invitation" };
  }
}

export async function updateMemberRoleAction(
  orgId: string,
  userId: string,
  role: "OWNER" | "EDITOR" | "VIEWER"
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Not authenticated" };
    }

    const resolvedOrgId = await resolveOrgId(orgId);

    const callerAccess = await prisma.teamAccess.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: resolvedOrgId,
        },
      },
    });

    if (!callerAccess || callerAccess.role !== "OWNER") {
      return { error: "Forbidden: Only owners can update roles" };
    }

    const member = await prisma.teamAccess.update({
      where: {
        userId_organizationId: {
          userId,
          organizationId: resolvedOrgId,
        },
      },
      data: { role },
      include: {
        user: true,
      },
    });

    return { success: true, member };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" };
  }
}

export async function removeMemberAction(orgId: string, userId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Not authenticated" };
    }

    const resolvedOrgId = await resolveOrgId(orgId);

    const callerAccess = await prisma.teamAccess.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: resolvedOrgId,
        },
      },
    });

    if (!callerAccess || callerAccess.role !== "OWNER") {
      return { error: "Forbidden: Only owners can remove members" };
    }

    if (userId === user.id) {
      return { error: "You cannot remove yourself from the organization" };
    }

    await prisma.teamAccess.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId: resolvedOrgId,
        },
      },
    });

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" };
  }
}
