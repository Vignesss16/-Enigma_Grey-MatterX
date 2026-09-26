"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";

export function PwaInstallManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("PWA Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    }

    // 2. Capture beforeinstallprompt event for Chrome APK / PWA install
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log("Genesis Reset PWA installed successfully");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert(
        "To install on Chrome: Tap the 3 dots (⋮) menu in the top right of your browser, then tap 'Install app' or 'Add to Home screen'."
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (dismissed) return null;

  return (
    <>
      {/* Floating Install Prompt Banner for Mobile / Chrome */}
      {isInstallable && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-50 bg-inverse-surface text-inverse-on-surface p-3.5 rounded-2xl shadow-2xl border border-outline/30 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 text-on-primary">
              <Smartphone className="w-5 h-5 text-secondary-fixed" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-inverse-on-surface">
                Install Genesis Reset App
              </span>
              <span className="text-[11px] text-outline-variant leading-tight">
                Add to home screen for full APK experience
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:bg-surface-tint active:scale-95 transition-all shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-outline hover:text-inverse-on-surface transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
