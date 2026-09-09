import React from "react";
import { DashboardLayoutClient } from "@/components/layout/DashboardLayoutClient";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
