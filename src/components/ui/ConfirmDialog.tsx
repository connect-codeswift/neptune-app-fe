"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";

export type ConfirmDialogProps = Readonly<{
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}>;

export function ConfirmDialog(props: Readonly<ConfirmDialogProps>) {
  const {
    open,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    isConfirming = false,
    onConfirm,
    onCancel,
  } = props;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onCancel}
        className="backdrop-blur-0.5 absolute inset-0 cursor-default bg-slate-900/40"
      />

      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="bg-ehs-red/10 text-ehs-red mb-4 inline-flex size-11 items-center justify-center rounded-full">
          <Icon
            icon="mdi:alert-outline"
            className="text-2xl"
            aria-hidden="true"
          />
        </div>

        <Text as="h2" className="text-ehs-dark-bg text-lg font-semibold">
          {title}
        </Text>

        {description ? (
          <Text as="p" className="text-ehs-gray mt-1.5 text-sm">
            {description}
          </Text>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="tertiary"
            onClick={onCancel}
            disabled={isConfirming}
            className="rounded-lg px-4 py-2 text-sm font-medium"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            isLoading={isConfirming}
            className="rounded-lg px-4 py-2 text-sm font-semibold"
          >
            {isConfirming ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
