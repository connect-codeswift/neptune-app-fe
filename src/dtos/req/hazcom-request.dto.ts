/**
 * Request bodies for the HazCom endpoints in `api/hazcom.md`.
 *
 * IMPORTANT — the spec file lists only paths; every `$ref` in it points at
 * `#/components/schemas/…`, and that section was not included. The field sets
 * below are therefore inferred from what the HazCom UI already collects
 * (`components/hazcom/shared/hazcom-types.ts`) plus the conventions the other
 * modules follow (numeric ids, `subCompanyId`/`userId` on writes). Reconcile
 * each type against the real Swagger schema before wiring anything up.
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
  name: string;
  casNumber: string;
  location: string;
  /** UI keeps this as one string ("15 Liters"); may be split server-side. */
  quantity: string;
  hazardClass: string;
  pictograms: string[];
  /** "Danger" | "Warning" */
  signalWord: string;
  /** "Active" | "Inactive" */
  status: string;
  storageNotes: string;
  /** Links the chemical to a row from /api/hazcom/sds. */
  sdsId?: number | null;
  hazardHCodeIds?: number[];
  precautionaryCodeIds?: number[];
  /** Drives the /drafts vs /published split. */
  isDraft: boolean;
  subCompanyId: number;
  userId: number;
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
