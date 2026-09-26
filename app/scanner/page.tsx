"use client";

import { MobileHeader } from "@/components/navigation/MobileHeader";
import { FoodScanner } from "@/components/scanner/FoodScanner";

export default function ScannerPage() {
  return (
    <>
      <MobileHeader title="Scan Food" showBack />
      <div className="px-gutter lg:px-space-xl py-space-sm max-w-4xl mx-auto flex flex-col gap-space-lg">
        <FoodScanner />
      </div>
    </>
  );
}
