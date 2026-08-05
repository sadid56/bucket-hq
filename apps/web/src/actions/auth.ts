"use server";

import { createClient } from "@/lib/supabaseServer";
import { ENV } from "@/config/env";

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
      return { error: error.message };
    }

    if (!authData.session) {
      return { success: true, requiresConfirmation: true };
    }

    // Call organizations API
    const token = authData.session.access_token;
    const apiUrl = ENV.API_URL;
    const orgRes = await fetch(`${apiUrl}/organizations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: data.orgName }),
    }).then((res) => res.json());

    if (orgRes.error) {
      return { error: orgRes.message || "Failed to create default organization", session: authData.session };
    }

    return { success: true, orgId: orgRes.data?.id, session: authData.session };
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
    return { error: err.message || "An unexpected error occurred during password reset" };
  }
}
