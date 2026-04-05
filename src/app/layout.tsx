import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";

import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "KlaroCRM",
  description:
    "Enterprise-grade Web-CRM for German SMEs with Supabase, Google Calendar sync, and compliant document generation.",
};

export const runtime = "nodejs";
export const preferredRegion = "fra1";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      suppressHydrationWarning
      className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground min-h-full">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
