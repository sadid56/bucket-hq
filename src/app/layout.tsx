import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Providers from "@/providers/Provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BucketHQ — Unified Cloud Storage Management",
    template: "%s | BucketHQ",
  },
  description:
    "Manage your AWS S3, Cloudflare R2, and Cloudinary buckets in one workspace. Secure pre-signed URLs, team collaboration, and AES-256 encryption.",
  keywords: ["cloud storage", "S3", "R2", "Cloudinary", "file management", "pre-signed URLs", "bucket management"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
