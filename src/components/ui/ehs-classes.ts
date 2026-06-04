/** Shared Tailwind classes using @theme EHS tokens from globals.css */

export const ehsFieldClass = "flex flex-col gap-1.5";

export const ehsLabelClass = "block text-sm font-medium text-ehs-gray";

export const ehsInputClass =
  "w-full rounded-lg border border-ehs-border bg-ehs-light-text px-3.5 py-2.5 text-sm text-ehs-darker shadow-sm outline-none transition placeholder:text-ehs-muted-text focus:border-ehs-normal-blue focus:ring-2 focus:ring-ehs-normal-blue/20";

export const ehsLinkClass =
  "text-ehs-normal-blue transition-colors hover:text-ehs-normal-blue-hover";

export const ehsIconButtonClass =
  "text-ehs-muted-text transition-colors hover:text-ehs-gray";

export const ehsButtonBaseClass =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20 disabled:pointer-events-none disabled:opacity-50";

export const ehsButtonPrimaryClass =
  "bg-ehs-normal-blue text-ehs-light-text hover:bg-ehs-normal-blue-hover active:bg-ehs-normal-blue-active";

export const ehsButtonSecondaryClass =
  "bg-ehs-light-blue text-ehs-darker hover:bg-ehs-light-blue-hover active:bg-ehs-light-blue-active";

export const ehsButtonTertiaryClass =
  "border border-ehs-border bg-ehs-light-text text-ehs-gray hover:bg-ehs-light-bg";
