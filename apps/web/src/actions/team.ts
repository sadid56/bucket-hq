"use server";

import { createClient } from "@/lib/supabaseServer";
import { ENV } from "@/config/env";

export async function inviteMemberAction(
  orgId: string,
  data: { email: string; role: "OWNER" | "EDITOR" | "VIEWER" }
) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      return { error: "Not authenticated" };
    }

    const token = session.access_token;
    const apiUrl = ENV.API_URL;

    const res = await fetch(`${apiUrl}/team/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Organization-ID": orgId,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || "Failed to invite member" };
    }

    const result = await res.json();
    return { success: true, member: result.data !== undefined ? result.data : result };
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
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      return { error: "Not authenticated" };
    }

    const token = session.access_token;
    const apiUrl = ENV.API_URL;

    const res = await fetch(`${apiUrl}/team/${userId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Organization-ID": orgId,
      },
      body: JSON.stringify({ role }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || "Failed to update member role" };
    }

    const result = await res.json();
    return { success: true, member: result.data !== undefined ? result.data : result };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" };
  }
}

export async function removeMemberAction(orgId: string, userId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      return { error: "Not authenticated" };
    }

    const token = session.access_token;
    const apiUrl = ENV.API_URL;

    const res = await fetch(`${apiUrl}/team/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Organization-ID": orgId,
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || "Failed to remove member" };
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" };
  }
}
