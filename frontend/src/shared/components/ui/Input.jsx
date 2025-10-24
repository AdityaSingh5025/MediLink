import React from "react";

export const Input = ({ type = "text", className = "", ...props }) => {
  return (
    <input
      type={type}
      className={` 
        w-full h-10 px-4 rounded-md border border-gray-700 
        bg-[#0F1C3A] text-gray-200 placeholder-gray-500
        focus:outline-none focus:ring-2 focus:ring-blue-500 
        focus:border-transparent
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    />
  );
};
