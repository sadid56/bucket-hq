import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadOptions {
  folder?: string;
  publicId?: string;
}

export async function uploadToCloudinary(fileBase64: string, options?: UploadOptions) {
  try {
    const res = await cloudinary.uploader.upload(fileBase64, {
      folder: options?.folder || "uploads",
      public_id: options?.publicId,
    });
    return res.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new Error("Failed to upload image");
  }
}

export const deleteFromCloudinary = async (url: string) => {
  try {
    const segments = url.split("/");
    const filename = segments.pop();
    const folder = segments.slice(segments.indexOf("upload") + 1, -1).join("/");
    const publicId = folder ? `${folder}/${filename?.split(".")[0]}` : filename?.split(".")[0];

    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted Cloudinary image: ${publicId}`);
  } catch (err) {
    console.warn("Failed to delete image from Cloudinary:", err);
  }
};
