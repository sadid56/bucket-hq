"use server";

import { createClient } from "@/lib/supabaseServer";
import { ENV } from "@/config/env";

export async function createOrgAction(name: string) {
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

    const res = await fetch(`${apiUrl}/organizations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || "Failed to create workspace" };
    }

    const orgRes = await res.json();
    const org = orgRes.data !== undefined ? orgRes.data : orgRes;

    return { success: true, org };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" };
  }
}

export async function updateOrgAction(orgId: string, name: string) {
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

    const res = await fetch(`${apiUrl}/organizations`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orgId, name }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || "Failed to update workspace name" };
    }

    const orgRes = await res.json();
    const org = orgRes.data !== undefined ? orgRes.data : orgRes;

    return { success: true, org };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" };
  }
}

export async function deleteOrgAction(orgId: string) {
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

    const res = await fetch(`${apiUrl}/organizations/${orgId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.message || "Failed to delete workspace" };
    }

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred" };
  }
}
