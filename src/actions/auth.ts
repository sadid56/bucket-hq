"use server";

import { createClient } from "@/lib/supabaseServer";
import { prisma } from "@/server/db";
import { generateUniqueOrgSlug } from "@/server/utils/generateSlug";

export async function loginAction(data: { email: string; password: string }) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred during sign-in" };
  }
}

export async function signupAction(data: { name: string; email: string; orgName: string; password: string }) {
  try {
    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
        },
      },
    });

    if (error) {
      console.error("Supabase Auth signUp error:", error);
      return { error: error.message };
    }

    if (!authData.user) {
      return { error: "User registration failed" };
    }

    if (!authData.session) {
      return { success: true, requiresConfirmation: true };
    }

    // Direct database transaction: create/upsert User and default Organization
    const user = authData.user;
    const org = await prisma.$transaction(async (tx) => {
      const dbUser = await tx.user.upsert({
        where: { id: user.id },
        update: {
          name: data.name || (user.user_metadata?.full_name as string) || "User",
          email: data.email,
        },
        create: {
          id: user.id,
          email: data.email,
          name: data.name || (user.user_metadata?.full_name as string) || "User",
        },
      });

      const targetOrgName = data.orgName?.trim() || data.name?.trim() || "Workspace";
      const slug = await generateUniqueOrgSlug(targetOrgName);
      const newOrg = await tx.organization.create({
        data: {
          name: targetOrgName,
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

    return { success: true, orgId: org.slug || org.id, session: authData.session };
  } catch (err: any) {
    console.error("Signup error in signupAction:", err);
    return { error: err.message || "An unexpected error occurred during signup" };
  }
}

export async function resetPasswordAction(data: { email: string; redirectTo: string }) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: data.redirectTo,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred during password reset" };
  }
}
