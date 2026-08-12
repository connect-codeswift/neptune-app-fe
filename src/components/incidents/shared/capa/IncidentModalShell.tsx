"use client";

import { Icon } from "@iconify/react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Text } from "@/components/Text";

export type IncidentModalShellProps = Readonly<{
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
  footerHint?: ReactNode;
  footerActions: ReactNode;
  /** Wider content area for dense grids. */
  maxWidthClassName?: string;
  overlayClassName?: string;
}>;

/**
 * Shared chrome for Add CAPA / Edit details modals (header, scroll body, footer).
 */
export function IncidentModalShell(props: Readonly<IncidentModalShellProps>) {
  const {
    title,
    subtitle,
    onClose,
    children,
    footerHint,
    footerActions,
    maxWidthClassName = "max-w-[928px]",
    overlayClassName = "z-[100]",
  } = props;

  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className={[
        "bg-ehs-dark-bg/45 fixed inset-0 flex items-center justify-center p-3.5 backdrop-blur-[3px] sm:p-5",
        overlayClassName,
      ].join(" ")}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className={[
          "bg-ehs-light-bg flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all",
          maxWidthClassName,
        ].join(" ")}
      >
        <header className="border-ehs-border relative shrink-0 border-b px-4 py-4 sm:px-8 sm:pt-7 sm:pb-[17px]">
          <Text
            as="h2"
            id={titleId}
            className="text-ehs-dark-bg pr-10 text-lg leading-7 font-normal sm:text-xl"
          >
            {title}
          </Text>
          <Text
            as="p"
            className="text-ehs-gray mt-0.5 truncate text-sm leading-5 font-normal sm:mt-1 sm:text-sm"
          >
            {subtitle}
          </Text>

          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-lg bg-white/40 transition-colors hover:bg-white/70 sm:top-7 sm:right-7"
          >
            <Icon
              icon="mdi:close"
              className="size-4 text-slate-500"
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:pt-8 sm:pb-10">
          {children}
        </div>

        <footer className="border-ehs-border flex shrink-0 flex-col-reverse gap-3 border-t px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
          <div className="text-center sm:text-left">
            {typeof footerHint === "string" ? (
              <Text
                as="p"
                className="text-ehs-muted-text text-sm leading-[19.5px] sm:text-sm"
              >
                {footerHint}
              </Text>
            ) : (
              footerHint
            )}
          </div>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            {footerActions}
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

export function IncidentModalCancelButton(
  props: Readonly<{ onClick: () => void; label?: string }>,
) {
  const { onClick, label = "Cancel" } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      className="border-ehs-border text-ehs-slate flex-1 rounded-xl border px-[20px] py-[9.5px] text-sm leading-[19.5px] transition-colors hover:bg-white/60 sm:flex-initial sm:px-[25px] sm:py-[11px]"
    >
      {label}
    </button>
  );
}

export function IncidentModalPrimaryButton(
  props: Readonly<{
    onClick: () => void;
    disabled?: boolean;
    label: string;
    /** Iconify name; pass "" to render the button without an icon. */
    icon?: string;
  }>,
) {
  const { onClick, disabled = false, label, icon = "mdi:plus" } = props;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "text-ehs-light-text inline-flex h-[39.5px] min-w-[134px] flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm leading-[19.5px] font-medium transition-colors sm:flex-initial",
        disabled
          ? "bg-ehs-light-blue cursor-not-allowed"
          : "bg-ehs-normal-blue hover:bg-ehs-normal-blue-active",
      ].join(" ")}
    >
      {icon ? <Icon icon={icon} className="size-4" aria-hidden="true" /> : null}
      {label}
    </button>
  );
}
