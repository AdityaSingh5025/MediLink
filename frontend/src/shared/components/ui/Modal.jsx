import React from "react";

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 p-6 relative animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-800 text-lg"
        >
          ✕
        </button>

        {/* Header */}
        {title && (
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
        )}

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};
