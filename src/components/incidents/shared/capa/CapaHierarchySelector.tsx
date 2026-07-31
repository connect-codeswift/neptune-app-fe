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

/** Figma 1578:22977 — Group 608 (391.69 × 335.285) */
const LEVELS: readonly {
  id: ControlLevel;
  label: string;
  asset: string;
  layerClassName: string;
  labelClassName: string;
  isTip?: boolean;
}[] = [
  {
    id: "Elimination",
    label: "Elimination",
    asset: "/icons/capa/layer-1.svg",
    layerClassName: "inset-x-0 top-0 h-[55.891px]",
    labelClassName:
      "top-[28.19px] right-[38.09%] left-[38.94%] leading-[12.839px]",
  },
  {
    id: "Substitution",
    label: "Substitution",
    asset: "/icons/capa/layer-2.svg",
    layerClassName: "top-[60.73px] right-[8.96%] left-[9.03%] h-[55.302px]",
    labelClassName:
      "top-[88.24px] right-[35.11%] left-[38.09%] leading-[12.839px]",
  },
  {
    id: "Engineering Controls",
    label: "Engineering Controls",
    asset: "/icons/capa/layer-3.svg",
    layerClassName: "top-[120.44px] right-[17.72%] left-[17.73%] h-[54.588px]",
    labelClassName:
      "top-[146.11px] right-[25.87%] left-[30.21%] leading-normal",
  },
  {
    id: "Administrative controls",
    label: "Administrative\ncontrols",
    asset: "/icons/capa/layer-4.svg",
    layerClassName: "top-[179.24px] right-[26.43%] left-[26.49%] h-[52.554px]",
    labelClassName:
      "top-[204.66px] right-[34.64%] left-[34.98%] text-center leading-normal whitespace-pre-line text-[#f6f6f6]",
  },
  {
    id: "PPE",
    label: "PPE",
    asset: "/icons/capa/layer-5.svg",
    layerClassName: "top-[205.17px] right-[32.77%] left-[32.77%] h-[130.111px]",
    labelClassName:
      "top-[269.55px] right-[45.96%] left-[45.87%] text-center leading-normal text-[#f6f6f6]",
    isTip: true,
  },
];

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
              "absolute border-0 bg-transparent p-0 transition-[filter,opacity] duration-150 outline-none",
              level.layerClassName,
              isSelected
                ? "brightness-110 drop-shadow-[0_6px_14px_rgba(8,145,166,0.4)]"
                : "hover:brightness-105",
            ].join(" ")}
            style={{ zIndex: isSelected ? 20 : index + 1 }}
          >
            {level.isTip ? (
              <span className="flex size-full items-center justify-center">
                <span className="relative size-full rotate-180">
                  <span className="absolute inset-x-[6.7%] top-0 bottom-1/4 block">
                    <img
                      src={level.asset}
                      alt=""
                      className="block size-full max-w-none"
                      aria-hidden="true"
                    />
                  </span>
                </span>
              </span>
            ) : (
              <img
                src={level.asset}
                alt=""
                className="absolute inset-0 block size-full max-w-none"
                aria-hidden="true"
              />
            )}
            <span className="sr-only">{level.id}</span>
          </button>
        );
      })}

      {LEVELS.map((level) => (
        <span
          key={`${level.id}-label`}
          className={[
            "pointer-events-none absolute z-30 -translate-y-1/2 text-[16.674px] font-semibold tracking-[0.0917px] text-white",
            level.labelClassName,
            value === level.id ? "opacity-100" : "opacity-95",
          ].join(" ")}
          aria-hidden="true"
        >
          {level.label}
        </span>
      ))}
    </div>
  );
}
