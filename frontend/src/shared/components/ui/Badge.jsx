import React from "react";

export const Badge = ({ variant = "default", className = "", children, ...props }) => {
  let variantClasses = "";

  switch (variant) {
    case "secondary":
      variantClasses =
        "bg-[#1E293B] text-gray-200 border border-gray-600 hover:bg-[#24334D]";
      break;
    case "destructive":
      variantClasses =
        "bg-red-600 text-white border border-red-700 hover:bg-red-700";
      break;
    case "outline":
      variantClasses =
        "border border-gray-500 text-gray-300 hover:bg-gray-800";
      break;
    default:
      variantClasses =
        "bg-gradient-to-r from-blue-600 to-blue-700 text-white border border-transparent hover:from-blue-700 hover:to-blue-800";
      break;
  }

  return (
    <span
      className={`
        inline-flex items-center justify-center gap-1
        rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap
        transition-all duration-200
        ${variantClasses} ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
};
