import type {
  CreateIncidentRequestDto,
  GetAllIncidentsRequestDto,
  UpdateIncidentRequestDto,
} from "@/dtos/req/incident-request.dto";
import { getAuthContext } from "@/lib/auth-context";
import type { SaveIncidentClosureDto } from "@/dtos/req/incident-closure-request.dto";
import type {
  GetAllIncidentsResponseDto,
  IncidentDto,
  PersonDto,
} from "@/dtos/res/incident-response.dto";
import type {
  ClosureChecklistItemDto,
  ClosureLinkedCapaItemDto,
  IncidentClosureResponseDto,
} from "@/dtos/res/incident-closure-response.dto";
import type { IncidentActivityDto } from "@/dtos/res/incident-activity-response.dto";
import http, { getAccessToken } from "@/lib/axios";

const INCIDENT_PATH = "/incidents";
const INCIDENT_SEARCH_PATH = "/incidents/search";

function incidentClosurePath(incidentId: number): string {
  return `${INCIDENT_PATH}/${String(incidentId)}/closure`;
}

function incidentActivityPath(incidentId: number): string {
  return `${INCIDENT_PATH}/${String(incidentId)}/activity`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readProp(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (key in record && record[key] !== undefined) {
      return record[key];
    }
  }
  return undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Math.trunc(parsed);
    }
  }
  return undefined;
}

function asString(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }
  return undefined;
}

function asStringArray(value: unknown): string[] | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (!Array.isArray(value)) {
    return undefined;
  }
  return value
    .map((item) => asString(item))
    .filter((item): item is string => typeof item === "string");
}

function asNumberArray(value: unknown): number[] | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (!Array.isArray(value)) {
    return undefined;
  }
  return value
    .map((item) => asNumber(item))
    .filter((item): item is number => typeof item === "number");
}

function coercePerson(value: unknown): PersonDto | null {
  if (!isRecord(value)) {
    return null;
  }
  return {
    name: asString(readProp(value, "name", "Name")) ?? null,
    role: asString(readProp(value, "role", "Role")) ?? null,
    injuryLevel:
      asString(readProp(value, "injuryLevel", "InjuryLevel")) ?? null,
    bodyPartAffected:
      asString(readProp(value, "bodyPartAffected", "BodyPartAffected")) ?? null,
    injuryDescription:
      asString(readProp(value, "injuryDescription", "InjuryDescription")) ??
      null,
  };
}

/**
 * Some grid endpoints wrap the incident DTO and attach the computed lifecycle
 * fields at the row level. Merge those onto the nested incident before
 * coercion, otherwise the row-level `stage` is lost and the UI has nothing left
 * to derive Open/Closed from.
 */
function unwrapIncidentRaw(
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const nested = readProp(raw, "incident", "Incident");
  if (!isRecord(nested)) {
    return raw;
  }

  const merged: Record<string, unknown> = { ...nested };
  for (const [camel, pascal] of [
    ["stage", "Stage"],
    ["caseDisposition", "CaseDisposition"],
  ] as const) {
    const topLevel = readProp(raw, camel, pascal);
    if (topLevel !== undefined && topLevel !== null) {
      merged[camel] = topLevel;
    }
  }

  return merged;
}

/**
 * Maps API payload (camelCase or PascalCase) into the FE IncidentDto shape.
 */
