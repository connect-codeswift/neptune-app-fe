/** Auth @container scaling — values are 0.8× cqw (≈9.6px per 0.8cqw at ~1200px width). */

export const authFieldClass = "flex flex-col gap-[0.264cqw]";

export const authLabelClass =
  "block text-[0.936cqw] font-medium text-ehs-gray";

export const authInputClass =
  "w-full rounded-lg border border-ehs-border bg-ehs-light-text px-[0.936cqw] py-[0.536cqw] text-[0.936cqw] text-ehs-darker shadow-sm outline-none transition placeholder:text-ehs-muted-text focus:border-ehs-normal-blue focus:ring-2 focus:ring-ehs-normal-blue/20";

export const authSelectClass = `${authInputClass} cursor-pointer`;

export const authLinkClass =
  "text-[0.936cqw] text-ehs-normal-blue transition-colors hover:text-ehs-normal-blue-hover";

export const authButtonSizeClass =
  "gap-[0.4cqw] px-[1.064cqw] py-[0.536cqw] text-[0.936cqw]";

export const authTextButtonClass =
  "inline-flex cursor-pointer items-center gap-[0.264cqw] rounded bg-transparent p-0 text-[0.936cqw] font-medium text-ehs-normal-blue transition-colors hover:text-ehs-normal-blue-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50";

export const authIconButtonSizeClass =
  "inline-flex h-[2.664cqw] w-[2.664cqw] shrink-0 cursor-pointer items-center justify-center rounded-lg text-[1.2cqw] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/20 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50";

export const authLogoRootClass = "gap-[0.536cqw]";

export const authLogoIconBoxClass =
  "flex h-[2.136cqw] w-[2.136cqw] items-center justify-center rounded-lg bg-ehs-normal-blue";

export const authLogoIconClass = "text-ehs-light-text text-[1.2cqw]";

export const authLogoTextClass =
  "text-[1.064cqw] font-semibold tracking-tight";
