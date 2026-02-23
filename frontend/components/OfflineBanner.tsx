"use client";

import { usePWA } from "@/contexts/PWAContext";

/**
 * OfflineBanner – shown as a fixed banner at the top of the screen whenever
 * the user's device loses network connectivity. It disappears automatically
 * when the connection is restored.
 */
export default function OfflineBanner() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-3 bg-red-600 text-white text-sm font-medium py-3 px-4 shadow-lg"
      style={{ animation: "slideDown 0.3s ease-out" }}
    >
      {/* Wi-fi off icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <circle cx="12" cy="20" r="1" fill="currentColor" />
      </svg>
      <span>You are offline. Some features may not be available.</span>
    </div>
  );
}
