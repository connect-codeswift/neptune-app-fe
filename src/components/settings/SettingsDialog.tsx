"use client";

import { Icon } from "@iconify/react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Text } from "@/components/Text";

export type SettingsDialogProps = Readonly<{
  open: boolean;
  title: string;
  description?: string;
  icon?: string;
  /** The body — usually a <form>, which owns its own submit and cancel buttons. */
  children: ReactNode;
  onClose: () => void;
  /** Blocks Escape and the backdrop while a request is in flight. */
  isBusy?: boolean;
}>;

/**
 * A modal that holds a form.
 *
 * `ui/ConfirmDialog` is the app's other modal, but it is a yes/no confirmation — fixed danger
 * icon, "Deleting…" busy label, no room for fields. The security flows need to collect a
 * password or a 6-digit code before they can act, which is a different shape.
 */
export function SettingsDialog(props: Readonly<SettingsDialogProps>) {
  const {
    open,
    title,
    description,
    icon = "mdi:shield-lock-outline",
    children,
    onClose,
    isBusy = false,
  } = props;

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isBusy) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, isBusy]);

  // The page behind a modal must not scroll under it.
  useEffect(() => {
    if (!open) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={isBusy ? undefined : onClose}
        className="bg-ehs-overlay backdrop-blur-0.5 absolute inset-0 cursor-default"
      />

      <div className="border-ehs-border bg-ehs-surface rounded-4 relative z-10 my-auto w-full max-w-md border p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="bg-ehs-normal-blue-bg-light text-ehs-normal-blue inline-flex size-11 shrink-0 items-center justify-center rounded-full">
            <Icon icon={icon} className="text-2xl" aria-hidden="true" />
          </span>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Text as="h2" className="text3 text-ehs-darker">
              {title}
            </Text>
            {description ? (
              <Text as="p" className="text8 text-ehs-muted-text">
                {description}
              </Text>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            aria-label="Close"
            className="text-ehs-muted-text hover:bg-ehs-surface-raised hover:text-ehs-darker -mt-1 -mr-1 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon icon="mdi:close" className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
