import React from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { createClient } from "@/lib/supabaseServer";
import { InviteAcceptClient } from "@/features/invite/InviteAcceptClient";

export const metadata = {
  title: "Accept Invitation",
  description: "Accept your team invitation to join a workspace on BucketHQ.",
};

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  // Fetch the invitation
  const invitation = await prisma.teamInvitation.findUnique({
    where: { token },
    include: {
      organization: true,
      invitedBy: { select: { name: true, email: true } },
    },
  });

  // Invalid or missing token
  if (!invitation) {
    return (
      <InviteAcceptClient
        status="invalid"
        token={token}
      />
    );
  }

  // Expired invitation
  if (invitation.expiresAt < new Date()) {
    return (
      <InviteAcceptClient
        status="expired"
        token={token}
        orgName={invitation.organization.name}
      />
    );
  }

  // Check if user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If already a member, redirect to the org dashboard
  if (user) {
    const existingAccess = await prisma.teamAccess.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: invitation.organizationId,
        },
      },
    });

    if (existingAccess) {
      const targetSlug = invitation.organization.slug || invitation.organization.id;
      redirect(`/dashboard/${targetSlug}`);
    }
  }

  return (
    <InviteAcceptClient
      status="valid"
      token={token}
      orgName={invitation.organization.name}
      role={invitation.role}
      inviterName={invitation.invitedBy?.name || "A team member"}
      inviterEmail={invitation.invitedBy?.email || undefined}
      inviteeEmail={invitation.email}
      isAuthenticated={!!user}
    />
  );
}
