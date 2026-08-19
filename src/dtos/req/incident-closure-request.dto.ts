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
};

/** @deprecated Use SaveIncidentClosureDto */
export type UpdateIncidentClosureRequestDto = SaveIncidentClosureDto;
