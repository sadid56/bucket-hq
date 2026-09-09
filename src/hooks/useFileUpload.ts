import { useState, useCallback } from "react";
import { toaster } from "@/components/ui/toaster";

interface UploadProgress {
  fileName: string;
  progress: number;
}

export function useFileUpload(
  activeConnectionId: string,
  path: string,
  refetch: () => void,
  getSigningMutation: any
) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0 || !activeConnectionId) return;

    const filesArray = Array.from(filesList);

    for (const file of filesArray) {
      const fileKey = `${path}${file.name}`;
      setUploads((prev) => [...prev, { fileName: file.name, progress: 0 }]);

      try {
        const res = await getSigningMutation.mutateAsync({
          action: "upload",
          connectionId: activeConnectionId,
          key: fileKey,
        });
        const url = res.url;

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const isCloudinary = url.includes("cloudinary.com");

          if (isCloudinary) {
            const parsedUrl = new URL(url);
            const formData = new FormData();

            parsedUrl.searchParams.forEach((value, name) => {
              formData.append(name, value);
            });
            formData.append("file", file);

            xhr.open("POST", parsedUrl.origin + parsedUrl.pathname, true);

            xhr.upload.onprogress = (evt) => {
              if (evt.lengthComputable) {
                const percent = Math.round((evt.loaded / evt.total) * 100);
                setUploads((prev) =>
                  prev.map((up) => (up.fileName === file.name ? { ...up, progress: percent } : up))
                );
              }
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
              } else {
                reject(new Error(`Upload failed with status: ${xhr.status}`));
              }
            };
            xhr.onerror = () => reject(new Error("Network upload error"));
            xhr.send(formData);
          } else {
            xhr.open("PUT", url, true);
            xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

            xhr.upload.onprogress = (evt) => {
              if (evt.lengthComputable) {
                const percent = Math.round((evt.loaded / evt.total) * 100);
                setUploads((prev) =>
                  prev.map((up) => (up.fileName === file.name ? { ...up, progress: percent } : up))
                );
              }
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
              } else {
                reject(new Error(`Upload failed with status: ${xhr.status}`));
              }
            };
            xhr.onerror = () => reject(new Error("Network upload error"));
            xhr.send(file);
          }
        });

        toaster.create({
          title: `Uploaded ${file.name} successfully`,
          type: "success",
        });
      } catch (err: any) {
        toaster.create({
          title: `Failed to upload ${file.name}`,
          description: err.message,
          type: "error",
        });
      } finally {
        setTimeout(() => {
          setUploads((prev) => prev.filter((up) => up.fileName !== file.name));
        }, 1500);
        refetch();
      }
    }
  }, [activeConnectionId, path, getSigningMutation, refetch]);

  return { uploads, handleUpload };
}
