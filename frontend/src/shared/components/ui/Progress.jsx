"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";



export function Progress({ className = "", value = 0, ...props }) {
  return (
    <ProgressPrimitive.Root
      className={`relative h-2 w-full overflow-hidden rounded-full bg-primary/20 ${className}`}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="bg-primary h-full w-full transition-transform duration-300"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
