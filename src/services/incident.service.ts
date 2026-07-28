import type {
  CreateIncidentRequestDto,
  GetAllIncidentsRequestDto,
  TenantUserContextDto,
  UpdateIncidentRequestDto,
} from "@/dtos/req/incident-request.dto";
import type { UpdateIncidentClosureRequestDto } from "@/dtos/req/incident-closure-request.dto";
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
import http, { getAccessToken } from "@/lib/axios";

const INCIDENT_GET_ALL_PATH = "/Incident/GetAllIncidents";
const INCIDENT_CREATE_PATH = "/Incident/incident";
const INCIDENT_GET_BY_ID_PATH = "/Incident/GetIncidentById";
const INCIDENT_UPDATE_PATH = "/Incident/UpdateIncident";

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

function coercePerson(value: unknown): PersonDto | null {
  if (!isRecord(value)) {
    return null;
  }
  return {
    name: asString(readProp(value, "name", "Name")) ?? null,
    role: asString(readProp(value, "role", "Role")) ?? null,
    injuryLevel: asString(readProp(value, "injuryLevel", "InjuryLevel")) ?? null,
    bodyPartAffected:
      asString(readProp(value, "bodyPartAffected", "BodyPartAffected")) ?? null,
    injuryDescription:
      asString(readProp(value, "injuryDescription", "InjuryDescription")) ??
      null,
  };
}

/**
 * Maps API payload (camelCase or PascalCase) into the FE IncidentDto shape.
 */
