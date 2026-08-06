export type PersonDto = {
  name?: string | null;
  role?: string | null;
  injuryLevel?: string | null;
  bodyPartAffected?: string | null;
  injuryDescription?: string | null;
};

/** Matches backend `IncidentDto` from GET/POST Incident APIs */
export type IncidentDto = {
  id?: number;
  title?: string | null;
  severity?: string | null;
  site?: string | null;
  location?: string | null;
  description?: string | null;
  isDrop?: boolean | null;
  incidentAt?: string | null;
  incidentReportedAt?: string | null;
  isOSHARecordable?: boolean;
  isWorkRelated?: boolean;
  isDrugOrAlcoholRelated?: boolean;
  isFleetVehicleInvolved?: boolean;
  isSeriousIncident?: boolean;
  isEmergencyServiceCalled?: boolean;
  isThirdPartyInvolved?: boolean;
  initialTreatment?: string | null;
  isSecondaryTreatmentSought?: boolean;
  mechanismOfInjury?: string | null;
  natureOfInjury?: string | null;
  objectInvolved?: string | null;
  isOSHANotificationRequired?: boolean;
  affectedPersonId?: string | null;
  reportedById?: number;
  userId?: number;
  siteId?: number;
  injuredBodyPart?: string | null;
  injuryDescription?: string | null;
  incidentReporterEmail?: string | null;
  occurredInCanada?: boolean;
  nonEmployeInvolved?: boolean;
  whatTreatmentWasGiven?: string | null;
  treatmentProvidedBy?: string | null;
  treatmentLocation?: string | null;
  isFitForFullDuty?: string | boolean | null;
  caseDisposition?: string | null;
  /** Some list/detail payloads expose lifecycle directly (near-miss style). */
  status?: string | null;
  /** Grid rows may expose Open/Closed as `state`. */
  state?: string | null;
  /** Present when closure summary is included on the incident payload. */
  closureStatus?: string | null;
  isClosed?: boolean | null;
  furtherMedicalRecommendations?: boolean;
  images?: string[] | null;
  people?: PersonDto[] | null;
  actionTaken?: string | null;
  otherNotes?: string | null;
  feedback?: string | null;
  /**
   * Follow-up actions from the Immediate Response step, AI-suggested or typed
   * by the reporter. Replaces concatenating option ids into `otherNotes`.
   */
  followUps?: IncidentFollowUpDto[] | null;
  /**
   * Comma-separated names of the fields whose text the reporter accepted from
   * an AI draft, e.g. "description,injuryDescription". Backend caps at 200
   * characters and records it verbatim rather than inferring it.
   */
  aiAssistedFields?: string | null;
};

/**
 * One follow-up action as submitted with the incident.
 *
 * Unselected items are sent too: "the assistant proposed this and a human
 * declined it" is a question an auditor can legitimately ask, and it is only
 * answerable if the declined ones are stored alongside the accepted ones.
 */
export type IncidentFollowUpDto = {
  /** Max 500 characters; blank entries are dropped server-side. */
  text: string;
  isAiSuggested: boolean;
  isSelected: boolean;
};

export type GetAllIncidentsResponseDto = {
  items: IncidentDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
};
