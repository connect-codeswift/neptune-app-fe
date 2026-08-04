import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

export type RewriteTextDataDto = {
  /** The rewritten text, ready to drop back into the field. */
  text: string;
  /** Echoed back by the backend so we can log which model answered. */
  model?: string | null;
};

export type RewriteTextResponseDto = ApiEnvelopeDto<RewriteTextDataDto>;
