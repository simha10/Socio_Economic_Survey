import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import "./globals.css";


export const metadata: Metadata = {
  title: "Socio-Economic Survey System",
  description: "A comprehensive survey system for socio-economic data collection",
  icons: {
    icon: "/favicon.ico"
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


      </head>
      <body className="bg-slate-950 text-slate-200" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
