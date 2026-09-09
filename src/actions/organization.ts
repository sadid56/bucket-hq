"use server";

import { createClient } from "@/lib/supabaseServer";
import { prisma } from "@/server/db";
import { generateUniqueOrgSlug } from "@/server/utils/generateSlug";

export async function createOrgAction(name: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Not authenticated" };
    }

    const slug = await generateUniqueOrgSlug(name);

    const org = await prisma.$transaction(async (tx) => {
      const dbUser = await tx.user.upsert({
        where: { id: user.id },
        update: {
          name: (user.user_metadata?.full_name as string) || "User",
          email: user.email!,
        },
        create: {
          id: user.id,
          email: user.email!,
          name: (user.user_metadata?.full_name as string) || "User",
        },
      });

      const newOrg = await tx.organization.create({
        data: {
          name,
          slug,
        },
      });

      await tx.teamAccess.create({
        data: {
          userId: dbUser.id,
          organizationId: newOrg.id,
          role: "OWNER",
        },
      });

      return newOrg;
    });

    return { success: true, org };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" };
  }
}

export async function updateOrgAction(identifier: string, name: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Not authenticated" };
    }

    // Resolve org by id or slug
    const targetOrg = await prisma.organization.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
    });

    if (!targetOrg) {
      return { error: "Workspace not found" };
    }

    const access = await prisma.teamAccess.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: targetOrg.id,
        },
      },
    });

    if (!access || (access.role !== "OWNER" && access.role !== "EDITOR")) {
      return { error: "Forbidden: You do not have permission to update this workspace" };
    }

    // Generate new unique slug if name changed or if slug is missing
    const newSlug = await generateUniqueOrgSlug(name, targetOrg.id);

    const org = await prisma.organization.update({
      where: { id: targetOrg.id },
      data: {
        name,
        slug: newSlug,
      },
    });

    return { success: true, org };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" };
  }
}

export async function deleteOrgAction(identifier: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Not authenticated" };
    }

    const targetOrg = await prisma.organization.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
    });

    if (!targetOrg) {
      return { error: "Workspace not found" };
    }

    const access = await prisma.teamAccess.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: targetOrg.id,
        },
      },
    });

    if (!access || access.role !== "OWNER") {
      return { error: "Forbidden: Only owners can delete workspaces" };
    }

    await prisma.organization.delete({
      where: { id: targetOrg.id },
    });

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" };
  }
}
