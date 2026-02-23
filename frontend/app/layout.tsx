import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import "./globals.css";
import { PWAProvider } from "@/contexts/PWAContext";
import OfflineBanner from "@/components/OfflineBanner";

export const metadata: Metadata = {
  title: "Socio-Economic Survey System",
  description:
    "A comprehensive survey system for socio-economic data collection",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SES Survey",
  },
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className="bg-slate-950 text-slate-200"
        suppressHydrationWarning={true}
      >
        <PWAProvider>
          <OfflineBanner />
          {children}
        </PWAProvider>
      </body>
    </html>
  );
}
