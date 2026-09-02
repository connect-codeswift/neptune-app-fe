/** Request body for PUT /api/v1/incidents/{incidentId}/closure (`SaveIncidentClosureDto`). */
export type SaveIncidentClosureDto = {
  finalIncidentType?: string | null;
  sifClassification?: string | null;
  daysAwayFromWork?: number | null;
  daysOnRestrictedDuty?: number | null;
  isOshaRecordable?: boolean | null;
  primaryRootCauseCategoryId?: number | null;
  contributingFactorTags?: string[] | null;
  rootCauseDescription?: string | null;
  actionsTaken?: string | null;
  attestationConfirmed?: boolean | null;
  /**
   * The step the closer was on when they saved, so the draft reopens there.
   * Omit to leave the stored position alone — a step that saves without moving
   * must not reset the draft to step 1.
   */
  currentStep?: number | null;
};

/** @deprecated Use SaveIncidentClosureDto */
export type UpdateIncidentClosureRequestDto = SaveIncidentClosureDto;
