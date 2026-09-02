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
  id?: number | string | null;
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
  /**
   * The wizard's own lifecycle: `true` while the closure is still being filled
   * in, `false` once `/closure/submit` finalises it. Paired with `closedAt`
   * this is what "Closed" actually means — the API sends no status string.
   */
  isDraft?: boolean | null;
  /** When the draft was last written — drives the "saved X ago" line on step 1. */
  updatedAt?: string | null;
  closedAt?: string | null;
  closedBy?: string | null;
  closedByRole?: string | null;
  /**
   * What the API actually sends. `IncidentClosureResponseDto` on the backend exposes
   * `ClosedByUserName` / `ClosedByRoleName`, which camel-case to these — the shorter
   * `closedBy` / `closedByRole` above were never on the wire, so the signature block
   * read "Not recorded" on every genuinely closed incident.
   */
  closedByUserName?: string | null;
  closedByRoleName?: string | null;
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
  primaryRootCauseCategoryName?: string | null;
  contributingFactorTags?: string[] | null;
  rootCauseDescription?: string | null;
  attestationConfirmed?: boolean | null;
  primaryRootCause?: string | null;
  contributingFactors?: string[] | null;
  equipmentProceduresNote?: string | null;
  actionsTaken?: string | null;
  preventiveActionSummary?: string | null;
  closureLinkedCapas?: ClosureLinkedCapaItemDto[] | null;
  /**
   * The wire name for the same list. The backend reads these live off `Capa.IncidentId`
   * and returns them as `LinkedCapas`; nothing has ever sent `closureLinkedCapas`, so
   * the wizard's LINKED CAPAS panel silently showed local fallback data instead of the
   * incident's real CAPAs.
   */
  linkedCapas?: ClosureLinkedCapaItemDto[] | null;
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
