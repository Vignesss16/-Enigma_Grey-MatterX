"use client";

import { MobileHeader } from "@/components/navigation/MobileHeader";
import { CameraViewport } from "@/components/scanner/CameraViewport";
import { SampleFoodSelector } from "@/components/scanner/SampleFoodSelector";

export default function ScannerPage() {
  return (
    <>
      <MobileHeader title="Scanner" showBack />

      <div className="px-gutter lg:px-space-xl py-space-sm max-w-4xl mx-auto flex flex-col gap-space-lg">
        {/* Scanner Viewport */}
        <CameraViewport />

        {/* Quick Benchmark Sample Selector */}
        <SampleFoodSelector />
      </div>
    </>
  );
}
