/** Shared Tailwind classes using @theme EHS tokens from globals.css */

export const ehsFieldClass = "flex flex-col gap-1.5";

export const ehsLabelClass = "block text-sm font-medium text-ehs-gray";

/**
 * Frosted to match FIELD_BASE in `@/components/ui/field-styles` — same fill,
 * hairline, blur and focus halo, so fields are one material everywhere. These
 * controls used to be solid (`bg-ehs-light-text`) because the auth screens
 * sat on opaque panels; those panels are glass now, and a solid field on a
 * glass card reads as a sticker on a window.
 */
export const ehsInputClass =
  "w-full rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-white/55 px-3.5 py-2.5 text-sm text-ehs-darker backdrop-blur-[5px] outline-none transition placeholder:text-ehs-muted-text hover:border-[rgba(15,23,42,0.18)] hover:bg-white/70 focus:border-ehs-normal-blue focus:ring-[3px] focus:ring-ehs-normal-blue/15 disabled:cursor-not-allowed disabled:opacity-60";

export const ehsSelectClass =
  "w-full cursor-pointer rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-white/55 px-3.5 py-2.5 text-sm text-ehs-darker backdrop-blur-[5px] outline-none transition hover:border-[rgba(15,23,42,0.18)] hover:bg-white/70 focus:border-ehs-normal-blue focus:ring-[3px] focus:ring-ehs-normal-blue/15 disabled:cursor-not-allowed disabled:opacity-60";

export const ehsLinkClass =
  "text-sm text-ehs-normal-blue transition-colors hover:text-ehs-normal-blue-hover";

export const ehsIconButtonClass =
  "cursor-pointer text-ehs-muted-text transition-colors hover:text-ehs-gray";

export const ehsButtonBaseClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50";

export const ehsButtonPrimaryClass =
  "btn-sweep bg-ehs-normal-blue text-ehs-light-text shadow-md shadow-ehs-normal-blue/60 hover:bg-ehs-normal-blue-hover active:bg-ehs-normal-blue-active";

export const ehsButtonSecondaryClass =
  "bg-ehs-light-blue text-ehs-darker shadow-sm hover:bg-ehs-light-blue-hover active:bg-ehs-light-blue-active";

export const ehsButtonTertiaryClass =
  "border border-ehs-border bg-ehs-light-text text-ehs-gray shadow-sm hover:bg-ehs-light-bg";

export const ehsButtonDangerClass =
  "btn-sweep bg-ehs-red text-ehs-light-text shadow-[0px_6px_18px_-6px_var(--ehs-red),inset_0px_1px_0px_1px_rgba(255,255,255,0.25)] hover:bg-ehs-red/90 active:bg-ehs-red/80 focus-visible:ring-ehs-red/30";

export const ehsIconButtonBaseClass =
  "inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50";

export const ehsIconButtonPrimaryClass =
  "bg-ehs-normal-blue text-ehs-light-text shadow-md shadow-ehs-normal-blue/15 hover:bg-ehs-normal-blue-hover active:bg-ehs-normal-blue-active";

export const ehsIconButtonSecondaryClass =
  "bg-ehs-light-blue text-ehs-darker shadow-sm hover:bg-ehs-light-blue-hover active:bg-ehs-light-blue-active";

export const ehsIconButtonTertiaryClass =
  "border border-ehs-border bg-ehs-light-text text-ehs-gray shadow-sm hover:bg-ehs-light-bg";

export const ehsIconButtonGhostClass =
  "text-ehs-muted-text hover:bg-ehs-light-bg hover:text-ehs-gray";

export const ehsTextButtonClass =
  "inline-flex cursor-pointer items-center gap-1 rounded bg-transparent p-0 text-sm font-medium text-ehs-normal-blue transition-colors hover:text-ehs-normal-blue-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50";
