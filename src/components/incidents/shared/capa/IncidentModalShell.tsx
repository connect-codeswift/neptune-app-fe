"use client";

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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1320]/45 p-3.5 backdrop-blur-[3px] sm:p-5"
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
          "flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl bg-[#e5e9ec] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all",
          maxWidthClassName,
        ].join(" ")}
      >
        <header className="relative shrink-0 border-b border-[#cfd6d9] px-4 py-4 sm:px-8 sm:pt-7 sm:pb-[17px]">
          <Text
            as="h2"
            id={titleId}
            className="pr-10 text-[18px] leading-7 font-normal text-[#1e293b] sm:text-[20px]"
          >
            {title}
          </Text>
          <Text
            as="p"
            className="mt-0.5 truncate text-[12px] leading-5 font-normal text-[#64748b] sm:mt-1 sm:text-[14px]"
          >
            {subtitle}
          </Text>

          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-lg bg-white/40 transition-colors hover:bg-white/70 sm:top-7 sm:right-7"
          >
            <img
              src="/icons/capa/close.svg"
              alt=""
              width={16}
              height={16}
              className="size-4"
              aria-hidden="true"
            />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:pt-8 sm:pb-10">
          {children}
        </div>

        <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#cfd6d9] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
          <div className="text-center sm:text-left">
            {typeof footerHint === "string" ? (
              <Text
                as="p"
                className="text-[12px] leading-[19.5px] text-[#94a3b8] sm:text-[13px]"
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
      className="flex-1 rounded-xl border border-[#cbd5e1] px-[20px] py-[9.5px] text-[13px] leading-[19.5px] text-[#334155] transition-colors hover:bg-white/60 sm:flex-initial sm:px-[25px] sm:py-[11px]"
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
    iconSrc?: string;
  }>,
) {
  const {
    onClick,
    disabled = false,
    label,
    iconSrc = "/icons/capa/plus.svg",
  } = props;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex h-[39.5px] min-w-[134px] flex-1 items-center justify-center gap-2 rounded-xl px-5 text-[13px] leading-[19.5px] font-medium text-white transition-colors sm:flex-initial",
        disabled
          ? "cursor-not-allowed bg-[#7bc1c5]"
          : "bg-[#06939b] hover:bg-[#058189]",
      ].join(" ")}
    >
      {iconSrc ? (
        <img
          src={iconSrc}
          alt=""
          width={16}
          height={16}
          className="size-4"
          aria-hidden="true"
        />
      ) : null}
      {label}
    </button>
  );
}
