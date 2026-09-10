import { SettingsClient } from "@/features/settings/SettingsClient";

interface SettingsPageProps {
  params: Promise<{
    orgId: string;
  }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { orgId } = await params;
  return <SettingsClient orgId={orgId} />;
}
