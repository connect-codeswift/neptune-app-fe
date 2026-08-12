/** Shared Tailwind classes using @theme EHS tokens from globals.css */

export const ehsFieldClass = "flex flex-col gap-1.5";

export const ehsLabelClass = "text7 text-ehs-gray block";

/**
 * Frosted to match FIELD_BASE in `@/components/ui/field-styles` — same fill,
 * hairline, blur and focus halo, so fields are one material everywhere. These
 * controls used to be solid (`bg-ehs-light-text`) because the auth screens
 * sat on opaque panels; those panels are glass now, and a solid field on a
 * glass card reads as a sticker on a window.
 */
export const ehsInputClass =
  "text4 text-ehs-darker w-full rounded-2.5 border border-[rgba(15,23,42,0.08)] bg-white/55 px-3.5 py-2.5 backdrop-blur-1.25 outline-none transition placeholder:text-ehs-muted-text hover:border-[rgba(15,23,42,0.18)] hover:bg-white/70 focus:border-ehs-normal-blue focus:ring-0.75 focus:ring-ehs-normal-blue/15 disabled:cursor-not-allowed disabled:opacity-60";

export const ehsSelectClass =
  "text4 text-ehs-darker w-full cursor-pointer rounded-2.5 border border-[rgba(15,23,42,0.08)] bg-white/55 px-3.5 py-2.5 backdrop-blur-1.25 outline-none transition hover:border-[rgba(15,23,42,0.18)] hover:bg-white/70 focus:border-ehs-normal-blue focus:ring-0.75 focus:ring-ehs-normal-blue/15 disabled:cursor-not-allowed disabled:opacity-60";

export const ehsLinkClass =
  "text4 text-ehs-normal-blue transition-colors hover:text-ehs-normal-blue-hover";

export const ehsIconButtonClass =
  "cursor-pointer text-ehs-muted-text transition-colors hover:text-ehs-gray";

export const ehsButtonBaseClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50";

/**
 * Button tiers in the glass system: filled colour stays for commands —
 * primary and danger keep solid fills so the actions that matter never
 * dissolve into the scenery — but they take the material's inset top
 * highlight, while the quiet tiers (secondary/tertiary/ghost) frost like the
 * fields: same fill, hairline and blur as ehsInputClass.
 */
export const ehsButtonPrimaryClass =
  "btn-sweep bg-ehs-normal-blue text-ehs-light-text shadow-[0px_6px_18px_-6px_var(--ehs-normal-blue),inset_0px_1px_0px_1px_rgba(255,255,255,0.25)] hover:bg-ehs-normal-blue-hover active:bg-ehs-normal-blue-active";

export const ehsButtonSecondaryClass =
  "border border-white/60 bg-ehs-light-blue/75 text-ehs-darker shadow-sm backdrop-blur-1.25 hover:bg-ehs-light-blue active:bg-ehs-light-blue-active";

export const ehsButtonTertiaryClass =
  "border border-[rgba(15,23,42,0.08)] bg-white/55 text-ehs-gray shadow-sm backdrop-blur-1.25 hover:border-[rgba(15,23,42,0.18)] hover:bg-white/75";

export const ehsButtonDangerClass =
  "btn-sweep bg-ehs-red text-ehs-light-text shadow-[0px_6px_18px_-6px_var(--ehs-red),inset_0px_1px_0px_1px_rgba(255,255,255,0.25)] hover:bg-ehs-red/90 active:bg-ehs-red/80 focus-visible:ring-ehs-red/30";

export const ehsIconButtonBaseClass =
  "inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50";

export const ehsIconButtonPrimaryClass =
  "bg-ehs-normal-blue text-ehs-light-text shadow-md shadow-ehs-normal-blue/15 hover:bg-ehs-normal-blue-hover active:bg-ehs-normal-blue-active";

export const ehsIconButtonSecondaryClass =
  "bg-ehs-light-blue text-ehs-darker shadow-sm hover:bg-ehs-light-blue-hover active:bg-ehs-light-blue-active";

export const ehsIconButtonTertiaryClass =
  "border border-[rgba(15,23,42,0.08)] bg-white/55 text-ehs-gray shadow-sm backdrop-blur-1.25 hover:border-[rgba(15,23,42,0.18)] hover:bg-white/75";

export const ehsIconButtonGhostClass =
  "text-ehs-muted-text hover:bg-white/50 hover:text-ehs-gray";

export const ehsTextButtonClass =
  "inline-flex cursor-pointer items-center gap-1 rounded bg-transparent p-0 text-sm font-medium text-ehs-normal-blue transition-colors hover:text-ehs-normal-blue-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50";
