"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

export function OmniDimensionWidget() {
  const pathname = usePathname();

  // Do not show voice agent widget on login screen for a clean UI
  if (pathname === "/login") return null;

  return (
    <Script
      id="omnidimension-web-widget"
      src="https://omnidim.io/web_widget.js?secret_key=7a5ed3d8208d06fb7ee9f8c84c145eb6"
      strategy="afterInteractive"
    />
  );
}
