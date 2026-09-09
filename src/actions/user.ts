"use server";

import { createClient } from "@/lib/supabaseServer";
import { prisma } from "@/server/db";

export async function getAuthUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function getDbUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { teamAccesses: true },
    });

    return dbUser;
  } catch {
    return null;
  }
}
