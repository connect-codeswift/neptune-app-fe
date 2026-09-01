"use client";

import { Icon } from "@iconify/react";
import { useId } from "react";

export type CheckboxInputVariant = "plain" | "tile";
export type CheckboxInputTone = "blue" | "green";
export type CheckboxInputSize = "sm" | "md" | "lg";

export type CheckboxInputProps = Readonly<{
  label: string;
  /** Second line under the label. Tile variant only. */
  description?: string;
  /** Iconify name shown before the label. Tile variant only. */
  icon?: string;
  /** `start` puts the box before the label, `end` parks it on the far right. */
  boxPosition?: "start" | "end";
  checked: boolean;
  /** Omit to render a settled, non-interactive row — a record, not a control. */
  onChange?: (checked: boolean) => void;
  /** `plain` is a box beside a label; `tile` wraps the pair in a bordered card. */
  variant?: CheckboxInputVariant;
  /**
   * Replaces the tile's own border/background chrome rather than adding to it —
   * for a tile whose framing is responsive or otherwise not the default one.
   */
  tileClassName?: string;
  /** The colour a checked box takes. Green reads as "done", blue as "chosen". */
  tone?: CheckboxInputTone;
  size?: CheckboxInputSize;
  disabled?: boolean;
  name?: string;
  className?: string;
  id?: string;
}>;

const BOX_SIZE: Record<CheckboxInputSize, string> = {
  sm: "size-4 rounded",
  md: "size-5 rounded-1",
  lg: "size-7 rounded-md",
};

const ICON_SIZE: Record<CheckboxInputSize, string> = {
  sm: "size-2.75",
  md: "size-3.5",
  lg: "size-4.5",
};

const CHECKED_BOX: Record<CheckboxInputTone, string> = {
  blue: "bg-ehs-normal-blue border-ehs-normal-blue text-ehs-on-accent",
  green: "bg-ehs-green border-ehs-green text-ehs-on-accent",
};

const CHECKED_TILE: Record<CheckboxInputTone, string> = {
  blue: "border-ehs-normal-blue/40 bg-ehs-normal-blue/8",
  green: "border-ehs-green bg-ehs-green-bg-light",
};

const CHECKED_LABEL: Record<CheckboxInputTone, string> = {
  blue: "text-ehs-dark-blue",
  green: "text-ehs-dark-bg",
};

const TILE_BASE =
  "rounded-2.5 flex min-h-13 items-center gap-3 border px-4 py-3 text-left transition-colors duration-200";

const TILE_RESTING =
  "border-ehs-border bg-ehs-surface/62 hover:border-ehs-border-strong hover:bg-ehs-surface/80";

/**
 * The app's checkbox, in the two shapes it actually appears in.
 *
 * The square is drawn rather than left to the browser — a native checkbox
 * cannot take the app's border, radius and tone — but a real `<input>` sits
 * behind it, so the label, keyboard and screen-reader behaviour come free
 * instead of being rebuilt out of `aria-pressed` on a button, which is what
 * every hand-rolled copy of this was doing.
 */
export function CheckboxInput(props: Readonly<CheckboxInputProps>) {
  const {
    label,
    description,
    icon,
    boxPosition = "start",
    checked,
    onChange,
    variant = "plain",
    tileClassName,
    tone = "blue",
    size = "md",
    disabled = false,
    name,
    className = "",
    id,
  } = props;

  const generatedId = useId();
  const inputId = id ?? generatedId;
  const isInteractive = onChange !== undefined && !disabled;
  const isTile = variant === "tile";

  function resolveTileClass(): string {
    if (!isTile) {
      return "flex items-center gap-2.5";
    }

    if (tileClassName !== undefined) {
      return tileClassName;
    }

    return [TILE_BASE, checked ? CHECKED_TILE[tone] : TILE_RESTING].join(" ");
  }

  const box = (
    <span
      aria-hidden="true"
      className={[
        "peer-focus-visible:ring-ehs-normal-blue/30 flex shrink-0 items-center justify-center border transition-colors peer-focus-visible:ring-2",
        BOX_SIZE[size],
        checked ? CHECKED_BOX[tone] : "border-ehs-border-strong bg-ehs-surface",
      ].join(" ")}
    >
      {checked ? <Icon icon="mdi:check" className={ICON_SIZE[size]} /> : null}
    </span>
  );

  return (
    <label
      htmlFor={inputId}
      className={[
        resolveTileClass(),
        isInteractive ? "" : "cursor-default",
        disabled ? "opacity-60" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Visually replaced, not removed: it still owns focus and the label. */}
      <input
        id={inputId}
        name={name}
        type="checkbox"
        checked={checked}
        disabled={!isInteractive}
        onChange={(event) => onChange?.(event.target.checked)}
        className="peer sr-only"
      />

      {boxPosition === "start" ? box : null}

      <span className="flex min-w-0 flex-1 items-center gap-3">
        {icon ? (
          <Icon
            icon={icon}
            className="text-ehs-gray shrink-0 text-xl md:text-2xl"
            aria-hidden="true"
          />
        ) : null}

        <span className="min-w-0">
          <span
            className={[
              "block min-w-0 truncate leading-normal",
              isTile ? "text-sm font-semibold" : "text4",
              checked ? CHECKED_LABEL[tone] : "text-ehs-dark-bg",
            ].join(" ")}
          >
            {label}
          </span>

          {description ? (
            <span className="text-ehs-muted-text mt-0.5 block text-xs leading-snug md:text-sm">
              {description}
            </span>
          ) : null}
        </span>
      </span>

      {boxPosition === "end" ? box : null}
    </label>
  );
}
