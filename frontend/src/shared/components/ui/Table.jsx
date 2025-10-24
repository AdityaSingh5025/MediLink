"use client";
import * as React from "react";

/**
 * A minimal, clean Table component set
 * built with TailwindCSS — no cn helper used.
 * Compatible with your MediLink UI setup.
 */

// ==================================================
// Table Container
// ==================================================
export function Table({ className = "", ...props }) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table
        className={`w-full caption-bottom text-sm ${className}`}
        {...props}
      />
    </div>
  );
}

// ==================================================
// Table Header
// ==================================================
export function TableHeader({ className = "", ...props }) {
  return (
    <thead
      className={`border-b border-gray-200 ${className}`}
      {...props}
    />
  );
}

// ==================================================
// Table Body
// ==================================================
export function TableBody({ className = "", ...props }) {
  return (
    <tbody
      className={`divide-y divide-gray-100 ${className}`}
      {...props}
    />
  );
}

// ==================================================
// Table Footer
// ==================================================
export function TableFooter({ className = "", ...props }) {
  return (
    <tfoot
      className={`bg-gray-50 border-t border-gray-200 font-medium ${className}`}
      {...props}
    />
  );
}

// ==================================================
// Table Row
// ==================================================
export function TableRow({ className = "", ...props }) {
  return (
    <tr
      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${className}`}
      {...props}
    />
  );
}

// ==================================================
// Table Head (th)
// ==================================================
export function TableHead({ className = "", ...props }) {
  return (
    <th
      className={`h-10 px-3 text-left align-middle font-semibold text-gray-700 text-sm ${className}`}
      {...props}
    />
  );
}

// ==================================================
// Table Cell (td)
// ==================================================
export function TableCell({ className = "", ...props }) {
  return (
    <td
      className={`p-3 align-middle text-sm text-gray-800 ${className}`}
      {...props}
    />
  );
}

// ==================================================
// Table Caption
// ==================================================
export function TableCaption({ className = "", ...props }) {
  return (
    <caption
      className={`mt-4 text-gray-500 text-sm text-center ${className}`}
      {...props}
    />
  );
}
