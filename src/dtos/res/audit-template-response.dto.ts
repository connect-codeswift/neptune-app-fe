import type { CreateAuditTemplateRequestDto } from "@/dtos/req/audit-template-request.dto";
import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

/** Audit template as returned by the API, with its server-assigned id. */
export type AuditTemplateDto = CreateAuditTemplateRequestDto & { id?: number };

/** Matches backend response for POST /api/AuditTemplate. */
export type CreateAuditTemplateResponseDto =
  ApiEnvelopeDto<AuditTemplateDto | null>;
