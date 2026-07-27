/** Request body for PUT /api/Incident/{incidentId}/closure */
export type UpdateIncidentClosureRequestDto = {
  finalIncidentType?: string;
  sifClassification?: string;
  daysAwayFromWork?: number;
  daysOnRestrictedDuty?: number;
  isOshaRecordable?: boolean;
  primaryRootCauseCategoryId?: number;
  contributingFactorTags?: string[];
  rootCauseDescription?: string;
  actionsTaken?: string;
  attestationConfirmed?: boolean;

  /** Legacy / extended fields tolerated by backend */
  incidentId?: number;
  closureId?: string;
  currentStep?: number;
  closureStatus?: string;
  closedAt?: string;
  closedBy?: string;
  closedByRole?: string;
  closureDate?: string;
  durationOpen?: string;
  oshaOverrideReason?: string;
  closureStatement?: string;
  lessonsLearned?: string;
  closureNotes?: string;
  rootCauseSummary?: string;
  primaryRootCause?: string;
  contributingFactors?: string[];
  equipmentProceduresNote?: string;
  preventiveActionSummary?: string;
  capasVerified?: boolean;
  mfaSigned?: boolean;
  isEhsConfirmed?: boolean;
  residualRisk?: string;
  approverName?: string;
  approverRole?: string;
  approverInitials?: string;
  isApproved?: boolean;
};
