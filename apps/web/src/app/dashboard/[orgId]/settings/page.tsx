import React from "react";
import { createClient } from "@/lib/supabaseServer";
import { ENV } from "@/config/env";
import { SettingsClient } from "@/features/settings/SettingsClient";

interface SettingsPageProps {
  params: Promise<{
    orgId: string;
  }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const resolvedParams = await params;
  const orgId = resolvedParams.orgId;

  let orgs: any[] = [];
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (token) {
      const res = await fetch(`${ENV.API_URL}/organizations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 0 },
      });

      if (res.ok) {
        const result = await res.json();
        orgs = result.data !== undefined ? result.data : result;
      }
    }
  } catch (err) {
    console.error("Failed to fetch workspaces in Server Component settings page:", err);
  }

  return <SettingsClient orgs={orgs} orgId={orgId} />;
}
