"use client";

import { Icon } from "@iconify/react";
import type { HazcomPictogram } from "@/components/hazcom/shared/hazcom-types";

export type HazcomPictogramChipProps = Readonly<{
  pictogram: HazcomPictogram;
  selected?: boolean;
  onToggle?: () => void;
}>;

const pictogramIcon: Record<HazcomPictogram, string> = {
  Flammable: "mdi:fire",
  Toxic: "mdi:skull-crossbones",
  Irritant: "mdi:alert-circle-outline",
  Environmental: "mdi:leaf",
  Corrosive: "mdi:flask-round-bottom-outline",
  Oxidizer: "mdi:circle-half-full",
  Explosive: "mdi:bomb",
  "Compressed Gas": "mdi:gas-cylinder",
  "Health Hazard": "mdi:heart-pulse",
};

export function HazcomPictogramChip(
  props: Readonly<HazcomPictogramChipProps>,
) {
  const { pictogram, selected = false, onToggle } = props;
  const icon = pictogramIcon[pictogram];

  const chipClassName = [
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors",
    selected
      ? "border-ehs-normal-blue bg-ehs-normal-blue-bg-light text-ehs-dark-blue"
      : "border-ehs-border bg-white/60 text-ehs-gray",
  ]
    .filter(Boolean)
    .join(" ");

  if (!onToggle) {
    return (
      <span className={chipClassName}>
        <Icon icon={icon} className="size-3.5" aria-hidden="true" />
        {pictogram}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={[chipClassName, "hover:border-ehs-normal-blue"]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon icon={icon} className="size-3.5" aria-hidden="true" />
      {pictogram}
    </button>
  );
}
