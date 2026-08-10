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
    <span className="pointer-events-none absolute top-1/2 -left-[15px] z-10 -translate-y-1/2">
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
        "bg-ehs-normal-blue/13 flex h-full items-center justify-center self-stretch rounded-[9px] border border-[rgba(15,23,42,0.08)] px-[11px] py-[9px]",
      ].join(" ")}
    >
      <p className="text-ehs-dark-bg text-center text-xs leading-[14.4px] font-bold">
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
        "min-h-[128px] cursor-pointer hover:shadow-[0px_4px_14px_-8px_rgba(15,23,42,0.18)]",
      ].join(" ")}
    >
      <p
        className="mb-[6px] text-[9px] leading-[13px] font-bold tracking-[0.72px] uppercase"
        style={{ color: accent }}
      >
        Contributing factor
      </p>
      <p
        className={[
          "text-[12.5px] leading-[18.13px] font-bold",
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
            "min-h-[128px] cursor-pointer hover:shadow-[0px_4px_14px_-8px_rgba(15,23,42,0.18)]",
          ].join(" ")}
          style={
            why.isRootCause
              ? { boxShadow: `0px 0px 0px 3px ${hexToRgba(accent, 0.18)}` }
              : undefined
          }
        >
          <div className="mb-[7px] flex w-full items-center gap-[7px]">
            <span
              className="inline-flex size-[19px] shrink-0 items-center justify-center rounded-[9.5px] text-[10.5px] leading-[15.23px] font-bold text-white"
              style={{ backgroundColor: accent }}
            >
              {String(why.num)}
            </span>
            {why.isRootCause ? (
              <span
                className="inline-flex items-center gap-[3px] text-[9px] leading-[13px] font-bold tracking-[0.54px] uppercase"
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
                className="text-ehs-muted-text text-[9px] leading-[13px] font-bold tracking-[0.54px] uppercase"
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
              className="text-ehs-muted-text hover:text-ehs-red ml-auto inline-flex size-[18px] items-center justify-center rounded-[5px] opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              aria-label="Remove why step"
            >
              <Icon
                icon="mdi:close"
                className="size-[11px]"
                aria-hidden="true"
              />
            </span>
          </div>
          <p className="text-ehs-slate text-[12.5px] leading-[18.13px] font-normal">
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
            "flex h-full min-h-[128px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[12px] border border-dashed border-[rgba(15,23,42,0.14)] px-3.5 py-[13px] transition-colors hover:border-[rgba(15,23,42,0.28)] hover:bg-white/40",
          ].join(" ")}
        >
          <span
            className="flex size-[26px] items-center justify-center rounded-[13px]"
            style={{ backgroundColor: hexToRgba(accent, 0.22) }}
          >
            <Icon
              icon="mdi:plus"
              className="size-3.5"
              style={{ color: accent }}
              aria-hidden="true"
            />
          </span>
          <Text
            as="span"
            className="text-ehs-muted-text text-[13px] leading-[13px]"
          >
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
          "flex h-full min-h-[128px] w-full items-center justify-center rounded-[12px] border border-dashed border-[rgba(15,23,42,0.14)] px-3.5 py-[13px]",
        ].join(" ")}
      >
        <Text
          as="span"
          className="text-ehs-muted-text text-base leading-[15.95px]"
        >
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
        "min-h-[128px] border-[rgba(16,185,129,0.35)]",
      ].join(" ")}
    >
      <p className="mb-[8px] text-[9px] leading-[13px] font-bold tracking-[0.72px] text-[#10b981] uppercase">
        Corrective actions
      </p>
      <div className="flex w-full flex-1 flex-col gap-2">
        {actions.map((action, index) => (
          <div
            key={action.id ?? `${action.text}-${index}`}
            className="group flex items-start gap-2"
          >
            <span className="mt-px flex size-[17px] shrink-0 items-center justify-center rounded-[5px] bg-[rgba(16,185,129,0.14)] text-[#10b981]">
              <Icon
                icon="mdi:check"
                className="size-[11px]"
                aria-hidden="true"
              />
            </span>
            <button
              type="button"
              onClick={() => onEdit(index, action.text)}
              className="text-ehs-slate hover:text-ehs-dark-bg min-w-0 flex-1 text-left text-[12.5px] leading-[18.13px] font-normal"
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
          className="hover:text-ehs-dark-blue-active inline-flex items-center gap-1.5 self-start pt-0.5 text-[13px] leading-[13px] font-bold text-[#10b981] transition-colors"
        >
          <Icon icon="mdi:plus" className="size-3" aria-hidden="true" />
          Add action
        </button>
      </div>
    </div>
  );
}
