/** One row of GET /api/v1/incidents/drafts. */
export type IncidentDraftSummaryDto = Readonly<{
  /** Guid handle. Every draft endpoint takes this, never a numeric id. */
  id: string;
  title: string | null;
  currentStep: number;
  updatedAt: string;
}>;

/** GET /api/v1/incidents/drafts/{id} — the whole saved wizard state. */
export type IncidentDraftDto = IncidentDraftSummaryDto &
  Readonly<{
    payloadVersion: number;
    /** The stored form state, as json. Opaque here; see `fromDraftPayload`. */
    payload: unknown;
  }>;
