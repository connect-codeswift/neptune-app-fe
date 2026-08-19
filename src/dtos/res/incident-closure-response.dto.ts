/** Matches backend DTO shape for GET /api/v1/incidents/{incidentId}/closure */

export type ClosureChecklistItemDto = {
  id?: string | null;
  label?: string | null;
  completed?: boolean | null;
  required?: boolean | null;
  completedAt?: string | null;
  completedBy?: string | null;
};

export type ClosureLinkedCapaItemDto = {
  id?: string | null;
  title?: string | null;
  subtitle?: string | null;
  progressPercent?: number | null;
  status?: string | null;
};

export type IncidentClosureResponseDto = {
  id?: number | string | null;
  closureId?: string | null;
  incidentId?: number | null;
  currentStep?: number | null;
  closureStatus?: string | null;
  closedAt?: string | null;
  closedBy?: string | null;
  closedByRole?: string | null;
  closureDate?: string | null;
  durationOpen?: string | null;
  finalIncidentType?: string | null;
  sifClassification?: string | null;
  daysAwayFromWork?: number | null;
  daysOnRestrictedDuty?: number | null;
  isOshaRecordable?: boolean | null;
  isOSHARecordable?: boolean | null;
  oshaOverrideReason?: string | null;
  closureStatement?: string | null;
  lessonsLearned?: string | null;
  closureNotes?: string | null;
  rootCauseSummary?: string | null;
  primaryRootCauseCategoryId?: number | null;
  primaryRootCauseCategoryIds?: number[] | null;
  contributingFactorTags?: string[] | null;
  rootCauseDescription?: string | null;
  attestationConfirmed?: boolean | null;
  primaryRootCause?: string | null;
  contributingFactors?: string[] | null;
  equipmentProceduresNote?: string | null;
  actionsTaken?: string | null;
  preventiveActionSummary?: string | null;
  closureLinkedCapas?: ClosureLinkedCapaItemDto[] | null;
  capasVerified?: boolean | null;
  mfaSigned?: boolean | null;
  isEhsConfirmed?: boolean | null;
  residualRisk?: string | null;
  verificationChecklist?: ClosureChecklistItemDto[] | null;
  approverName?: string | null;
  approverRole?: string | null;
  approverInitials?: string | null;
  isApproved?: boolean | null;
};
