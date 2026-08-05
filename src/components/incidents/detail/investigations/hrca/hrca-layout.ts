/** Figma worksheet grid — 1500px min width, proportional columns */
export const HRCA_TABLE_MIN_WIDTH_PX = 1500;

export const hrcaDesktopGridClass =
  "grid grid-cols-[136px_minmax(0,1.2fr)_repeat(5,minmax(0,1fr))_minmax(0,1.35fr)] gap-[10px]";

export const hrcaCardBorderClass = "border border-[rgba(11,19,32,0.14)]";

export const hrcaCellShellClass = [
  "relative flex h-full w-full flex-col items-start rounded-[12px]",
  hrcaCardBorderClass,
  "bg-white pt-[13px] px-[14px] pb-[14px] text-left transition-[border-color,box-shadow]",
].join(" ");

export const HRCA_ROW_MIN_HEIGHT_CLASS = "min-h-[167px]";
