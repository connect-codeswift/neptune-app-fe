"use client";

import { Icon } from "@iconify/react";
import type { ReactNode } from "react";

export type AccordionProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

export function Accordion(props: Readonly<AccordionProps>) {
  const { children, className = "" } = props;

  return (
    <div
      className={["flex flex-col gap-1", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

export type AccordionItemProps = Readonly<{
  title: ReactNode;
  subtitle?: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  headerAction?: ReactNode;
  triggerId: string;
  panelId: string;
  hasError?: boolean;
}>;

export function AccordionItem(props: Readonly<AccordionItemProps>) {
  const {
    title,
    subtitle,
    isOpen,
    onToggle,
    children,
    headerAction,
    triggerId,
    panelId,
    hasError = false,
  } = props;

  return (
    <section
      className={[
        "overflow-hidden rounded-xl border transition-colors",
        hasError
          ? "border-ehs-red bg-ehs-red/5"
          : isOpen
            ? "border-ehs-light-blue-active/60 bg-ehs-light-blue/20"
            : "border-ehs-border bg-white",
      ].join(" ")}
    >
      <div className="flex items-center gap-1 px-2 py-1.5">
        <button
          type="button"
          id={triggerId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-1.5 text-left"
        >
          <div className="min-w-0 flex flex-col gap-1">
            {title}
            {!isOpen && subtitle ? subtitle : null}
          </div>
          <Icon
            icon="mdi:chevron-down"
            className={[
              "text-ehs-muted-text shrink-0 text-lg transition-transform",
              isOpen ? "rotate-180" : "",
            ].join(" ")}
            aria-hidden="true"
          />
        </button>
        {isOpen ? headerAction : null}
      </div>

      {isOpen ? (
        <div
          id={panelId}
          aria-labelledby={triggerId}
          className="border-ehs-border border-t px-2 pt-1.5 pb-2"
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}
