import React from "react";
import { createClient } from "@/lib/supabaseServer";
import { ENV } from "@/config/env";
import { ConnectionsClient } from "@/features/connections/ConnectionsClient";

interface ConnectionsPageProps {
  params: Promise<{
    orgId: string;
  }>;
}

export default async function ConnectionsPage({ params }: ConnectionsPageProps) {
  const resolvedParams = await params;
  const orgId = resolvedParams.orgId;

  let initialConnections: any[] = [];
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (token) {
      const res = await fetch(`${ENV.API_URL}/connections`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Organization-ID": orgId,
        },
        next: { revalidate: 0 },
      });

      if (res.ok) {
        const result = await res.json();
        initialConnections = result.data !== undefined ? result.data : result;
      }
    }
  } catch (err) {
    console.error("Failed to fetch connections in Server Component:", err);
  }

  return <ConnectionsClient initialConnections={initialConnections} orgId={orgId} />;
}
