export type PersonDto = {
  name?: string | null;
  role?: string | null;
  injuryLevel?: string | null;
  bodyPartAffected?: string | null;
  injuryDescription?: string | null;
  /**
   * Lost and restricted days for this person. Null means not recorded, which is not the
   * same as zero — zero days away is a real answer about someone who stayed at work, so
   * the two must not be collapsed on the way in.
   */
  daysAwayFromWork?: number | null;
  daysOnRestrictedDuty?: number | null;
  /**
   * This person's own account. Required for a witness on create — a witness has to be
   * someone in the system, not a free-typed name. Null on records predating that rule.
   */
  userId?: number | null;
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
  /**
   * First Aid medical question ("Case closed - no further actions",
   * "Monitor / follow up", …). **Not** a lifecycle field — an incident is only
   * closed when the closure wizard writes an `IncidentClosures` row.
   */
  caseDisposition?: string | null;
  /**
   * The only lifecycle signal the API emits: `New` | `Investigating` |
   * `Corrective` | `Closed`, computed server-side from the closure record and
   * linked CAPAs. Grid rows always carry it; detail only since the backend
   * added it to `IncidentDto`, so treat it as absent rather than "not closed".
   */
  stage?: string | null;
  furtherMedicalRecommendations?: boolean;
  images?: string[] | null;
  people?: PersonDto[] | null;
  actionTaken?: string | null;
  otherNotes?: string | null;
  feedback?: string | null;
  /**
   * Comma-separated names of the fields whose text the reporter accepted from
   * an AI draft, e.g. "description,injuryDescription". Backend caps at 200
   * characters and records it verbatim rather than inferring it.
   */
  aiAssistedFields?: string | null;
};

export type GetAllIncidentsResponseDto = {
  items: IncidentDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
};
