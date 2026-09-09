import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { prisma } from "@/server/db";

export default async function DashboardIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const access = await prisma.teamAccess.findFirst({
    where: { userId: user.id },
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });

  redirect(access ? `/dashboard/${access.organization.slug || access.organizationId}` : "/auth/signup");
}
