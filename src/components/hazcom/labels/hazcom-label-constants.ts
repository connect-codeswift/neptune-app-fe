import type {
  HazcomPictogram,
  HazcomSignalWord,
} from "@/components/hazcom/shared";

export type HazcomLabelSizeId = "2x2" | "4x3" | "4x6" | "6x4" | "letter";

export type HazcomLabelSizeOption = Readonly<{
  id: HazcomLabelSizeId;
  /** Button label, e.g. "2×2". */
  label: string;
  /** Live-preview heading fragment, e.g. `4X3"`. */
  previewLabel: string;
  widthIn: number;
  heightIn: number;
  /** Renders as a full-width row instead of the 4-up grid. */
  fullWidth?: boolean;
}>;

export const HAZCOM_LABEL_SIZES: readonly HazcomLabelSizeOption[] = [
  { id: "2x2", label: "2×2", previewLabel: '2X2"', widthIn: 2, heightIn: 2 },
  { id: "4x3", label: "4×3", previewLabel: '4X3"', widthIn: 4, heightIn: 3 },
  { id: "4x6", label: "4×6", previewLabel: '4X6"', widthIn: 4, heightIn: 6 },
  { id: "6x4", label: "6×4", previewLabel: '6X4"', widthIn: 6, heightIn: 4 },
  {
    id: "letter",
    label: "Letter (8.5×11)",
    previewLabel: 'LETTER (8.5X11)"',
    widthIn: 8.5,
    heightIn: 11,
    fullWidth: true,
  },
];

export const HAZCOM_LABEL_DEFAULT_SIZE_ID: HazcomLabelSizeId = "4x3";

/** Fixed CHEMTREC-style emergency contact printed on every generated label. */
export const HAZCOM_LABEL_EMERGENCY_PHONE = "1-800-424-9300";

export function findHazcomLabelSize(
  id: HazcomLabelSizeId,
): HazcomLabelSizeOption {
  return (
    HAZCOM_LABEL_SIZES.find((size) => size.id === id) ?? HAZCOM_LABEL_SIZES[1]
  );
}

/** Icon per GHS pictogram for the compact icon tiles printed on the label. */
export const HAZCOM_LABEL_PICTOGRAM_ICON: Record<HazcomPictogram, string> = {
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

export function hazcomSignalWordTone(
  signalWord: HazcomSignalWord,
): "danger" | "warn" {
  return signalWord === "Danger" ? "danger" : "warn";
}

const QR_GRID_SIZE = 5;
const QR_CELL_COUNT = QR_GRID_SIZE * QR_GRID_SIZE;

/**
 * Deterministic pseudo-random 5x5 fill pattern derived from a seed string
 * (the chemical id). Not a real scannable QR code — a lightweight CSS
 * stand-in so the preview visibly changes per chemical.
 */
export function hazcomPseudoQrCells(seed: string): readonly boolean[] {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  const cells: boolean[] = [];
  for (let index = 0; index < QR_CELL_COUNT; index += 1) {
    hash = (hash * 1103515245 + 12345) >>> 0;
    cells.push((hash >>> 16) % 2 === 0);
  }

  return cells;
}

export const HAZCOM_QR_GRID_SIZE = QR_GRID_SIZE;
