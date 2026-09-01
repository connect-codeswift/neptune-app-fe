import type { SaveIncidentDraftRequestDto } from "@/dtos/req/incident-draft-request.dto";
import type {
  IncidentDraftDto,
  IncidentDraftSummaryDto,
} from "@/dtos/res/incident-draft-response.dto";
import http from "@/lib/axios";

const DRAFTS_PATH = "/incidents/drafts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Unwraps the Neptune envelope, `{ isError, dataModel, statusCode, success, message }`.
 *
 * <p>Reads `dataModel` and tolerates an already-unwrapped body. This is the one
 * shape every endpoint in this API returns, and reading `data` instead is what
 * made saved closure drafts come back blank for a fortnight, so it is spelled
 * out here rather than assumed.</p>
 */
function unwrap(body: unknown): unknown {
  if (!isRecord(body)) return body;

  if ("dataModel" in body) return body.dataModel;
  if ("DataModel" in body) return body.DataModel;

  return body;
}

function asDraftSummary(value: unknown): IncidentDraftSummaryDto | null {
  if (!isRecord(value)) return null;

  const id = typeof value.id === "string" ? value.id : null;
  if (!id) return null;

  return {
    id,
    title: typeof value.title === "string" ? value.title : null,
    currentStep: typeof value.currentStep === "number" ? value.currentStep : 1,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
  };
}

/** GET /api/v1/incidents/drafts */
export async function getIncidentDrafts(): Promise<IncidentDraftSummaryDto[]> {
  const { data } = await http.get<unknown>(DRAFTS_PATH);
  const rows = unwrap(data);

  if (!Array.isArray(rows)) return [];

  // Rows that do not parse are dropped rather than faked into existence: a
  // drafts list is only useful if every entry in it can actually be opened.
  return rows
    .map(asDraftSummary)
    .filter((row): row is IncidentDraftSummaryDto => row !== null);
}

/** GET /api/v1/incidents/drafts/{draftId} */
export async function getIncidentDraft(
  draftId: string,
): Promise<IncidentDraftDto | null> {
  const { data } = await http.get<unknown>(
    `${DRAFTS_PATH}/${encodeURIComponent(draftId)}`,
  );
  const body = unwrap(data);
  const summary = asDraftSummary(body);

  if (!summary || !isRecord(body)) return null;

  return {
    ...summary,
    payloadVersion:
      typeof body.payloadVersion === "number" ? body.payloadVersion : 0,
    payload: body.payload,
  };
}

/** PUT /api/v1/incidents/drafts/{draftId} — creates or overwrites. */
export async function saveIncidentDraft(
  draftId: string,
  payload: SaveIncidentDraftRequestDto,
): Promise<IncidentDraftSummaryDto | null> {
  const { data } = await http.put<unknown>(
    `${DRAFTS_PATH}/${encodeURIComponent(draftId)}`,
    payload,
  );

  return asDraftSummary(unwrap(data));
}

/** DELETE /api/v1/incidents/drafts/{draftId} */
export async function deleteIncidentDraft(draftId: string): Promise<void> {
  await http.delete<unknown>(`${DRAFTS_PATH}/${encodeURIComponent(draftId)}`);
}
