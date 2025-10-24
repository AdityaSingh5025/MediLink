import React from "react";
import { Toaster } from "sonner";

/**
 * 💙 MediLink Custom Toast Provider
 * - Matches your dark blue theme
 * - Adds soft blur and gradient glow
 * - Uses Sonner rich colors + rounded corners
 */

export function Toast() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "rounded-xl shadow-lg shadow-blue-900/40 border border-blue-800/40 backdrop-blur-md",
          title: "font-semibold text-sm",
          description: "text-xs text-gray-300",
          actionButton:
            "bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-md text-xs font-medium px-2 py-1",
          cancelButton:
            "bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800 rounded-md text-xs font-medium px-2 py-1",
        },
        style: {
          background: "linear-gradient(to right, #0F172A, #1E3A8A)",
          color: "#F8FAFC",
          border: "1px solid rgba(59,130,246,0.2)",
          fontSize: "0.9rem",
        },
      }}
    />
  );
}
