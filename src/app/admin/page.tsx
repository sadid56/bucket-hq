import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";
import { prisma } from "@/server/db";

export default async function AdminIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const teamAccess = await prisma.teamAccess.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  if (teamAccess) {
    redirect(`/admin/${teamAccess.organizationId}`);
  }

  redirect("/dashboard");
}
