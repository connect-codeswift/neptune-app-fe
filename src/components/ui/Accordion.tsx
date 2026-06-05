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
      className={["flex flex-col gap-[0.4cqw]", className]
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
      <div className="flex items-center gap-[0.4cqw] px-[0.8cqw] py-[0.536cqw]">
        <button
          type="button"
          id={triggerId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-[0.536cqw] text-left"
        >
          <div className="min-w-0 flex flex-col gap-[0.264cqw]">
            {title}
            {!isOpen && subtitle ? subtitle : null}
          </div>
          <Icon
            icon="mdi:chevron-down"
            className={[
              "text-ehs-muted-text shrink-0 text-[1.2cqw] transition-transform",
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
          className="border-ehs-border border-t px-[0.8cqw] pt-[0.536cqw] pb-[0.8cqw]"
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}
