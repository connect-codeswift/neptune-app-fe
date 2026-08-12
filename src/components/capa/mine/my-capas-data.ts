export type MyCapaCardItem = Readonly<{
  id: string;
  code: string;
  title: string;
  overdueSince?: string;
}>;

/** Seed data for My CAPAs — Figma 838:3105. */
export const MY_CAPAS_ASSIGNED: readonly MyCapaCardItem[] = [];

export const MY_CAPAS_PENDING_VERIFICATION: readonly MyCapaCardItem[] = [];

export const MY_CAPAS_OVERDUE: readonly MyCapaCardItem[] = [
  {
    id: "capa-2025-006",
    code: "CAPA-2025-006",
    title: "Noise Exposure Control - Stamping Area",
    overdueSince: "2025-03-10",
  },
];
