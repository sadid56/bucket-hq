"use client";

import React, { Suspense } from "react";
import { FileExplorer } from "@/features/explorer/components/FileExplorer";

export default function ExplorerPage() {
  return (
    <Suspense fallback={null}>
      <FileExplorer />
    </Suspense>
  );
}
