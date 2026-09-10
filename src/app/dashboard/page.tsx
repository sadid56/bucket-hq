import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { prisma } from "@/server/db";
import { generateUniqueOrgSlug } from "@/server/utils/generateSlug";

export default async function DashboardIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  let access = await prisma.teamAccess.findFirst({
    where: { userId: user.id },
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });

  if (!access) {
    // Ensure User record exists
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

  redirect(`/dashboard/${access.organization.slug || access.organizationId}`);
}
