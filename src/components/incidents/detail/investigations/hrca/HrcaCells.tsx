"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type {
  HrcaCorrectiveAction,
  HrcaWhyStep,
} from "@/components/incidents/detail/investigations/hrca/hrca-data";
import {
  HRCA_ROW_MIN_HEIGHT_CLASS,
  hrcaCellShellClass,
} from "@/components/incidents/detail/investigations/hrca/hrca-layout";

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function Connector() {
  return (
    <span className="pointer-events-none absolute top-1/2 -left-3.75 z-10 -translate-y-1/2">
      <Icon
        icon="mdi:chevron-right"
        className="text-ehs-muted-text size-3.5"
        aria-hidden="true"
      />
    </span>
  );
}

export function HrcaCategoryCell(props: Readonly<{ category: string }>) {
  const { category } = props;
  const lines = category.includes(" / ")
    ? category
        .split(" / ")
        .map((part, index, all) =>
          index < all.length - 1 ? `${part} /` : part,
        )
    : [category];

  return (
    <div
      className={[
        HRCA_ROW_MIN_HEIGHT_CLASS,
        "bg-ehs-normal-blue/13 rounded-2.25 border-ehs-border-ink/8 flex h-full items-center justify-center self-stretch border px-2.75 py-2.25",
      ].join(" ")}
    >
      <p className="text-ehs-dark-bg text8 text-center leading-[14.4px] font-bold">
        {lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>
    </div>
  );
}

export function HrcaContributingFactorCell(
  props: Readonly<{
    text: string;
    accent: string;
    onEdit: () => void;
  }>,
) {
  const { text, accent, onEdit } = props;
  const displayText = text.trim() || "Click to define contributing factor…";

  return (
    <button
      type="button"
      onClick={onEdit}
      className={[
        hrcaCellShellClass,
        HRCA_ROW_MIN_HEIGHT_CLASS,
        "min-h-32 cursor-pointer hover:shadow-[0px_4px_14px_-8px_rgba(15,23,42,0.18)]",
      ].join(" ")}
    >
      <p
        className="text8 mb-1.5 leading-3.25 font-bold tracking-[0.72px] uppercase"
        style={{ color: accent }}
      >
        Contributing factor
      </p>
      <p
        className={[
          "text4 leading-[18.13px] font-bold",
          text.trim() ? "text-ehs-dark-bg" : "text-ehs-muted-text italic",
        ].join(" ")}
      >
        {displayText}
      </p>
    </button>
  );
}

export function HrcaWhyCell(
  props: Readonly<{
    why?: HrcaWhyStep;
    accent: string;
    canAdd: boolean;
    showConnector?: boolean;
    onEdit: () => void;
    onRemove: () => void;
    onAdd: () => void;
  }>,
) {
  const {
    why,
    accent,
    canAdd,
    showConnector = false,
    onEdit,
    onRemove,
    onAdd,
  } = props;

  if (why) {
    return (
      <div className={["relative h-full", HRCA_ROW_MIN_HEIGHT_CLASS].join(" ")}>
        {showConnector ? <Connector /> : null}
        <button
          type="button"
          onClick={onEdit}
          className={[
            "group",
            hrcaCellShellClass,
            HRCA_ROW_MIN_HEIGHT_CLASS,
            "min-h-32 cursor-pointer hover:shadow-[0px_4px_14px_-8px_rgba(15,23,42,0.18)]",
          ].join(" ")}
          style={
            why.isRootCause
              ? { boxShadow: `0px 0px 0px 3px ${hexToRgba(accent, 0.18)}` }
              : undefined
          }
        >
          <div className="mb-1.75 flex w-full items-center gap-1.75">
            <span
              className="text8 rounded-2.5 inline-flex size-4.75 shrink-0 items-center justify-center leading-[15.23px] font-bold text-white"
              style={{ backgroundColor: accent }}
            >
              {String(why.num)}
            </span>
            {why.isRootCause ? (
              <span
                className="text8 inline-flex items-center gap-0.75 leading-3.25 font-bold tracking-[0.54px] uppercase"
                style={{ color: accent }}
              >
                <Icon
                  icon="mdi:target"
                  className="size-2.5"
                  aria-hidden="true"
                />
                Root cause
              </span>
            ) : (
              <Text
                as="span"
                className="text-ehs-muted-text text8 leading-3.25 font-bold tracking-[0.54px] uppercase"
              >
                {`Why ${why.num}`}
              </Text>
            )}
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                onRemove();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onRemove();
                }
              }}
              className="text-ehs-muted-text hover:text-ehs-red rounded-1.25 ml-auto inline-flex size-4.5 items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              aria-label="Remove why step"
            >
              <Icon icon="mdi:close" className="size-2.75" aria-hidden="true" />
            </span>
          </div>
          <p className="text-ehs-slate text4 leading-[18.13px] font-normal">
            {why.text}
          </p>
        </button>
      </div>
    );
  }

  if (canAdd) {
    return (
      <div className={["relative h-full", HRCA_ROW_MIN_HEIGHT_CLASS].join(" ")}>
        {showConnector ? <Connector /> : null}
        <button
          type="button"
          onClick={onAdd}
          className={[
            HRCA_ROW_MIN_HEIGHT_CLASS,
            "rounded-3 border-ehs-border-ink/14 hover:border-ehs-border-ink/28 hover:bg-ehs-surface/40 flex h-full min-h-32 w-full cursor-pointer flex-col items-center justify-center gap-1.5 border border-dashed px-3.5 py-3.25 transition-colors",
          ].join(" ")}
        >
          <span
            className="rounded-3.25 flex size-6.5 items-center justify-center"
            style={{ backgroundColor: hexToRgba(accent, 0.22) }}
          >
            <Icon
              icon="mdi:plus"
              className="size-3.5"
              style={{ color: accent }}
              aria-hidden="true"
            />
          </span>
          <Text as="span" className="text-ehs-muted-text text4 leading-3.25">
            Add why
          </Text>
        </button>
      </div>
    );
  }

  return (
    <div className={["relative h-full", HRCA_ROW_MIN_HEIGHT_CLASS].join(" ")}>
      {showConnector ? <Connector /> : null}
      <div
        className={[
          HRCA_ROW_MIN_HEIGHT_CLASS,
          "rounded-3 border-ehs-border-ink/14 flex h-full min-h-32 w-full items-center justify-center border border-dashed px-3.5 py-3.25",
        ].join(" ")}
      >
        <Text as="span" className="text-ehs-muted-text text4 leading-[15.95px]">
          —
        </Text>
      </div>
    </div>
  );
}

