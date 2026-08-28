export type BodyPartId =
  | "head-face"
  | "neck"
  | "chest-shoulders"
  | "upper-arm"
  | "forearm"
  | "hand-wrist"
  | "abdomen"
  | "hip-pelvis"
  | "thigh"
  | "lower-leg"
  | "foot-ankle"
  | "upper-back"
  | "mid-back"
  | "lower-back";

export type BodyPartOption = Readonly<{
  id: BodyPartId;
  label: string;
  sided?: boolean;
}>;

export const BODY_PART_OPTIONS: readonly BodyPartOption[] = [
  { id: "head-face", label: "Head / face" },
  { id: "neck", label: "Neck" },
  { id: "chest-shoulders", label: "Chest / shoulders" },
  { id: "upper-back", label: "Upper back" },
  { id: "mid-back", label: "Mid back" },
  { id: "lower-back", label: "Lower back" },
  { id: "upper-arm", label: "Upper arm", sided: true },
  { id: "forearm", label: "Forearm", sided: true },
  { id: "hand-wrist", label: "Hand / wrist", sided: true },
  { id: "abdomen", label: "Abdomen" },
  { id: "hip-pelvis", label: "Hip / pelvis" },
  { id: "thigh", label: "Thigh", sided: true },
  { id: "lower-leg", label: "Lower leg / knee", sided: true },
  { id: "foot-ankle", label: "Foot / ankle", sided: true },
];

export type BodySide = "Left" | "Right";

/** Per-part side for multi-select (e.g. Right hand + Left foot). */
export type BodyPartSideValue = BodySide | "Both";
export type BodyPartSideMap = Readonly<
  Partial<Record<BodyPartId, BodyPartSideValue>>
>;

export function isBodyPartSided(part: BodyPartId): boolean {
  return BODY_PART_OPTIONS.find((option) => option.id === part)?.sided === true;
}

export function formatBodyPartSelection(
  bodyParts: readonly BodyPartId[],
  bodySide: BodySide,
  bodyPartSides: BodyPartSideMap = {},
): string {
  if (bodyParts.length === 0) {
    return "None selected";
  }

  return bodyParts
    .map((id) => {
      const option = BODY_PART_OPTIONS.find((part) => part.id === id);
      const label = option?.label ?? id;
      if (!option?.sided) {
        return label;
      }

      const side = bodyPartSides[id] ?? bodySide;
      const sideLabel = side === "Both" ? "Left & Right" : side;
      return `${label} · ${sideLabel}`;
    })
    .join(", ");
}
