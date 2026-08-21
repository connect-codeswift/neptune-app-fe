/**
 * Request bodies for the HazCom endpoints.
 *
 * Reconciled field-by-field against the live staging schema
 * (https://neptune-be-stag.codeswift.org/swagger/v1/swagger.json) — `api/hazcom.md`
 * lists paths only, and every `$ref` in it points at a `components/schemas`
 * section that was never supplied. The odd spellings below (`chemi_Name`,
 * `caS_Number`, `p_Codes`) are the backend's own.
 *
 * Two conventions run through the whole module and differ from every other
 * feature in this app:
 *   - Every schema is `additionalProperties: false`, and none of them carry
 *     `siteId`/`userId`. Sending those is rejected, so the endpoints must
 *     read them from the bearer token.
 *   - List-shaped values (pictograms, PPE, chemicals covered) are single
 *     strings on the wire, not arrays. The UI joins with ", " and splits on
 *     commas coming back.
 */

/** Query string shared by every paged HazCom list endpoint. */
export type HazcomPageQueryDto = {
  pageNumber: number;
  pageSize: number;
};

/** Swagger `ChemicalDto` — body for POST /api/hazcom/chemical. */
export type ChemicalRequestDto = {
  /** Omit to create; send to update the existing record. */
  id?: number;
  /** Required by the API. */
  chemi_Name: string;
  caS_Number?: string | null;
  /** Required by the API. */
  hazardClass: string;
  /** Required by the API. */
  location: string;
  /** Where waste / surplus is disposed; optional, max 250 chars. */
  disposeLocation?: string | null;
  /** Required by the API. One combined string ("15 Liters"). */
  currentQuantity: string;
  /** "Danger" | "Warning" */
  ghsSignal?: string | null;
  /** Free text (file name / URL) — not a numeric id into /api/hazcom/sds. */
  linkToSdsRecord?: string | null;
  /** "Active" | "Inactive" */
  status?: string | null;
  /** One string, not a list — the UI joins its selections with ", ". */
  ghsPictograms?: string | null;
  notes?: string | null;
  /** Drives the /drafts vs /published split. */
  isDraft: boolean;
};

/** Swagger `SafetyDataSheetDto` — body for POST /api/hazcom/sds. */
export type SafetyDataSheetRequestDto = {
  id?: number;
  /** Links the sheet to a row from /api/hazcom/chemical. */
  chemicalId?: number | null;
  /** Cloudinary URL after client-side upload — never a files-intent id. */
  pdfUrl?: string | null;
  /** Required by the API. */
  productName: string;
  manufacturer?: string | null;
  casNumber?: string | null;
  hazardClass?: string | null;
  /** Where waste / surplus is disposed; optional, max 250 chars. */
  disposeLocation?: string | null;
  /** "Danger" | "Warning" */
  signalWord?: string | null;
  /** ISO date-time. */
  revisionDate?: string | null;
  version?: string | null;
  /** One string, not a list. */
  ghsPictograms?: string | null;
  /** Required by the API. One H-code, or several joined with ", ". */
  hazardStatement: string;
  /** Required by the API. One P-code, or several joined with ", ". */
  precautionaryStatement: string;
  isDraft: boolean;
};

/**
 * Swagger `HazardHCodeDto` — body for POST /api/hazcom/hazard-hcode.
 * The whole body is the code string; there is no statement text field.
 */
export type HazardHCodeRequestDto = {
  /** GHS hazard statement code, e.g. "H314". */
  codes: string;
};

/** Swagger `PrecautionaryCodeDto` — body for POST /api/hazcom/precautionary-code. */
export type PrecautionaryCodeRequestDto = {
  /** GHS precautionary statement code, e.g. "P260". */
  p_Codes: string;
};

/** Swagger `TrainingMaterialDto` — one uploaded training document. */
export type TrainingMaterialRequestDto = {
  id?: number;
  fileUrl: string;
  fileName: string;
  fileType?: string | null;
};

/**
 * Body for POST /api/v1/hazcom/trainings — "Schedule Training".
 *
 * `trainerId`/`attendeeIds` are FKs to Users, replacing the old free-text
 * `trainer` string and CSV `attendees` string (see `FEGuides/HazCom.md` §5).
 * Carries no `status`: every new training starts at `"Scheduled"`. Materials
 * upload to Cloudinary first; only the `secureUrl` is sent as `fileUrl`.
 */
export type TrainingLogRequestDto = {
  chemicalId?: number | null;
  /** Required by the API. ISO date-time with offset. */
  sessionDate: string;
  /** Required by the API — FK to Users. */
  trainerId: number;
  /** Trainer job title, e.g. "Safety Officer". */
  trainerTitle?: string | null;
  /** Comma-separated chemical names / topics covered. */
  chemicalsCovered?: string | null;
  /** FKs to Users — a full replacement set on update, same as `materials`. */
  attendeeIds?: number[] | null;
  /** Full materials list — PUT must send the entire array, not a patch. */
  materials?: TrainingMaterialRequestDto[] | null;
  notes?: string | null;
};

/**
 * Body for PUT /api/v1/hazcom/trainings/{id} — full edit. Identical to the
 * create body plus a required `status`; the id travels in the path.
 */
export type UpdateTrainingLogRequestDto = TrainingLogRequestDto & {
  /** "Scheduled" | "InProgress" | "Completed" | "Cancelled" */
  status: string;
};

/** Body for PUT /api/v1/hazcom/trainings/{id}/status — status-only transition. */
export type UpdateTrainingStatusRequestDto = {
  /** "Scheduled" | "InProgress" | "Completed" | "Cancelled" */
  status: string;
};

/**
 * Swagger `ChemicalRiskAssessmentDto` — body for both
 * POST /api/hazcom/risk-assessment and PUT /api/hazcom/risk-assessment/{id}.
 *
 * The ratings are flat columns rather than a nested object, and the id is not
 * part of the body at all — updates address the row through the path.
 */
export type ChemicalRiskAssessmentRequestDto = {
  /** Required by the API. Row id from /api/hazcom/chemical, not a name. */
  chemicalId: number;
  /** The exposure scenario / task description. */
  description?: string | null;
  /** Free text on the wire, so the UI's minute count is sent as a string. */
  exposureDuration?: string | null;
  frequency?: string | null;
  /** The four 0-4 GHS/NFPA-style ratings the assessment form collects. */
  hazardHealthRating: number;
  hazardFlammabilityRating: number;
  hazardReactivityRating: number;
  hazardPpeIndexRating: number;
  /** Comma-separated PPE labels. */
  recommendedPpe?: string | null;
  /** Controls / mitigation notes. */
  notes?: string | null;
  /** Derived from the ratings sum — see `hazcomRiskLevel`. */
  riskLevel?: string | null;
  riskScore: number;
  isDraft: boolean;
};
