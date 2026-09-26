import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";
import { DesktopHeader } from "@/components/navigation/DesktopHeader";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { PwaInstallManager } from "@/components/pwa/PwaInstallManager";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  themeColor: "#005253",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Genesis Reset | Clinical Food Decision Support",
  description:
    "AI-native personalized clinical food risk assessment, allergen detection, and glycemic load analysis for chronic health profiles.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Genesis Reset",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className={`${inter.variable} bg-background font-sans antialiased text-on-surface`}>
        {/* Desktop Navigation Shell */}
        <DesktopSidebar />
        <DesktopHeader />

        {/* Main Content Area */}
        <div className="lg:pl-72 flex flex-col min-h-screen">
          <main className="flex-1 w-full pt-16 pb-20 lg:pb-12 bg-background">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />

        {/* PWA Service Worker & Chrome APK Install Manager */}
        <PwaInstallManager />
      </body>
    </html>
  );
}
