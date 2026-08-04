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
  furtherMedicalRecommendations?: boolean;
  images?: string[] | null;
  people?: PersonDto[] | null;
  actionTaken?: string | null;
  otherNotes?: string | null;
  feedback?: string | null;
};

export type GetAllIncidentsResponseDto = {
  items: IncidentDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
};
