import type { CapaEffectiveness } from "@/dtos/req/capa-verification-request.dto";

export type CapaChecklistItemDto = Readonly<{
  item: string;
  isChecked: boolean;
}>;

export type CapaVerificationDto = Readonly<{
  capaId: number;
  userId: number;
  effectiveness: CapaEffectiveness;
  notes?: string | null;
  checklist?: readonly CapaChecklistItemDto[] | null;
  verifiedAt?: string | null;
  verifiedByName?: string | null;
}>;
