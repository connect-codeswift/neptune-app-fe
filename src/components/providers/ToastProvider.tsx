"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      expand={false}
      closeButton
      duration={4000}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-start gap-3 rounded-xl border border-ehs-border bg-white p-4 shadow-lg",
          title: "text-ehs-darker text-sm font-semibold",
          description: "text-ehs-muted-text text-sm",
          actionButton:
            "bg-ehs-normal-blue text-ehs-light-text rounded-lg px-3 py-1.5 text-sm font-medium",
          cancelButton:
            "text-ehs-gray rounded-lg border border-ehs-border px-3 py-1.5 text-sm font-medium",
          closeButton:
            "text-ehs-muted-text border-ehs-border bg-white hover:bg-ehs-light-bg",
          success: "border-ehs-green/30 bg-white",
          error: "border-ehs-red/30 bg-white",
          warning: "border-ehs-yellow/30 bg-white",
          info: "border-ehs-normal-blue/30 bg-white",
        },
      }}
    />
  );
}
