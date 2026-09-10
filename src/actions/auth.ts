"use server";

import { createClient } from "@/lib/supabaseServer";
import { prisma } from "@/server/db";
import { generateUniqueOrgSlug } from "@/server/utils/generateSlug";

export async function loginAction(data: { email: string; password: string; inviteToken?: string }) {
  try {
    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { error: error.message };
    }

    if (authData.user) {
      const user = authData.user;

      // Handle invite token redemption on login
      if (data.inviteToken) {
        const invitation = await prisma.teamInvitation.findUnique({
          where: { token: data.inviteToken },
          include: { organization: true },
        });

        if (invitation && invitation.expiresAt >= new Date()) {
          // Ensure DB user exists
          await prisma.user.upsert({
            where: { id: user.id },
            update: {
              email: user.email!,
              name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
            },
            create: {
              id: user.id,
              email: user.email!,
              name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
            },
          });

          // Join invited organization
          await prisma.teamAccess.upsert({
            where: {
              userId_organizationId: {
                userId: user.id,
                organizationId: invitation.organizationId,
              },
            },
            update: { role: invitation.role },
            create: {
              userId: user.id,
              organizationId: invitation.organizationId,
              role: invitation.role,
            },
          });

          // Remove redeemed invitation
          await prisma.teamInvitation.delete({
            where: { id: invitation.id },
          });

          const targetSlug = invitation.organization.slug || invitation.organization.id;
          return { success: true, redirectUrl: `/dashboard/${targetSlug}` };
        }
      }

      let access = await prisma.teamAccess.findFirst({
        where: { userId: user.id },
        include: { organization: true },
        orderBy: { createdAt: "desc" },
      });

      if (!access) {
        const dbUser = await prisma.user.upsert({
          where: { id: user.id },
          update: {
            email: user.email!,
            name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          },
          create: {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          },
        });

        const orgName = `${dbUser.name}'s Workspace`;
        const slug = await generateUniqueOrgSlug(orgName);

        const org = await prisma.organization.create({
          data: {
            name: orgName,
            slug,
          },
        });

        access = await prisma.teamAccess.create({
          data: {
            userId: dbUser.id,
            organizationId: org.id,
            role: "OWNER",
          },
          include: { organization: true },
        });
      }

      const targetSlug = access.organization.slug || access.organizationId;
      return { success: true, redirectUrl: `/dashboard/${targetSlug}` };
    }

    return { success: true, redirectUrl: "/dashboard" };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred during sign-in" };
  }
}

export async function signupAction(data: {
  name: string;
  email: string;
  orgName?: string;
  password: string;
  inviteToken?: string;
}) {
  try {
    const supabase = await createClient();

    // If invite token is provided, validate it first
    let invitation: any = null;
    if (data.inviteToken) {
      invitation = await prisma.teamInvitation.findUnique({
        where: { token: data.inviteToken },
        include: { organization: true },
      });

      if (!invitation) {
        return { error: "Invitation not found or invalid" };
      }

      if (invitation.expiresAt < new Date()) {
        return { error: "This invitation has expired" };
      }
    }

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
      return { error: error.message };
    }

    if (!authData.user) {
      return { error: "User registration failed" };
    }

    if (!authData.session) {
      return { success: true, requiresConfirmation: true };
    }

    const user = authData.user;
    const targetSlug = await prisma.$transaction(async (tx) => {
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

      if (invitation) {
        // User joined via invitation
        await tx.teamAccess.upsert({
          where: {
            userId_organizationId: {
              userId: dbUser.id,
              organizationId: invitation.organizationId,
            },
          },
          update: {
            role: invitation.role,
          },
          create: {
            userId: dbUser.id,
            organizationId: invitation.organizationId,
            role: invitation.role,
          },
        });

        // Delete redeemed invitation
        await tx.teamInvitation.delete({
          where: { id: invitation.id },
        });

        return invitation.organization.slug || invitation.organization.id;
      } else {
        // Regular signup: create default organization
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

        return newOrg.slug || newOrg.id;
      }
    });

    return { success: true, orgId: targetSlug, session: authData.session };
  } catch (err: any) {
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
    return { error: err.message || "Failed to send reset email" };
  }
}
