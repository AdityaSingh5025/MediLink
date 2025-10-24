import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

// ✅ Define button variants using cva (class-variance-authority)
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-blue-500 outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg",
        outline:
          "border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors",
        ghost:
          "text-gray-400 hover:text-blue-400 hover:bg-[#101935] transition-colors",
        secondary:
          "bg-white text-blue-700 hover:bg-gray-100 font-semibold",
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
        icon: "p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// ✅ Simple reusable Button component (no cn used)
const Button = React.forwardRef(
  ({ className = "", variant = "default", size = "md", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    // Combine default + variant + size manually (no cn)
    const baseClass = buttonVariants({ variant, size });
    const combinedClass = `${baseClass} ${className}`;

    return <Comp ref={ref} className={combinedClass} {...props} />;
  }
);

Button.displayName = "Button";

export { Button };
