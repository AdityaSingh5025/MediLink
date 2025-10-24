"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

// 🧩 Tabs Root
export function Tabs({ className = "", ...props }) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={`flex flex-col gap-4 ${className}`}
      {...props}
    />
  );
}

// 🪶 Tabs List
export function TabsList({ className = "", ...props }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={`bg-[var(--color-surface)] border border-[var(--color-border)]
        inline-flex items-center justify-center rounded-xl p-[3px]
        shadow-inner shadow-[rgba(255,255,255,0.05)] ${className}`}
      {...props}
    />
  );
}

// 🌈 Tabs Trigger (each tab button)
export function TabsTrigger({ className = "", ...props }) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={`relative inline-flex flex-1 items-center justify-center gap-2
        text-sm font-medium px-4 py-2 rounded-lg
        text-[var(--color-text-muted)] transition-all duration-200
        hover:text-[var(--color-text)]
        data-[state=active]:text-[var(--color-text)]
        data-[state=active]:bg-gradient-to-r 
        data-[state=active]:from-[var(--color-primary)] 
        data-[state=active]:to-[var(--color-accent)]
        data-[state=active]:shadow-[0_0_10px_rgba(37,99,235,0.3)]
        focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-[var(--color-primary)]
        disabled:opacity-50 disabled:pointer-events-none
        ${className}`}
      {...props}
    />
  );
}

// 📄 Tabs Content
export function TabsContent({ className = "", ...props }) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={`flex-1 mt-4 text-[var(--color-text)] ${className}`}
      {...props}
    />
  );
}
