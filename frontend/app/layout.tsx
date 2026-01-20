import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import "./globals.css";
import { PWAProvider } from "../contexts/PWAContext";
import { InstallPrompt } from "../components/InstallPrompt";
import { PWAStatusIndicator } from "../components/PWAStatusIndicator";

export const metadata: Metadata = {
  title: "Socio-Economic Survey System",
  description: "A comprehensive survey system for socio-economic data collection",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  },
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SES Survey" />

        <link rel="manifest" href="/manifest.json" />

      </head>
      <body className="bg-[#0B1F33] text-[#E5E7EB]" suppressHydrationWarning={true}>
        <PWAProvider>
          {children}
          <InstallPrompt />
          <PWAStatusIndicator />
        </PWAProvider>
      </body>
    </html>
  );
}
