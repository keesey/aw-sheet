import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AW Sheet — Shim Sham",
  description: "Interactive character sheet for Jenluwess Wivvashimmeh",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Shim Sham",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0f1419",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
