import * as React from "react";

function Card({ className = "", ...props }) {
  return (
    <div
      data-slot="card"
      className={`bg-[#101935] text-gray-100 flex flex-col gap-6 rounded-xl border border-gray-800 shadow-lg ${className}`}
      {...props}
    />
  );
}

function CardHeader({ className = "", ...props }) {
  return (
    <div
      data-slot="card-header"
      className={`grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 pb-2 ${className}`}
      {...props}
    />
  );
}

function CardTitle({ className = "", ...props }) {
  return (
    <h4
      data-slot="card-title"
      className={`text-lg font-semibold leading-none text-gray-100 ${className}`}
      {...props}
    />
  );
}

function CardDescription({ className = "", ...props }) {
  return (
    <p
      data-slot="card-description"
      className={`text-gray-400 text-sm ${className}`}
      {...props}
    />
  );
}

function CardAction({ className = "", ...props }) {
  return (
    <div
      data-slot="card-action"
      className={`col-start-2 row-span-2 row-start-1 self-start justify-self-end ${className}`}
      {...props}
    />
  );
}

function CardContent({ className = "", ...props }) {
  return (
    <div
      data-slot="card-content"
      className={`px-6 py-4 ${className}`}
      {...props}
    />
  );
}

function CardFooter({ className = "", ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={`flex items-center px-6 pb-6 border-t border-gray-800 pt-4 ${className}`}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
