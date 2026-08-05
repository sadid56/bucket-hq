import React from "react";
import { DashboardClient } from "@/features/dashboard/DashboardClient";

interface DashboardPageProps {
  params: Promise<{
    orgId: string;
  }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const resolvedParams = await params;
  return <DashboardClient orgId={resolvedParams.orgId} />;
}
