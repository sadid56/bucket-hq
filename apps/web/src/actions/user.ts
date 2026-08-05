"use server";

import { ENV } from "@/config/env";
import { createClient } from "@/lib/supabaseServer";

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
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.access_token) {
      return null;
    }

    const apiUrl = ENV.API_URL;

    const res = await fetch(`${apiUrl}/users/me`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!res.ok) {
      return null;
    }

    const result = await res.json();
    return result.data !== undefined ? result.data : result;
  } catch {
    return null;
  }
}
