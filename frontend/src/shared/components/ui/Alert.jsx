import * as React from "react";
import { cva } from "class-variance-authority";

/**
 * Utility function to safely merge multiple class names
 * (acts like cn() but self-contained)
 */
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}


const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid " +
    "has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] " +
    "has-[>svg]:gap-x-3 gap-y-0.5 items-start " +
    "[&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-white text-gray-900 border-gray-200",
        destructive:
          "text-red-700 bg-red-50 border-red-200 " +
          "[&>svg]:text-red-600 *:data-[slot=alert-description]:text-red-700/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/**
 * Root Alert component
 */
export function Alert({ className = "", variant = "default", ...props }) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={classNames(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

/**
 * Title section for the Alert
 */
export function AlertTitle({ className = "", ...props }) {
  return (
    <div
      data-slot="alert-title"
      className={classNames(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight text-base",
        className
      )}
      {...props}
    />
  );
}

/**
 * Description section for the Alert
 */
export function AlertDescription({ className = "", ...props }) {
  return (
    <div
      data-slot="alert-description"
      className={classNames(
        "text-gray-600 col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  );
}
