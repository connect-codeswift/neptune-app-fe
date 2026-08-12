import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

/** One week row in GET /api/CAPA/opened-vs-closed `dataModel.weeks`. */
export type CapaOpenedClosedWeekDto = {
  week?: string | null;
  weekStart?: string | null;
  opened?: number | null;
  closed?: number | null;
};

/** dataModel shape for GET /api/CAPA/opened-vs-closed. */
export type CapaOpenedClosedDto = {
  totalOpened?: number | null;
  totalClosed?: number | null;
  weeks?: readonly CapaOpenedClosedWeekDto[] | null;
};

export type GetCapaOpenedClosedResponseDto =
  ApiEnvelopeDto<CapaOpenedClosedDto | null>;
