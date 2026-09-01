/** PUT /api/v1/incidents/drafts/{id} — creates or overwrites in one call. */
export type SaveIncidentDraftRequestDto = Readonly<{
  /** Shown in the drafts list. Null when the reporter has not titled it yet. */
  title: string | null;
  /** Where to reopen the wizard. The server clamps this to the wizard's range. */
  currentStep: number;
  payloadVersion: number;
  /** The whole wizard state. Must serialize to a json object. */
  payload: Record<string, unknown>;
}>;
