import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ATW Web UI",
  description: "Atlas Task Workflow - Web Interface",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "ATW",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#1c1917",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-stone-50 dark:bg-stone-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