function coerceIncidentDto(raw: Record<string, unknown>): IncidentDto {
  const peopleRaw = readProp(raw, "people", "People");
  const people = Array.isArray(peopleRaw)
    ? peopleRaw
        .map(coercePerson)
        .filter((person): person is PersonDto => person != null)
    : null;

  const fitRaw = readProp(raw, "isFitForFullDuty", "IsFitForFullDuty");

  return {
    id: asNumber(readProp(raw, "id", "Id")),
    severity: asString(readProp(raw, "severity", "Severity")) ?? null,
    site: asString(readProp(raw, "site", "Site")) ?? null,
    location: asString(readProp(raw, "location", "Location")) ?? null,
    description: asString(readProp(raw, "description", "Description")) ?? null,
    isDrop: asBoolean(readProp(raw, "isDrop", "IsDrop")) ?? null,
    incidentAt: asString(readProp(raw, "incidentAt", "IncidentAt")) ?? null,
    incidentReportedAt:
      asString(readProp(raw, "incidentReportedAt", "IncidentReportedAt")) ??
      null,
    isOSHARecordable: asBoolean(
      readProp(raw, "isOSHARecordable", "IsOSHARecordable"),
    ),
    isWorkRelated: asBoolean(readProp(raw, "isWorkRelated", "IsWorkRelated")),
    isDrugOrAlcoholRelated: asBoolean(
      readProp(raw, "isDrugOrAlcoholRelated", "IsDrugOrAlcoholRelated"),
    ),
    isFleetVehicleInvolved: asBoolean(
      readProp(raw, "isFleetVehicleInvolved", "IsFleetVehicleInvolved"),
    ),
    isSeriousIncident: asBoolean(
      readProp(raw, "isSeriousIncident", "IsSeriousIncident"),
    ),
    isEmergencyServiceCalled: asBoolean(
      readProp(raw, "isEmergencyServiceCalled", "IsEmergencyServiceCalled"),
    ),
    isThirdPartyInvolved: asBoolean(
      readProp(raw, "isThirdPartyInvolved", "IsThirdPartyInvolved"),
    ),
    initialTreatment:
      asString(readProp(raw, "initialTreatment", "InitialTreatment")) ?? null,
    isSecondaryTreatmentSought: asBoolean(
      readProp(raw, "isSecondaryTreatmentSought", "IsSecondaryTreatmentSought"),
    ),
    mechanismOfInjury:
      asString(readProp(raw, "mechanismOfInjury", "MechanismOfInjury")) ?? null,
    natureOfInjury:
      asString(readProp(raw, "natureOfInjury", "NatureOfInjury")) ?? null,
    objectInvolved:
      asString(readProp(raw, "objectInvolved", "ObjectInvolved")) ?? null,
    isOSHANotificationRequired: asBoolean(
      readProp(raw, "isOSHANotificationRequired", "IsOSHANotificationRequired"),
    ),
    affectedPersonId:
      asString(readProp(raw, "affectedPersonId", "AffectedPersonId")) ?? null,
    reportedById: asNumber(readProp(raw, "reportedById", "ReportedById")),
    userId: asNumber(readProp(raw, "userId", "UserId")),
    subCompanyId: asNumber(readProp(raw, "subCompanyId", "SubCompanyId")),
    injuredBodyPart:
      asString(readProp(raw, "injuredBodyPart", "InjuredBodyPart")) ?? null,
    injuryDescription:
      asString(readProp(raw, "injuryDescription", "InjuryDescription")) ?? null,
    incidentReporterEmail:
      asString(
        readProp(raw, "incidentReporterEmail", "IncidentReporterEmail"),
      ) ?? null,
    nonEmployeInvolved: asBoolean(
      readProp(raw, "nonEmployeInvolved", "NonEmployeInvolved"),
    ),
    whatTreatmentWasGiven:
      asString(readProp(raw, "whatTreatmentWasGiven", "WhatTreatmentWasGiven")) ??
      null,
    treatmentProvidedBy:
      asString(readProp(raw, "treatmentProvidedBy", "TreatmentProvidedBy")) ??
      null,
    treatmentLocation:
      asString(readProp(raw, "treatmentLocation", "TreatmentLocation")) ?? null,
    isFitForFullDuty:
      typeof fitRaw === "boolean" || typeof fitRaw === "string"
        ? fitRaw
        : (asString(fitRaw) ?? null),
    caseDisposition:
      asString(readProp(raw, "caseDisposition", "CaseDisposition")) ?? null,
    furtherMedicalRecommendations: asBoolean(
      readProp(
        raw,
        "furtherMedicalRecommendations",
        "FurtherMedicalRecommendations",
      ),
    ),
    images: asStringArray(readProp(raw, "images", "Images")) ?? null,
    people,
    actionTaken: asString(readProp(raw, "actionTaken", "ActionTaken")) ?? null,
    otherNotes: asString(readProp(raw, "otherNotes", "OtherNotes")) ?? null,
    feedback: asString(readProp(raw, "feedback", "Feedback")) ?? null,
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
  const { pageNumber, pageSize, subCompanyId, userId } = request;
  const search = request.search?.trim();
  const severity = request.severity?.trim();
  const caseDisposition = request.caseDisposition?.trim();

  // Only send the optional server-side filters when they are actually set, so
  // an unfiltered request keeps the exact body shape older backends expect.
  const body: GetAllIncidentsRequestDto = {
    pageNumber,
    pageSize,
    subCompanyId,
    userId,
    ...(search ? { search } : {}),
    ...(severity ? { severity } : {}),
    ...(caseDisposition ? { caseDisposition } : {}),
  };

  const { data } = await http.post<unknown>(INCIDENT_GET_ALL_PATH, body);
  return normalizeGetAllIncidentsResponse(data, request);
}

/**
 * GET /Incident/GetIncidentById
 * Query: `{ id, userId, subCompanyId }`
 * Header: `Authorization: Bearer <token>` (required by API security)
 */
export async function getIncidentById(
  params: Readonly<{
    id: number;
    userId: number;
    subCompanyId: number;
  }>,
) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to load this incident.");
  }

  const { data } = await http.get<unknown>(INCIDENT_GET_BY_ID_PATH, {
    params: {
      id: params.id,
      userId: params.userId,
      subCompanyId: params.subCompanyId,
    },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return normalizeIncidentDto(data);
}

export async function createIncident(payload: CreateIncidentRequestDto) {
  const { data } = await http.post<unknown>(INCIDENT_CREATE_PATH, payload);
  return normalizeIncidentDto(data) ?? (isRecord(data) ? (data as IncidentDto) : {});
}

/**
 * PUT /Incident/UpdateIncident/{id}
 * Body: `IncidentDto`
 * Header: `Authorization: Bearer <token>` (required by API security)
 */
export async function updateIncidentById(
  params: Readonly<{
    id: number;
    userId: number;
    subCompanyId: number;
  }>,
  payload: UpdateIncidentRequestDto,
) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to update this incident.");
  }

  const body: UpdateIncidentRequestDto = {
    ...payload,
    id: params.id,
    userId: params.userId,
    subCompanyId: params.subCompanyId,
  };

  const { data } = await http.put<unknown>(
    `${INCIDENT_UPDATE_PATH}/${String(params.id)}`,
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
 * Loads the current incident, merges `patch`, then PUT /Incident/UpdateIncident/{id}.
 */
export async function updateIncident(
  id: number,
  context: TenantUserContextDto,
  patch: Partial<IncidentDto>,
) {
  const existing = await getIncidentById({
    id,
    userId: context.userId,
    subCompanyId: context.subCompanyId,
  });

  const payload: UpdateIncidentRequestDto = {
    ...(existing ?? {}),
    ...patch,
    id,
    userId: context.userId,
    subCompanyId: context.subCompanyId,
    reportedById:
      patch.reportedById ?? existing?.reportedById ?? context.userId,
    isDrop: false,
  };

  return updateIncidentById(
    {
      id,
      userId: context.userId,
      subCompanyId: context.subCompanyId,
    },
    payload,
  );
}

function coerceChecklistItemDto(value: unknown): ClosureChecklistItemDto | null {
  if (!isRecord(value)) return null;
  return {
    id: asString(readProp(value, "id", "Id")) ?? undefined,
    label: asString(readProp(value, "label", "Label")) ?? undefined,
    completed: asBoolean(readProp(value, "completed", "Completed")) ?? undefined,
    required: asBoolean(readProp(value, "required", "Required")) ?? undefined,
    completedAt: asString(readProp(value, "completedAt", "CompletedAt")) ?? undefined,
    completedBy: asString(readProp(value, "completedBy", "CompletedBy")) ?? undefined,
  };
}

function coerceLinkedCapaDto(value: unknown): ClosureLinkedCapaItemDto | null {
  if (!isRecord(value)) return null;
  return {
    id: asString(readProp(value, "id", "Id")) ?? undefined,
    title: asString(readProp(value, "title", "Title")) ?? undefined,
    subtitle: asString(readProp(value, "subtitle", "Subtitle")) ?? undefined,
    progressPercent: asNumber(readProp(value, "progressPercent", "ProgressPercent")) ?? undefined,
    status: asString(readProp(value, "status", "Status")) ?? undefined,
  };
}

/**
 * Coerces and normalizes response from GET /api/Incident/{incidentId}/closure
 */
export function normalizeIncidentClosureDto(data: unknown): IncidentClosureResponseDto | null {
  if (!isRecord(data)) {
    return null;
  }
  const root = isRecord(data.data) ? data.data : data;

  const rawChecklist = readProp(root, "verificationChecklist", "VerificationChecklist");
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
    id: (asNumber(readProp(root, "id", "Id")) ?? asString(readProp(root, "id", "Id"))) ?? undefined,
    closureId: asString(readProp(root, "closureId", "ClosureId")) ?? undefined,
    incidentId: asNumber(readProp(root, "incidentId", "IncidentId")) ?? undefined,
    currentStep: asNumber(readProp(root, "currentStep", "CurrentStep")) ?? undefined,
    closureStatus: asString(readProp(root, "closureStatus", "ClosureStatus")) ?? undefined,
    closedAt: asString(readProp(root, "closedAt", "ClosedAt")) ?? undefined,
    closedBy: asString(readProp(root, "closedBy", "ClosedBy")) ?? undefined,
    closedByRole: asString(readProp(root, "closedByRole", "ClosedByRole")) ?? undefined,
    closureDate: asString(readProp(root, "closureDate", "ClosureDate")) ?? undefined,
    durationOpen: asString(readProp(root, "durationOpen", "DurationOpen")) ?? undefined,
    finalIncidentType: asString(readProp(root, "finalIncidentType", "FinalIncidentType")) ?? undefined,
    sifClassification: asString(readProp(root, "sifClassification", "SifClassification")) ?? undefined,
    daysAwayFromWork: asNumber(readProp(root, "daysAwayFromWork", "DaysAwayFromWork")) ?? undefined,
    daysOnRestrictedDuty: asNumber(readProp(root, "daysOnRestrictedDuty", "DaysOnRestrictedDuty")) ?? undefined,
    isOshaRecordable: asBoolean(readProp(root, "isOshaRecordable", "IsOshaRecordable")) ?? undefined,
    isOSHARecordable: asBoolean(readProp(root, "isOSHARecordable", "IsOSHARecordable")) ?? undefined,
    oshaOverrideReason: asString(readProp(root, "oshaOverrideReason", "OshaOverrideReason")) ?? undefined,
    closureStatement: asString(readProp(root, "closureStatement", "ClosureStatement")) ?? undefined,
    lessonsLearned: asString(readProp(root, "lessonsLearned", "LessonsLearned")) ?? undefined,
    closureNotes: asString(readProp(root, "closureNotes", "ClosureNotes")) ?? undefined,
    rootCauseSummary: asString(readProp(root, "rootCauseSummary", "RootCauseSummary")) ?? undefined,
    rootCauseDescription: asString(readProp(root, "rootCauseDescription", "RootCauseDescription")) ?? undefined,
    primaryRootCauseCategoryId: asNumber(readProp(root, "primaryRootCauseCategoryId", "PrimaryRootCauseCategoryId")) ?? undefined,
    primaryRootCause: asString(readProp(root, "primaryRootCause", "PrimaryRootCause")) ?? undefined,
    contributingFactorTags: asStringArray(readProp(root, "contributingFactorTags", "ContributingFactorTags")) ?? undefined,
    contributingFactors: asStringArray(readProp(root, "contributingFactors", "ContributingFactors")) ?? undefined,
    attestationConfirmed: asBoolean(readProp(root, "attestationConfirmed", "AttestationConfirmed")) ?? undefined,
    equipmentProceduresNote: asString(readProp(root, "equipmentProceduresNote", "EquipmentProceduresNote")) ?? undefined,
    actionsTaken: asString(readProp(root, "actionsTaken", "ActionsTaken")) ?? undefined,
    preventiveActionSummary: asString(readProp(root, "preventiveActionSummary", "PreventiveActionSummary")) ?? undefined,
    closureLinkedCapas,
    capasVerified: asBoolean(readProp(root, "capasVerified", "CapasVerified")) ?? undefined,
    mfaSigned: asBoolean(readProp(root, "mfaSigned", "MfaSigned")) ?? undefined,
    isEhsConfirmed: asBoolean(readProp(root, "isEhsConfirmed", "IsEhsConfirmed")) ?? undefined,
    residualRisk: asString(readProp(root, "residualRisk", "ResidualRisk")) ?? undefined,
    verificationChecklist,
    approverName: asString(readProp(root, "approverName", "ApproverName")) ?? undefined,
    approverRole: asString(readProp(root, "approverRole", "ApproverRole")) ?? undefined,
    approverInitials: asString(readProp(root, "approverInitials", "ApproverInitials")) ?? undefined,
    isApproved: asBoolean(readProp(root, "isApproved", "IsApproved")) ?? undefined,
  };
}

/**
 * GET /api/Incident/{incidentId}/closure
 * Header: `Authorization: Bearer <token>`
 */
export async function getIncidentClosure(
  incidentId: number,
): Promise<IncidentClosureResponseDto | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to load incident closure details.");
  }

  const { data } = await http.get<unknown>(`/Incident/${String(incidentId)}/closure`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return normalizeIncidentClosureDto(data);
}

/**
 * PUT /api/Incident/{incidentId}/closure
 * Body: UpdateIncidentClosureRequestDto
 * Header: `Authorization: Bearer <token>`
 */
export async function updateIncidentClosure(
  incidentId: number,
  payload: UpdateIncidentClosureRequestDto,
): Promise<IncidentClosureResponseDto | null> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Sign in required to update incident closure details.");
  }

  const { data } = await http.put<unknown>(
    `/Incident/${String(incidentId)}/closure`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return normalizeIncidentClosureDto(data) ?? (isRecord(data) ? (data as IncidentClosureResponseDto) : null);
}


