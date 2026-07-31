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
 *     `subCompanyId`/`userId`. Sending those is rejected, so the endpoints must
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
  /** Uploaded document location — a Cloudinary URL, as elsewhere in this app. */
  pdfUrl?: string | null;
  /** Required by the API. */
  productName: string;
  manufacturer?: string | null;
  casNumber?: string | null;
  hazardClass?: string | null;
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

/**
 * Swagger `TrainingLogDto` — body for POST /api/hazcom/training.
 *
 * Carries no `status`: the create route assigns one. The UI's "Topic /
 * Training Title" maps to `trainerTitle`, the only free-text field it can be —
 * worth confirming the backend doesn't mean the trainer's job title.
 */
export type TrainingLogRequestDto = {
  chemicalId?: number | null;
  /** Required by the API. ISO date-time. */
  sessionDate: string;
  /** Required by the API. */
  trainer: string;
  trainerTitle?: string | null;
  /** Comma-separated chemical names. */
  chemicalsCovered?: string | null;
  /** A string on the wire even though the UI collects a count. */
  attendees?: string | null;
  materialsLink?: string | null;
  notes?: string | null;
};

/**
 * Swagger `UpdateTrainingLogDto` — body for PUT /api/hazcom/training/{id}.
 * Identical to the create body plus a required `status`; the id travels in
 * the path.
 */
export type UpdateTrainingLogRequestDto = TrainingLogRequestDto & {
  /** "Completed" | "Scheduled" */
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
