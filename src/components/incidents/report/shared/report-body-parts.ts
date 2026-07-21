export type BodyPartId =
  | "head-face"
  | "neck"
  | "chest-shoulders"
  | "arm"
  | "hand-wrist"
  | "abdomen"
  | "hip-pelvis"
  | "leg-knee"
  | "foot-ankle"
  | "back";

export type BodyPartOption = Readonly<{
  id: BodyPartId;
  label: string;
  sided?: boolean;
}>;

export const BODY_PART_OPTIONS: readonly BodyPartOption[] = [
  { id: "head-face", label: "Head / face" },
  { id: "neck", label: "Neck" },
  { id: "chest-shoulders", label: "Chest / shoulders" },
  { id: "arm", label: "Arm", sided: true },
  { id: "hand-wrist", label: "Hand / wrist", sided: true },
  { id: "abdomen", label: "Abdomen" },
  { id: "hip-pelvis", label: "Hip / pelvis" },
  { id: "leg-knee", label: "Leg / knee", sided: true },
  { id: "foot-ankle", label: "Foot / ankle", sided: true },
  { id: "back", label: "Back" },
];

export type BodySide = "Left" | "Right";

export function formatBodyPartSelection(
  bodyParts: readonly BodyPartId[],
  bodySide: BodySide,
): string {
  if (bodyParts.length === 0) {
    return "None selected";
  }

  const labels = bodyParts.map(
    (id) => BODY_PART_OPTIONS.find((part) => part.id === id)?.label ?? id,
  );
  const primary = BODY_PART_OPTIONS.find((part) => part.id === bodyParts[0]);
  const showSide = primary?.sided !== false && bodyParts.some((id) => {
    const option = BODY_PART_OPTIONS.find((part) => part.id === id);
    return option?.sided;
  });

  if (labels.length === 1) {
    return showSide ? `${labels[0]} · ${bodySide}` : labels[0];
  }

  return showSide
    ? `${labels.join(", ")} · ${bodySide}`
    : labels.join(", ");
}
