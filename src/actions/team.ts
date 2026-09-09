"use server";

import { createClient } from "@/lib/supabaseServer";
import { prisma } from "@/server/db";

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

    const callerAccess = await prisma.teamAccess.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: orgId,
        },
      },
    });

    if (!callerAccess || callerAccess.role !== "OWNER") {
      return { error: "Forbidden: Only owners can invite members" };
    }

    let targetUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!targetUser) {
      targetUser = await prisma.user.create({
        data: {
          id: `invited-${data.email}-${Date.now()}`,
          email: data.email,
          name: data.email.split("@")[0] || "Invited User",
        },
      });
    }

    const existingAccess = await prisma.teamAccess.findUnique({
      where: {
        userId_organizationId: {
          userId: targetUser.id,
          organizationId: orgId,
        },
      },
    });

    if (existingAccess) {
      return { error: "User is already a member of this organization" };
    }

    const member = await prisma.teamAccess.create({
      data: {
        userId: targetUser.id,
        organizationId: orgId,
        role: data.role,
      },
      include: {
        user: true,
      },
    });

    return { success: true, member };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" };
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

    const callerAccess = await prisma.teamAccess.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: orgId,
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
          organizationId: orgId,
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

    const callerAccess = await prisma.teamAccess.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: orgId,
        },
      },
    });

    if (!callerAccess || callerAccess.role !== "OWNER") {
      return { error: "Forbidden: Only owners can remove members" };
    }

    await prisma.teamAccess.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    });

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" };
  }
}
