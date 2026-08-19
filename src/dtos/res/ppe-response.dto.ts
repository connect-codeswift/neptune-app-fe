import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

/** One issuance row nested under GET /api/ppe/{id} `issues`. */
export type PpeIssueDto = {
  id?: number | string;
  assignedToId?: number | string;
  assignedToName?: string;
  assignedToRole?: string | null;
  assignTo?: number | string;
  quantity?: number;
  size?: string;
  status?: string | null;
  createdAt?: string;
  returnDate?: string | null;
  condition?: string | null;
  note?: string | null;
  item?: string | null;
  itemName?: string | null;
  ppeId?: number | string;
  ppeItemId?: number | string;
  role?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  employeeCode?: string | null;
  employeeId?: number | string;
  employeeAck?: boolean;
  siteId?: number | string;
};

/**
 * GET /api/ppe/issue/{id} payload.
 * May be a single issue, or an issue plus related employee issuances.
 */
export type PpeIssueDetailDto = PpeIssueDto & {
  /** Related issuances for the same employee when the API returns them. */
  issues?: readonly PpeIssueDto[] | null;
  history?: readonly PpeIssueDto[] | null;
  activeItems?: readonly PpeIssueDto[] | null;
};

/** One row from GET /api/ppe. */
export type PpeItemDto = {
  id?: number;
  item?: string;
  itemName?: string;
  name?: string;
  category?: string;
  availableSize?: string;
  size?: string;
  quantity?: number;
  inStock?: number;
  minStock?: number;
  supplier?: string;
  manufacturer?: string;
  modelNumber?: string;
  stockStatus?: string | null;
  status?: string | null;
  replaceAfter?: string;
  inspectionInterval?: string;
  safetyStandard?: string;
  hazardTypes?: readonly string[];
  trainingRequired?: boolean;
  unitCost?: number;
  siteId?: number;
  isDrop?: boolean;
  isUsed?: number;
  createdAt?: string;
  /** Active / historical issues for this catalog item (detail endpoint). */
  issues?: readonly PpeIssueDto[] | null;
};

/** Matches backend response for GET /api/ppe. */
export type GetPpeItemsResponseDto = ApiEnvelopeDto<PpeItemDto[] | null>;

/** Matches backend response for GET /api/ppe/{id}. */
export type GetPpeItemByIdResponseDto = ApiEnvelopeDto<PpeItemDto | null>;

/** Matches backend response for GET /api/ppe/issue/{id}. */
export type GetPpeIssueByIdResponseDto =
  ApiEnvelopeDto<PpeIssueDetailDto | null>;

/** GET /api/ppe/kpi payload. */
export type PpeKpiDto = {
  activeAssignments?: number;
  lowStockItems?: number;
};

export type GetPpeKpiResponseDto = ApiEnvelopeDto<PpeKpiDto | null>;

/** Matches backend response for POST /api/ppe/issue. */
export type IssuePpeResultDto = {
  id?: number;
  siteId?: number;
  SiteId?: number;
};

export type IssuePpeResponseDto = ApiEnvelopeDto<IssuePpeResultDto | null>;

/** Matches backend response for POST /api/ppe/acknowledge. */
export type AcknowledgePpeResponseDto = ApiEnvelopeDto<unknown>;

/** Matches backend response for POST /api/ppe/replace-request. */
export type ReplacePpeRequestResultDto = {
  id?: number;
};

export type ReplacePpeRequestResponseDto =
  ApiEnvelopeDto<ReplacePpeRequestResultDto | null>;
