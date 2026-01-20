import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Socio-Economic Survey System",
  description:
    "A comprehensive survey system for socio-economic data collection",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-[#0B1F33] text-[#E5E7EB]" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
