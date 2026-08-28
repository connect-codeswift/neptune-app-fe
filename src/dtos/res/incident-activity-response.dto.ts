/**
 * One entry in an incident's history.
 *
 * GET /api/v1/incidents/{incidentId}/activity — `Incident.View`.
 *
 * The log is append-only and written at the moment of the change, which is what makes its
 * timestamps real. The timeline used to be synthesised on the client from the incident's own
 * fields, so every entry carried the report time and "incident closed" claimed the moment the
 * report was filed.
 */
export type IncidentActivityDto = {
  id?: number | null;
  eventType?: string | null;
  /** Field names an edit touched, or the closure type. Never field values. */
  detail?: string | null;
  userId?: number | null;
  userName?: string | null;
  /** UTC instant the thing actually happened. */
  createdAt?: string | null;
};