function coerceIncidentDto(raw: Record<string, unknown>): IncidentDto {
  const source = unwrapIncidentRaw(raw);
  const peopleRaw = readProp(source, "people", "People");
  const people = Array.isArray(peopleRaw)
    ? peopleRaw
        .map(coercePerson)
        .filter((person): person is PersonDto => person != null)
    : null;

  const fitRaw = readProp(source, "isFitForFullDuty", "IsFitForFullDuty");

  return {
    id: asNumber(readProp(source, "id", "Id")),
    title: asString(readProp(source, "title", "Title")) ?? null,
    severity: asString(readProp(source, "severity", "Severity")) ?? null,
    site: asString(readProp(source, "site", "Site")) ?? null,
    location: asString(readProp(source, "location", "Location")) ?? null,
    description:
      asString(readProp(source, "description", "Description")) ?? null,
    isDrop: asBoolean(readProp(source, "isDrop", "IsDrop")) ?? null,
    incidentAt: asString(readProp(source, "incidentAt", "IncidentAt")) ?? null,
    incidentReportedAt:
      asString(readProp(source, "incidentReportedAt", "IncidentReportedAt")) ??
      null,
    isOSHARecordable: asBoolean(
      readProp(source, "isOSHARecordable", "IsOSHARecordable"),
    ),
    isWorkRelated: asBoolean(
      readProp(source, "isWorkRelated", "IsWorkRelated"),
    ),
    isDrugOrAlcoholRelated: asBoolean(
      readProp(source, "isDrugOrAlcoholRelated", "IsDrugOrAlcoholRelated"),
    ),
    isFleetVehicleInvolved: asBoolean(
      readProp(source, "isFleetVehicleInvolved", "IsFleetVehicleInvolved"),
    ),
    isSeriousIncident: asBoolean(
      readProp(source, "isSeriousIncident", "IsSeriousIncident"),
    ),
    isEmergencyServiceCalled: asBoolean(
      readProp(source, "isEmergencyServiceCalled", "IsEmergencyServiceCalled"),
    ),
    isThirdPartyInvolved: asBoolean(
      readProp(source, "isThirdPartyInvolved", "IsThirdPartyInvolved"),
    ),
    initialTreatment:
      asString(readProp(source, "initialTreatment", "InitialTreatment")) ??
      null,
    isSecondaryTreatmentSought: asBoolean(
      readProp(
        source,
        "isSecondaryTreatmentSought",
        "IsSecondaryTreatmentSought",
      ),
    ),
    mechanismOfInjury:
      asString(readProp(source, "mechanismOfInjury", "MechanismOfInjury")) ??
      null,
    natureOfInjury:
      asString(readProp(source, "natureOfInjury", "NatureOfInjury")) ?? null,
    objectInvolved:
      asString(readProp(source, "objectInvolved", "ObjectInvolved")) ?? null,
    isOSHANotificationRequired: asBoolean(
      readProp(
        source,
        "isOSHANotificationRequired",
        "IsOSHANotificationRequired",
      ),
    ),
    affectedPersonId:
      asString(readProp(source, "affectedPersonId", "AffectedPersonId")) ??
      null,
    reportedById: asNumber(readProp(source, "reportedById", "ReportedById")),
    userId: asNumber(readProp(source, "userId", "UserId")),
    siteId:
      asNumber(readProp(source, "siteId", "SiteId")) ??
      asNumber(readProp(source, "subCompanyId", "SubCompanyId")),
    injuredBodyPart:
      asString(readProp(source, "injuredBodyPart", "InjuredBodyPart")) ?? null,
    injuryDescription:
      asString(readProp(source, "injuryDescription", "InjuryDescription")) ??
      null,
    incidentReporterEmail:
      asString(
        readProp(source, "incidentReporterEmail", "IncidentReporterEmail"),
      ) ?? null,
    occurredInCanada: asBoolean(
      readProp(source, "occurredInCanada", "OccurredInCanada"),
    ),
    nonEmployeInvolved: asBoolean(
      readProp(source, "nonEmployeInvolved", "NonEmployeInvolved"),
    ),
    whatTreatmentWasGiven:
      asString(
        readProp(source, "whatTreatmentWasGiven", "WhatTreatmentWasGiven"),
      ) ?? null,
    treatmentProvidedBy:
      asString(
        readProp(source, "treatmentProvidedBy", "TreatmentProvidedBy"),
      ) ?? null,
    treatmentLocation:
      asString(readProp(source, "treatmentLocation", "TreatmentLocation")) ??
      null,
    isFitForFullDuty:
      typeof fitRaw === "boolean" || typeof fitRaw === "string"
        ? fitRaw
        : (asString(fitRaw) ?? null),
    caseDisposition:
      asString(readProp(source, "caseDisposition", "CaseDisposition")) ?? null,
    stage: asString(readProp(source, "stage", "Stage")) ?? null,
    furtherMedicalRecommendations: asBoolean(
      readProp(
        source,
        "furtherMedicalRecommendations",
        "FurtherMedicalRecommendations",
      ),
    ),
    images: asStringArray(readProp(source, "images", "Images")) ?? null,
    people,
    actionTaken:
      asString(readProp(source, "actionTaken", "ActionTaken")) ?? null,
    otherNotes: asString(readProp(source, "otherNotes", "OtherNotes")) ?? null,
    feedback: asString(readProp(source, "feedback", "Feedback")) ?? null,
  };
}

