"use client";

export type ControlLevel =
  | "Elimination"
  | "Substitution"
  | "Engineering Controls"
  | "Administrative controls"
  | "PPE";

export type CapaHierarchySelectorProps = Readonly<{
  value: ControlLevel | null;
  onChange: (value: ControlLevel) => void;
  className?: string;
}>;

/**
 * Figma 1578:22977 — Group 608 (391.69 × 335.285).
 *
 * Band colours follow the standard NIOSH hierarchy-of-controls ramp
 * (blue → green → amber → orange → red, most to least effective) so the
 * selector reads the same way as the printed poster.
 *
 * The shapes are inlined rather than loaded from /icons/capa/layer-N.svg
 * because those files fill with `var(--fill-0, #0891A6)`, and a CSS variable
 * can't cross the document boundary of an <img src> — so every band fell back
 * to the same teal. Inline, each path takes its own fill, and it drops five
 * network requests.
 *
 * Geometry is numeric rather than hand-written Tailwind classes so the label
 * box is derived from its own band. The original label coordinates came
 * straight from Figma and were far narrower than the bands they sat on, which
 * wrapped "Engineering Controls" onto two lines and pushed it off its band.
 */
type Level = Readonly<{
  id: ControlLevel;
  label: string;
  fill: string;
  /** Label colour, picked for WCAG AA contrast against `fill`. */
  labelClass: string;
  viewBox: string;
  path: string;
  /** Band box within the 391.69 × 335.285 frame. */
  top: number;
  height: number;
  /** Inset from each side, as a percentage of the frame width. */
  left: number;
  right: number;
  /**
   * Extra horizontal breathing room for the label, in percent, so text keeps
   * clear of the sloping edges. Bands taper, so the lower ones need more.
   */
  labelInset: number;
  isTip?: boolean;
}>;

const LEVELS: readonly Level[] = [
  {
    id: "Elimination",
    label: "Elimination",
    fill: "#3a72ad",
    labelClass: "text-white",
    viewBox: "0 0 391.69 55.8906",
    path: "M0 0L391.69 4.39328e-05C385.486 11.4712 377.904 23.8374 371.362 35.2776L359.381 55.8874L32.5376 55.8906L0 0Z",
    top: 0,
    height: 55.891,
    left: 0,
    right: 0,
    labelInset: 10,
  },
  {
    id: "Substitution",
    label: "Substitution",
    fill: "#7fb539",
    labelClass: "text-ehs-dark-bg",
    viewBox: "0 0 321.217 55.3021",
    path: "M0 0.143404C14.1767 -0.137902 28.9132 0.0809157 43.1337 0.0836883L122.571 0.0847557L321.217 0.101606C318.778 4.63684 315.883 9.40647 313.273 13.8809L300.921 35.1836C297.231 41.8533 293.115 48.6544 289.3 55.2967L31.7854 55.3021C28.6298 49.49 0.311462 2.0861 0 0.143404Z",
    top: 60.73,
    height: 55.302,
    left: 9.03,
    right: 8.96,
    labelInset: 6,
  },
  {
    id: "Engineering Controls",
    label: "Engineering Controls",
    fill: "#fcc10f",
    labelClass: "text-ehs-dark-bg",
    viewBox: "0 0 252.811 54.5884",
    path: "M0 0.0264508L252.811 0C250.64 3.96751 248.003 8.24896 245.694 12.1653L232.796 34.0287C229.025 40.7365 224.694 47.7568 220.774 54.454C198.746 54.7417 176.066 54.4796 153.98 54.4696L32.1543 54.4723C28.3919 48.386 24.5683 41.6156 20.8959 35.4214L0 0.0264508Z",
    top: 120.44,
    height: 54.588,
    left: 17.73,
    right: 17.72,
    labelInset: 3,
  },
  {
    id: "Administrative controls",
    label: "Administrative controls",
    fill: "#ef8b2c",
    labelClass: "text-ehs-dark-bg",
    viewBox: "0 0 184.419 52.5537",
    path: "M0 0.131956C6.60547 -0.126957 14.6494 0.074799 21.3929 0.0758654L61.6651 0.0814107L184.419 0.0735093C178.241 11.0297 171.496 22.2327 165.146 33.1395C161.452 39.4438 157.291 46.1832 153.816 52.5494L30.6946 52.5537C21.9869 37.2812 12.8021 22.2285 3.97615 7.01959C2.64487 4.72584 1.24436 2.47582 0 0.131956Z",
    top: 179.24,
    height: 52.554,
    left: 26.49,
    right: 26.43,
    labelInset: 1,
  },
  {
    id: "PPE",
    label: "PPE",
    fill: "#d81f26",
    labelClass: "text-white",
    viewBox: "0 0 116.92 97.583",
    path: "M58.4602 0L116.92 97.583H0L58.4602 0Z",
    top: 205.17,
    height: 130.111,
    left: 32.77,
    right: 32.77,
    labelInset: 0,
    isTip: true,
  },
];