export function HrcaCorrectiveActionsCell(
  props: Readonly<{
    actions: readonly HrcaCorrectiveAction[];
    onAdd: () => void;
    onEdit: (index: number, text: string) => void;
    onRemove: (index: number) => void;
  }>,
) {
  const { actions, onAdd, onEdit, onRemove } = props;

  return (
    <div
      className={[
        hrcaCellShellClass,
        HRCA_ROW_MIN_HEIGHT_CLASS,
        "border-ehs-green/35 min-h-32",
      ].join(" ")}
    >
      <p className="text8 text-ehs-green mb-2 leading-3.25 font-bold tracking-[0.72px] uppercase">
        Corrective actions
      </p>
      <div className="flex w-full flex-1 flex-col gap-2">
        {actions.map((action, index) => (
          <div
            key={action.id ?? `${action.text}-${index}`}
            className="group flex items-start gap-2"
          >
            <span className="rounded-1.25 bg-ehs-green/14 text-ehs-green mt-px flex size-4.25 shrink-0 items-center justify-center">
              <Icon icon="mdi:check" className="size-2.75" aria-hidden="true" />
            </span>
            <button
              type="button"
              onClick={() => onEdit(index, action.text)}
              className="text-ehs-slate hover:text-ehs-dark-bg text4 min-w-0 flex-1 text-left leading-[18.13px] font-normal"
            >
              {action.text}
            </button>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-ehs-muted-text hover:text-ehs-red inline-flex size-4 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove action"
            >
              <Icon icon="mdi:close" className="size-2.5" aria-hidden="true" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={onAdd}
          className="hover:text-ehs-dark-blue-active text4 text-ehs-green inline-flex items-center gap-1.5 self-start pt-0.5 leading-3.25 font-bold transition-colors"
        >
          <Icon icon="mdi:plus" className="size-3" aria-hidden="true" />
          Add action
        </button>
      </div>
    </div>
  );
}
