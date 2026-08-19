export type CapaEffectiveness =
  "Effective" | "Partially Effective" | "Not Effective";

export type CapaChecklistItemRequestDto = Readonly<{
  item: string;
  isChecked: boolean;
}>;

/** Body for POST /api/v1/capas/{capaId}/verification */
export type CapaVerificationRequestDto = Readonly<{
  capaId: number;
  userId: number;
  effectiveness: CapaEffectiveness;
  notes?: string | null;
  checklist?: readonly CapaChecklistItemRequestDto[] | null;
}>;