/** The tapering triangle needs its label up in the wide part, not centred. */
const PPE_LABEL_TOP = 269.55;

function LayerShape(props: Readonly<{ level: Level; isSelected: boolean }>) {
  const { level, isSelected } = props;

  return (
    <svg
      viewBox={level.viewBox}
      preserveAspectRatio="none"
      className="block size-full max-w-none overflow-visible"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={level.path}
        fill={level.fill}
        stroke={isSelected ? "#ffffff" : "transparent"}
        strokeWidth={isSelected ? 4 : 0}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function CapaHierarchySelector(
  props: Readonly<CapaHierarchySelectorProps>,
) {
  const { value, onChange, className = "" } = props;

  return (
    <div
      className={[
        "relative mx-auto h-[335.285px] w-full max-w-[391.69px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="radiogroup"
      aria-label="Hierarchy of controls"
    >
      {LEVELS.map((level, index) => {
        const isSelected = value === level.id;

        return (
          <button
            key={level.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(level.id)}
            className={[
              "absolute cursor-pointer border-0 bg-transparent p-0 transition-opacity duration-150 outline-none",
              // Unselected bands sit back a little so the chosen one reads as
              // chosen — the modal blocks submission until one is picked.
              isSelected
                ? "opacity-100 drop-shadow-[0_6px_14px_rgba(11,19,32,0.28)]"
                : "opacity-80 hover:opacity-100",
            ].join(" ")}
            style={{
              top: `${String(level.top)}px`,
              height: `${String(level.height)}px`,
              left: `${String(level.left)}%`,
              right: `${String(level.right)}%`,
              zIndex: isSelected ? 20 : index + 1,
            }}
          >
            {level.isTip ? (
              <span className="flex size-full items-center justify-center">
                <span className="relative size-full rotate-180">
                  <span className="absolute inset-x-[6.7%] top-0 bottom-1/4 block">
                    <LayerShape level={level} isSelected={isSelected} />
                  </span>
                </span>
              </span>
            ) : (
              <span className="absolute inset-0 block">
                <LayerShape level={level} isSelected={isSelected} />
              </span>
            )}
            <span className="sr-only">{level.id}</span>
          </button>
        );
      })}

      {LEVELS.map((level) => {
        const isSelected = value === level.id;

        return (
          <span
            key={`${level.id}-label`}
            className={[
              "pointer-events-none absolute z-30 flex items-center justify-center",
              "text-center text-[16.674px] leading-tight font-semibold tracking-[0.0917px] text-balance",
              level.labelClass,
              isSelected ? "opacity-100" : "opacity-95",
            ].join(" ")}
            style={
              level.isTip
                ? {
                    top: `${String(PPE_LABEL_TOP)}px`,
                    left: `${String(level.left)}%`,
                    right: `${String(level.right)}%`,
                    transform: "translateY(-50%)",
                  }
                : {
                    top: `${String(level.top)}px`,
                    height: `${String(level.height)}px`,
                    left: `${String(level.left + level.labelInset)}%`,
                    right: `${String(level.right + level.labelInset)}%`,
                  }
            }
            aria-hidden="true"
          >
            {level.label}
          </span>
        );
      })}
    </div>
  );
}