function asIncidentArray(value: unknown): IncidentDto[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .filter((item) => hasIncidentId(item))
    .map((item) => coerceIncidentDto(item));
}

function hasIncidentId(value: Record<string, unknown>): boolean {
  return asNumber(readProp(value, "id", "Id")) != null;
}

function normalizeIncidentDto(data: unknown): IncidentDto | null {
  if (isRecord(data) && hasIncidentId(data)) {
    return coerceIncidentDto(data);
  }

  if (!isRecord(data)) {
    return null;
  }

  const candidates = [
    data.dataModel,
    data.DataModel,
    data.data,
    data.Data,
    data.result,
    data.Result,
  ];

  for (const candidate of candidates) {
    if (isRecord(candidate) && hasIncidentId(candidate)) {
      return coerceIncidentDto(candidate);
    }
  }

  return null;
}

function normalizeGetAllIncidentsResponse(
  data: unknown,
  request: GetAllIncidentsRequestDto,
): GetAllIncidentsResponseDto {
  if (Array.isArray(data)) {
    const items = asIncidentArray(data);
    return {
      items,
      totalCount: items.length,
      pageNumber: request.pageNumber,
      pageSize: request.pageSize,
    };
  }

  if (!isRecord(data)) {
    return {
      items: [],
      totalCount: 0,
      pageNumber: request.pageNumber,
      pageSize: request.pageSize,
    };
  }

  // Neptune wrapper: `{ dataModel: { data: IncidentDto[], totalRecords, pageNumber, pageSize } }`
  const dataModel = isRecord(data.dataModel)
    ? data.dataModel
    : isRecord(data.DataModel)
      ? data.DataModel
      : null;
  const nestedData = isRecord(data.data) ? data.data : null;
  const page = dataModel ?? nestedData;

  const items = asIncidentArray(
    (page && (page.data ?? page.Data ?? page.items ?? page.Items)) ??
      data.items ??
      data.Items ??
      data.data ??
      data.result ??
      data.Result ??
      data.incidents ??
      data.Records,
  );

  const totalCountRaw =
    (page &&
      (page.totalRecords ??
        page.TotalRecords ??
        page.totalCount ??
        page.TotalCount ??
        page.total ??
        page.count)) ??
    data.totalCount ??
    data.TotalCount ??
    data.total ??
    data.count;
  const totalCount =
    typeof totalCountRaw === "number" && Number.isFinite(totalCountRaw)
      ? totalCountRaw
      : items.length;

  const pageNumberRaw =
    (page && (page.pageNumber ?? page.PageNumber)) ??
    data.pageNumber ??
    data.PageNumber;
  const pageSizeRaw =
    (page && (page.pageSize ?? page.PageSize)) ??
    data.pageSize ??
    data.PageSize;

  return {
    items,
    totalCount,
    pageNumber:
      typeof pageNumberRaw === "number" ? pageNumberRaw : request.pageNumber,
    pageSize: typeof pageSizeRaw === "number" ? pageSizeRaw : request.pageSize,
  };
}

