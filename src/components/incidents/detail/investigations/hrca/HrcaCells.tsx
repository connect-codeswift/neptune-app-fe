"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type {
  HrcaCorrectiveAction,
  HrcaWhyStep,
} from "@/components/incidents/detail/investigations/hrca/hrca-data";

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const cardShell =
  "relative flex h-full min-h-[128px] w-full flex-col items-start rounded-[12px] border border-[rgba(11,19,32,0.14)] bg-white/80 pt-[13px] px-[14px] pb-3.5 text-left transition-shadow";

function Connector() {
  return (
    <span className="pointer-events-none absolute top-1/2 -left-[12px] z-10 -translate-y-1/2 opacity-80">
      <Icon
        icon="mdi:menu-right"
        className="size-3.5 text-ehs-muted-text"
        aria-hidden="true"
      />
    </span>
  );
}

export function HrcaCategoryCell(
  props: Readonly<{ category: string }>,
) {
  const { category } = props;
  const lines = category.includes(" / ")
    ? category.split(" / ").map((part, index, all) =>
        index < all.length - 1 ? `${part} /` : part,
      )
    : [category];

  return (
    <div className="flex h-full min-h-[128px] items-center justify-center self-stretch rounded-[9px] border border-[rgba(15,23,42,0.08)] bg-ehs-normal-blue/13 px-[11px] py-[9px]">
      <p className="text-ehs-dark-bg text-center text-sm leading-[14.4px] font-bold">
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
  return (
    <button type="button" onClick={onEdit} className={[cardShell, "cursor-pointer hover:border-[rgba(11,19,32,0.22)]"].join(" ")}>
      <p
        className="mb-1.5 text-xs leading-[13px] font-bold tracking-[0.72px] uppercase"
        style={{ color: accent }}
      >
        Contributing factor
      </p>
      <p className="text-ehs-dark-bg text-sm leading-[18.13px] font-bold">
        {text}
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
      <div className="relative h-full min-h-[128px]">
        {showConnector ? <Connector /> : null}
        <button
          type="button"
          onClick={onEdit}
          className={[cardShell, "cursor-pointer hover:border-[rgba(11,19,32,0.22)]"].join(" ")}
          style={
            why.isRootCause
              ? { boxShadow: `0px 0px 0px 3px ${hexToRgba(accent, 0.18)}` }
              : undefined
          }
        >
          <div className="mb-[7px] flex w-full items-center gap-[7px]">
            <span
              className="inline-flex size-[19px] shrink-0 items-center justify-center rounded-[9.5px] text-xs leading-[15.23px] font-bold text-ehs-light-text"
              style={{ backgroundColor: accent }}
            >
              {String(why.num)}
            </span>
            {why.isRootCause ? (
              <span
                className="inline-flex items-center gap-[3px] text-xs font-bold tracking-[0.54px] uppercase"
                style={{ color: accent }}
              >
                <Icon icon="mdi:flag-variant" className="size-2.5" aria-hidden="true" />
                Root cause
              </span>
            ) : (
              <Text
                as="span"
                className="text-ehs-muted-text text-xs font-bold tracking-[0.54px] uppercase"
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
              className="text-ehs-muted-text ml-auto inline-flex size-[18px] items-center justify-center rounded-[5px] opacity-40 transition-opacity hover:opacity-100 hover:text-ehs-red"
              aria-label="Remove why step"
            >
              <Icon icon="mdi:close" className="size-[11px]" aria-hidden="true" />
            </span>
          </div>
          <p className="text-sm leading-[18.13px] font-normal text-ehs-slate">
            {why.text}
          </p>
        </button>
      </div>
    );
  }

  if (canAdd) {
    return (
      <div className="relative h-full min-h-[128px]">
        {showConnector ? <Connector /> : null}
        <button
          type="button"
          onClick={onAdd}
          className="flex h-full min-h-[128px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[12px] border border-dashed border-[rgba(15,23,42,0.14)] px-[14px] py-[13px] transition-colors hover:border-[rgba(15,23,42,0.28)]"
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
          <Text as="span" className="text-ehs-muted-text text-xs">
            Add why
          </Text>
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[128px]">
      {showConnector ? <Connector /> : null}
      <div className="flex h-full min-h-[128px] w-full items-center justify-center rounded-[12px] border border-dashed border-[rgba(15,23,42,0.14)] px-[14px] py-[13px]">
        <Text as="span" className="text-sm leading-[15.95px] text-ehs-muted-text">
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
    onRemove: (index: number) => void;
  }>,
) {
  const { actions, onAdd, onRemove } = props;

  return (
    <div className="relative flex h-full min-h-[128px] w-full flex-col items-start rounded-[12px] border border-ehs-green/50 bg-white/80 px-[14px] py-[13px] text-left">
      <p className="mb-2 text-xs leading-[13px] font-bold tracking-[0.72px] text-ehs-green uppercase">
        Corrective actions
      </p>
      <div className="flex w-full flex-1 flex-col gap-2">
        {actions.map((action, index) => (
          <div
            key={action.id ?? `${action.text}-${index}`}
            className="group flex items-start gap-2"
          >
            <span className="mt-px flex size-[17px] shrink-0 items-center justify-center rounded-[5px] text-ehs-green">
              <Icon icon="mdi:check" className="size-[11px]" aria-hidden="true" />
            </span>
            <p className="min-w-0 flex-1 text-[11.8px] leading-[17.4px] font-normal text-ehs-slate">
              {action.text}
            </p>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-ehs-muted-text inline-flex size-4 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 hover:text-ehs-red"
              aria-label="Remove action"
            >
              <Icon icon="mdi:close" className="size-2.5" aria-hidden="true" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 self-start text-sm font-bold text-ehs-green transition-colors hover:text-ehs-green"
        >
          <Icon icon="mdi:plus" className="size-3" aria-hidden="true" />
          Add action
        </button>
      </div>
    </div>
  );
}
