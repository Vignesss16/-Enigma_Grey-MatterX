import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";
import { DesktopHeader } from "@/components/navigation/DesktopHeader";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { HealthChatbot } from "@/components/chat/HealthChatbot";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Genesis Reset | Clinical Food Decision Support",
  description:
    "AI-native personalized clinical food risk assessment, allergen detection, and glycemic load analysis for chronic health profiles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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

        {/* Global AI Health Chatbot */}
        <HealthChatbot />
      </body>
    </html>
  );
}