export async function getAllIncidents(request: GetAllIncidentsRequestDto) {
  const { pageNumber, pageSize } = request;
  const search = request.search?.trim();
  const severity = request.severity?.trim();
  const site = request.site?.trim();

  const body: GetAllIncidentsRequestDto = {
    pageNumber,
    pageSize,
    ...(search ? { search } : {}),
    ...(severity ? { severity } : {}),
    ...(site ? { site } : {}),
  };

  const { data } = await http.post<unknown>(INCIDENT_SEARCH_PATH, body);
  return normalizeGetAllIncidentsResponse(data, request);
}

/**
 * GET /api/v1/incidents/{id}
 * The id used to be a query string (`GetIncidentById?id=`); the v1 rename made
 * it a path segment. Tenant scope is still read from the JWT.
 * Header: `Authorization: Bearer <token>` (required by API security)
 *
 * Requires Incident.View (was Incident.Update), so view-only users can open
 * detail now.
 *
 * A missing or cross-tenant incident is a 404 here, not the old 400.
 */
export async function getIncidentById(params: Readonly<{ id: number }>) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to load this incident.");
  }

  const { data } = await http.get<unknown>(
    `${INCIDENT_PATH}/${String(params.id)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return normalizeIncidentDto(data);
}

/**
 * POST /api/v1/incidents
 *
 * Returns `{ dataModel: { id } }` — the id is real now, where it used to be
 * `""`. Only the id is populated; callers wanting the whole record re-fetch.
 */
export async function createIncident(payload: CreateIncidentRequestDto) {
  const { data } = await http.post<unknown>(INCIDENT_PATH, payload);
  return (
    normalizeIncidentDto(data) ?? (isRecord(data) ? (data as IncidentDto) : {})
  );
}

/**
 * Strips tenant context off a record on its way into a write payload.
 *
 * Needed because the spread that builds an update payload is not excess-
 * property-checked — `Omit<IncidentDto, "siteId" | "userId">` catches a
 * literal that names them, but not a `...existing` that carries them along
 * from a GET, which still returns both for display.
 */
function withoutTenantFields<T extends Partial<IncidentDto>>(
  value: T,
): Omit<T, "siteId" | "userId"> {
  const next: Record<string, unknown> = { ...value };
  delete next.siteId;
  delete next.userId;
  return next as Omit<T, "siteId" | "userId">;
}

/**
 * Incident columns the database declares NOT NULL.
 *
 * `Incident` on the backend declares every string non-nullable except `Title`
 * and `AiAssistedFields`. The update assigns each one straight onto the tracked
 * entity, so a JSON `null` reaches `SaveChangesAsync` and fails the whole write
 * with "An error occurred while saving the entity changes" — a message that
 * names no field and travels without the inner exception, so the save simply
 * looked broken from here.
 *
 * Kept beside the write rather than in one mapper because all three edit scopes
 * and any future one share the same PUT: a cleared field has to travel as `""`
 * whichever screen cleared it.
 */
const INCIDENT_NOT_NULL_TEXT_FIELDS = [
  "severity",
  "site",
  "location",
  "description",
  "initialTreatment",
  "mechanismOfInjury",
  "natureOfInjury",
  "objectInvolved",
  "affectedPersonId",
  "injuredBodyPart",
  "injuryDescription",
  "incidentReporterEmail",
  "whatTreatmentWasGiven",
  "treatmentProvidedBy",
  "treatmentLocation",
  "isFitForFullDuty",
  "caseDisposition",
] as const;

function withNotNullText<T extends Record<string, unknown>>(payload: T): T {
  const next: Record<string, unknown> = { ...payload };

  for (const field of INCIDENT_NOT_NULL_TEXT_FIELDS) {
    if (next[field] === null || next[field] === undefined) {
      next[field] = "";
    }
  }

  return next as T;
}

/**
 * PUT /api/v1/incidents/{id}
 * Body: incident fields minus tenant context — the server stamps siteId and
 * userId from the JWT.
 * Header: `Authorization: Bearer <token>` (required by API security)
 *
 * Responds with `{ dataModel: { id } }` only, so the merged body is what we
 * hand back for the shape; callers needing the saved record re-fetch.
 */
async function updateIncidentById(
  id: number,
  payload: UpdateIncidentRequestDto,
) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to update this incident.");
  }

  const body: UpdateIncidentRequestDto = {
    ...payload,
    id,
  };

  const { data } = await http.put<unknown>(
    `${INCIDENT_PATH}/${String(id)}`,
    body,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return (
    normalizeIncidentDto(data) ??
    (isRecord(data) ? (data as IncidentDto) : body)
  );
}

/**
 * Loads the current incident, merges `patch`, then PUT /api/v1/incidents/{id}.
 *
 * The read-back is what makes `siteId`/`userId` worth stripping explicitly:
 * GET still *returns* them for display, so a naive spread of the existing
 * record would put tenant fields straight back on the write.
 */
export async function updateIncident(id: number, patch: Partial<IncidentDto>) {
  const existing = await getIncidentById({ id });

  const payload: UpdateIncidentRequestDto = withNotNullText({
    ...withoutTenantFields(existing ?? {}),
    ...withoutTenantFields(patch),
    id,
    // Last-resort fallback is the signed-in user, as before — it just comes
    // from the JWT now instead of a threaded context argument.
    reportedById:
      patch.reportedById ?? existing?.reportedById ?? getAuthContext()?.userId,
    isDrop: false,
  });

  return updateIncidentById(id, payload);
}

export async function submitIncidentClosure(
  incidentId: number,
): Promise<IncidentClosureResponseDto | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to submit incident closure.");
  }

  const { data } = await http.post<unknown>(
    `${incidentClosurePath(incidentId)}/submit`,
    null,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return normalizeIncidentClosureDto(data);
}

/** @deprecated Prefer submitIncidentClosure — closes via POST /closure/submit. */
function coerceChecklistItemDto(
  value: unknown,
): ClosureChecklistItemDto | null {
  if (!isRecord(value)) return null;
  return {
    id: asString(readProp(value, "id", "Id")) ?? undefined,
    label: asString(readProp(value, "label", "Label")) ?? undefined,
    completed:
      asBoolean(readProp(value, "completed", "Completed")) ?? undefined,
    required: asBoolean(readProp(value, "required", "Required")) ?? undefined,
    completedAt:
      asString(readProp(value, "completedAt", "CompletedAt")) ?? undefined,
    completedBy:
      asString(readProp(value, "completedBy", "CompletedBy")) ?? undefined,
  };
}

function coerceLinkedCapaDto(value: unknown): ClosureLinkedCapaItemDto | null {
  if (!isRecord(value)) return null;
  return {
    id: asString(readProp(value, "id", "Id")) ?? undefined,
    title: asString(readProp(value, "title", "Title")) ?? undefined,
    subtitle: asString(readProp(value, "subtitle", "Subtitle")) ?? undefined,
    progressPercent:
      asNumber(readProp(value, "progressPercent", "ProgressPercent")) ??
      undefined,
    status: asString(readProp(value, "status", "Status")) ?? undefined,
  };
}

/**
 * Coerces and normalizes response from GET /api/v1/incidents/{incidentId}/closure
 */
function normalizeIncidentClosureDto(
  data: unknown,
): IncidentClosureResponseDto | null {
  if (!isRecord(data)) {
    return null;
  }
  // Neptune wraps every response as `{ dataModel: ... }`, so that is what has to be
  // unwrapped here. This read `data.data`, which the envelope never carries: the whole
  // payload fell through to `data` — the envelope itself — where none of the field names
  // resolve, so every value below silently became undefined and the wizard rebuilt itself
  // from defaults. A saved closure draft therefore came back blank, and step 1 refused to
  // advance because the final incident type it had just persisted read as unset.
  //
  // `data` is still accepted last so a caller that hands over an already-unwrapped record
  // keeps working, and the PascalCase spelling is tolerated like everywhere else here.
  const root = isRecord(data.dataModel)
    ? data.dataModel
    : isRecord(data.DataModel)
      ? data.DataModel
      : isRecord(data.data)
        ? data.data
        : data;

  const rawChecklist = readProp(
    root,
    "verificationChecklist",
    "VerificationChecklist",
  );
  const verificationChecklist = Array.isArray(rawChecklist)
    ? rawChecklist
        .map(coerceChecklistItemDto)
        .filter((item): item is ClosureChecklistItemDto => item !== null)
    : undefined;

  const rawCapas = readProp(root, "closureLinkedCapas", "ClosureLinkedCapas");
  const closureLinkedCapas = Array.isArray(rawCapas)
    ? rawCapas
        .map(coerceLinkedCapaDto)
        .filter((item): item is ClosureLinkedCapaItemDto => item !== null)
    : undefined;

  return {
    id:
      asNumber(readProp(root, "id", "Id")) ??
      asString(readProp(root, "id", "Id")) ??
      undefined,
    closureId: asString(readProp(root, "closureId", "ClosureId")) ?? undefined,
    incidentId:
      asNumber(readProp(root, "incidentId", "IncidentId")) ?? undefined,
    currentStep:
      asNumber(readProp(root, "currentStep", "CurrentStep")) ?? undefined,
    isDraft: asBoolean(readProp(root, "isDraft", "IsDraft")) ?? undefined,
    closedAt: asString(readProp(root, "closedAt", "ClosedAt")) ?? undefined,
    closedBy: asString(readProp(root, "closedBy", "ClosedBy")) ?? undefined,
    closedByRole:
      asString(readProp(root, "closedByRole", "ClosedByRole")) ?? undefined,
    closureDate:
      asString(readProp(root, "closureDate", "ClosureDate")) ?? undefined,
    durationOpen:
      asString(readProp(root, "durationOpen", "DurationOpen")) ?? undefined,
    finalIncidentType:
      asString(readProp(root, "finalIncidentType", "FinalIncidentType")) ??
      undefined,
    sifClassification:
      asString(readProp(root, "sifClassification", "SifClassification")) ??
      undefined,
    daysAwayFromWork:
      asNumber(readProp(root, "daysAwayFromWork", "DaysAwayFromWork")) ??
      undefined,
    daysOnRestrictedDuty:
      asNumber(
        readProp(root, "daysOnRestrictedDuty", "DaysOnRestrictedDuty"),
      ) ?? undefined,
    isOshaRecordable:
      asBoolean(readProp(root, "isOshaRecordable", "IsOshaRecordable")) ??
      undefined,
    isOSHARecordable:
      asBoolean(readProp(root, "isOSHARecordable", "IsOSHARecordable")) ??
      undefined,
    oshaOverrideReason:
      asString(readProp(root, "oshaOverrideReason", "OshaOverrideReason")) ??
      undefined,
    closureStatement:
      asString(readProp(root, "closureStatement", "ClosureStatement")) ??
      undefined,
    lessonsLearned:
      asString(readProp(root, "lessonsLearned", "LessonsLearned")) ?? undefined,
    closureNotes:
      asString(readProp(root, "closureNotes", "ClosureNotes")) ?? undefined,
    rootCauseSummary:
      asString(readProp(root, "rootCauseSummary", "RootCauseSummary")) ??
      undefined,
    rootCauseDescription:
      asString(
        readProp(root, "rootCauseDescription", "RootCauseDescription"),
      ) ?? undefined,
    primaryRootCauseCategoryId:
      asNumber(
        readProp(
          root,
          "primaryRootCauseCategoryId",
          "PrimaryRootCauseCategoryId",
        ),
      ) ?? undefined,
    primaryRootCauseCategoryIds:
      asNumberArray(
        readProp(
          root,
          "primaryRootCauseCategoryIds",
          "PrimaryRootCauseCategoryIds",
        ),
      ) ?? undefined,
    primaryRootCause:
      asString(readProp(root, "primaryRootCause", "PrimaryRootCause")) ??
      undefined,
    contributingFactorTags:
      asStringArray(
        readProp(root, "contributingFactorTags", "ContributingFactorTags"),
      ) ?? undefined,
    contributingFactors:
      asStringArray(
        readProp(root, "contributingFactors", "ContributingFactors"),
      ) ?? undefined,
    attestationConfirmed:
      asBoolean(
        readProp(root, "attestationConfirmed", "AttestationConfirmed"),
      ) ?? undefined,
    equipmentProceduresNote:
      asString(
        readProp(root, "equipmentProceduresNote", "EquipmentProceduresNote"),
      ) ?? undefined,
    actionsTaken:
      asString(readProp(root, "actionsTaken", "ActionsTaken")) ?? undefined,
    preventiveActionSummary:
      asString(
        readProp(root, "preventiveActionSummary", "PreventiveActionSummary"),
      ) ?? undefined,
    closureLinkedCapas,
    capasVerified:
      asBoolean(readProp(root, "capasVerified", "CapasVerified")) ?? undefined,
    mfaSigned: asBoolean(readProp(root, "mfaSigned", "MfaSigned")) ?? undefined,
    isEhsConfirmed:
      asBoolean(readProp(root, "isEhsConfirmed", "IsEhsConfirmed")) ??
      undefined,
    residualRisk:
      asString(readProp(root, "residualRisk", "ResidualRisk")) ?? undefined,
    verificationChecklist,
    approverName:
      asString(readProp(root, "approverName", "ApproverName")) ?? undefined,
    approverRole:
      asString(readProp(root, "approverRole", "ApproverRole")) ?? undefined,
    approverInitials:
      asString(readProp(root, "approverInitials", "ApproverInitials")) ??
      undefined,
    isApproved:
      asBoolean(readProp(root, "isApproved", "IsApproved")) ?? undefined,
  };
}

/**
 * GET /api/v1/incidents/{incidentId}/closure
 * Header: `Authorization: Bearer <token>`
 */
export async function getIncidentClosure(
  incidentId: number,
): Promise<IncidentClosureResponseDto | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to load incident closure details.");
  }

  const { data } = await http.get<unknown>(incidentClosurePath(incidentId), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return normalizeIncidentClosureDto(data);
}

/**
 * GET /api/v1/incidents/{incidentId}/activity
 *
 * An empty list is a real answer: incidents predating the activity log have no rows, and so
 * does one nothing has happened to. Neither is worth inventing entries for.
 */
export async function getIncidentActivity(
  incidentId: number,
): Promise<IncidentActivityDto[]> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to load incident activity.");
  }

  const { data } = await http.get<unknown>(incidentActivityPath(incidentId), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const payload = isRecord(data)
    ? ((data.dataModel ?? data.DataModel) as unknown)
    : data;

  return Array.isArray(payload) ? (payload as IncidentActivityDto[]) : [];
}

/**
 * PUT /api/v1/incidents/{incidentId}/closure
 * Body: UpdateIncidentClosureRequestDto
 * Header: `Authorization: Bearer <token>`
 */
export async function updateIncidentClosure(
  incidentId: number,
  payload: SaveIncidentClosureDto,
): Promise<IncidentClosureResponseDto | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to update incident closure details.");
  }

  const { data } = await http.put<unknown>(
    incidentClosurePath(incidentId),
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return (
    normalizeIncidentClosureDto(data) ??
    (isRecord(data) ? (data as IncidentClosureResponseDto) : null)
  );
}
