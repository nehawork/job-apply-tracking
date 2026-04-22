import type { Metadata, Viewport } from "next";
import { PwaProvider } from "@/components/pwa-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Job Apply Tracking",
  description: "Track job applications with Next.js and SQLite.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg"
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Job Apply Tracking"
  }
};

export const viewport: Viewport = {
  themeColor: "#b8502a"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PwaProvider />
        {children}
      </body>
    </html>
  );
}
