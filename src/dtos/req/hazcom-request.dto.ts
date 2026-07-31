/**
 * Request bodies for the HazCom endpoints in `api/hazcom.md`.
 *
 * IMPORTANT — the spec file lists only paths; every `$ref` in it points at
 * `#/components/schemas/…`, and that section was not included. The field sets
 * below were therefore inferred from what the HazCom UI already collects
 * (`components/hazcom/shared/hazcom-types.ts`) plus the conventions the other
 * modules follow (numeric ids, `subCompanyId`/`userId` on writes).
 *
 * `ChemicalRequestDto` has since been reconciled against the live staging
 * schema and no longer follows those guesses. Every *other* type here is still
 * inferred and is known to be wrong in the same ways — the real
 * `HazardHCodeDto` is `{ codes: string }`, `PrecautionaryCodeDto` is
 * `{ p_Codes: string }`, and `SafetyDataSheetDto` / `ChemicalRiskAssessmentDto`
 * use `chemicalId` + flattened rating fields. Check each against
 * https://neptune-be-stag.codeswift.org/swagger/v1/swagger.json before wiring
 * it up.
 */

/** Query string shared by every paged HazCom list endpoint. */
export type HazcomPageQueryDto = {
  pageNumber: number;
  pageSize: number;
};

/**
 * Swagger `ChemicalDto` — body for POST /api/hazcom/chemical.
 *
 * Reconciled against the real staging schema
 * (https://neptune-be-stag.codeswift.org/swagger/v1/swagger.json), so the odd
 * spellings below are the backend's own. Two things differ from every other
 * module in this app: the schema is `additionalProperties: false`, and it
 * carries no `subCompanyId`/`userId` — sending them is rejected, so the
 * endpoint must take those from the bearer token.
 */
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
  chemicalName: string;
  manufacturer: string;
  casNumber: string;
  hazardClass: string;
  /** "Danger" | "Warning" */
  signalWord: string;
  pictograms: string[];
  /** ISO date of the revision printed on the sheet. */
  revisedOn: string;
  version: string;
  /** "Compliant" | "Due Soon" | "Overdue" */
  status: string;
  /** Uploaded document location — Cloudinary URL elsewhere in this app. */
  fileUrl: string;
  fileName: string;
  hazardHCodeIds?: number[];
  precautionaryCodeIds?: number[];
  subCompanyId: number;
  userId: number;
};

/** Swagger `HazardHCodeDto` — body for POST /api/hazcom/hazard-hcode. */
export type HazardHCodeRequestDto = {
  id?: number;
  /** GHS hazard statement code, e.g. "H314". */
  code: string;
  statement: string;
};

/** Swagger `PrecautionaryCodeDto` — body for POST /api/hazcom/precautionary-code. */
export type PrecautionaryCodeRequestDto = {
  id?: number;
  /** GHS precautionary statement code, e.g. "P260". */
  code: string;
  statement: string;
};

/** Swagger `TrainingLogDto` — body for POST /api/hazcom/training. */
export type TrainingLogRequestDto = {
  id?: number;
  /** ISO date the session runs. */
  date: string;
  /** "TBD" while the session is only scheduled. */
  trainer: string;
  topic: string;
  /** Chemicals covered — names today, likely ids server-side. */
  chemicals: string[];
  attendees: number;
  /** "Completed" | "Scheduled" */
  status: string;
  materialsLink: string | null;
  notes: string;
  subCompanyId: number;
  userId: number;
};

/**
 * Swagger `UpdateTrainingLogDto` — body for PUT /api/hazcom/training/{id}.
 * Distinct from the create DTO in the spec, so it is modelled separately
 * rather than aliased; the id travels in the path.
 */
export type UpdateTrainingLogRequestDto = {
  date: string;
  trainer: string;
  topic: string;
  chemicals: string[];
  attendees: number;
  status: string;
  materialsLink: string | null;
  notes: string;
};

/** The four 0-4 GHS/NFPA-style ratings the assessment form collects. */
export type ChemicalHazardRatingsDto = {
  health: number;
  flammability: number;
  reactivity: number;
  ppeIndex: number;
};

/**
 * Swagger `ChemicalRiskAssessmentDto` — body for both
 * POST /api/hazcom/risk-assessment and PUT /api/hazcom/risk-assessment/{id}.
 */
export type ChemicalRiskAssessmentRequestDto = {
  id?: number;
  /** Chemical name as picked in the form; may be an id server-side. */
  chemical: string;
  exposureScenario: string;
  exposureMinutes: number;
  /** "Daily" | "Weekly" | … */
  frequency: string;
  ratings: ChemicalHazardRatingsDto;
  /** Derived from the ratings sum — see `hazcomRiskLevel`. */
  riskLevel: string;
  /** "Approved" | "Pending" | "Draft" */
  status: string;
  reviewer: string;
  /** ISO date of the assessment. */
  date: string;
  ppe: string[];
  controls: string;
  subCompanyId: number;
  userId: number;
};
