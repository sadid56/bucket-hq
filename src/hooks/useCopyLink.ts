import { useCallback } from "react";
import { toaster } from "@/components/ui/toaster";

interface StorageItem {
  key: string;
  name: string;
  size: number;
  lastModified?: string;
  type: "file" | "folder";
}

export function useCopyLink(activeConnectionId: string, getSigningMutation: any) {
  const handleCopyLink = useCallback(async (item: StorageItem) => {
    try {
      const res = await getSigningMutation.mutateAsync({
        action: "download",
        connectionId: activeConnectionId,
        key: item.key,
      });
      const urlToCopy = res.publicUrl || res.url;
      await navigator.clipboard.writeText(urlToCopy);
      toaster.create({
        title: "Link copied to clipboard",
        type: "success",
      });
    } catch (err: any) {
      toaster.create({
        title: "Failed to get link",
        description: err.message,
        type: "error",
      });
    }
  }, [activeConnectionId, getSigningMutation]);

  return handleCopyLink;
}
