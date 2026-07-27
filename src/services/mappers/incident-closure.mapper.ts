import type {
  ClosureChecklistItem,
  ClosureLinkedCapaItem,
  IncidentClosureData,
} from "@/components/incidents/detail/incident-detail-types";
import type {
  ClosureChecklistItemDto,
  ClosureLinkedCapaItemDto,
  IncidentClosureResponseDto,
} from "@/dtos/res/incident-closure-response.dto";
import type { UpdateIncidentClosureRequestDto } from "@/dtos/req/incident-closure-request.dto";

function parseStepNumber(raw: number | null | undefined): 1 | 2 | 3 | 4 {
  if (raw === 1 || raw === 2 || raw === 3 || raw === 4) {
    return raw;
  }
  return 1;
}

function parseClosureStatus(
  raw: string | null | undefined,
): IncidentClosureData["closureStatus"] {
  if (
    raw === "Pending Checklist" ||
    raw === "Ready for Closure" ||
    raw === "Closed" ||
    raw === "Under Review"
  ) {
    return raw;
  }
  return "Pending Checklist";
}

function parseSifClassification(raw: string | null | undefined): string {
  if (raw === "Potential SIF (P-SIF)" || raw === "SIF Potential" || raw === "Potential SIF") {
    return "Potential SIF (P-SIF)";
  }
  if (raw === "Actual SIF" || raw === "SIF Actual") {
    return "Actual SIF";
  }
  return "Not SIF";
}

function parseResidualRisk(
  raw: string | null | undefined,
): IncidentClosureData["residualRisk"] {
  if (raw === "Low" || raw === "Medium" || raw === "High") {
    return raw;
  }
  return "Low";
}

function parseCapaStatus(
  raw: string | null | undefined,
): ClosureLinkedCapaItem["status"] {
  if (raw === "Completed" || raw === "In Progress" || raw === "Planning") {
    return raw;
  }
  return "In Progress";
}

function mapChecklistItemDto(
  item: ClosureChecklistItemDto,
  index: number,
): ClosureChecklistItem {
  return {
    id: item.id ?? `chk-${index + 1}`,
    label: item.label ?? "",
    completed: Boolean(item.completed),
    required: item.required !== false,
    completedAt: item.completedAt ?? undefined,
    completedBy: item.completedBy ?? undefined,
  };
}

function mapLinkedCapaItemDto(
  item: ClosureLinkedCapaItemDto,
  index: number,
): ClosureLinkedCapaItem {
  return {
    id: item.id ?? `capa-${index + 1}`,
    title: item.title ?? `CAPA-${String(index + 1).padStart(3, "0")}`,
    subtitle: item.subtitle ?? "",
    progressPercent: typeof item.progressPercent === "number" ? item.progressPercent : 0,
    status: parseCapaStatus(item.status),
  };
}

/**
 * Maps IncidentClosureResponseDto into IncidentClosureData view model.
 * If properties are missing, preserves existing local fallback data.
 */
export function mapIncidentClosureDtoToData(
  dto: IncidentClosureResponseDto | null | undefined,
  fallback: IncidentClosureData,
): IncidentClosureData {
  if (!dto) {
    return fallback;
  }

  const currentStep = parseStepNumber(dto.currentStep) ?? fallback.currentStep;
  const closureStatus = parseClosureStatus(dto.closureStatus) ?? fallback.closureStatus;

  const verificationChecklist: readonly ClosureChecklistItem[] =
    dto.verificationChecklist && dto.verificationChecklist.length > 0
      ? dto.verificationChecklist.map(mapChecklistItemDto)
      : fallback.verificationChecklist;

  const closureLinkedCapas: readonly ClosureLinkedCapaItem[] =
    dto.closureLinkedCapas && dto.closureLinkedCapas.length > 0
      ? dto.closureLinkedCapas.map(mapLinkedCapaItemDto)
      : fallback.closureLinkedCapas;

  return {
    currentStep,
    closureStatus,
    closureId: dto.closureId ?? dto.id?.toString() ?? fallback.closureId,
    closedAt: dto.closedAt ?? fallback.closedAt,
    closedBy: dto.closedBy ?? fallback.closedBy,
    closedByRole: dto.closedByRole ?? fallback.closedByRole,
    closureDate: dto.closureDate ?? fallback.closureDate,
    durationOpen: dto.durationOpen ?? fallback.durationOpen,
    finalIncidentType: dto.finalIncidentType ?? fallback.finalIncidentType,
    sifClassification: parseSifClassification(dto.sifClassification ?? fallback.sifClassification),
    daysAwayFromWork: typeof dto.daysAwayFromWork === "number" ? dto.daysAwayFromWork : fallback.daysAwayFromWork,
    daysOnRestrictedDuty: typeof dto.daysOnRestrictedDuty === "number" ? dto.daysOnRestrictedDuty : fallback.daysOnRestrictedDuty,
    isOshaRecordable: typeof dto.isOshaRecordable === "boolean" ? dto.isOshaRecordable : (typeof dto.isOSHARecordable === "boolean" ? dto.isOSHARecordable : fallback.isOshaRecordable),
    oshaOverrideReason: dto.oshaOverrideReason ?? fallback.oshaOverrideReason,
    closureStatement: dto.closureStatement ?? fallback.closureStatement,
    lessonsLearned: dto.lessonsLearned ?? fallback.lessonsLearned,
    closureNotes: dto.closureNotes ?? fallback.closureNotes,
    rootCauseSummary: dto.rootCauseSummary ?? dto.rootCauseDescription ?? fallback.rootCauseSummary,
    primaryRootCause: dto.primaryRootCause ?? (dto.primaryRootCauseCategoryId != null ? String(dto.primaryRootCauseCategoryId) : fallback.primaryRootCause),
    contributingFactors: dto.contributingFactors ?? dto.contributingFactorTags ?? fallback.contributingFactors,
    equipmentProceduresNote: dto.equipmentProceduresNote ?? fallback.equipmentProceduresNote,
    actionsTaken: dto.actionsTaken ?? fallback.actionsTaken,
    preventiveActionSummary: dto.preventiveActionSummary ?? fallback.preventiveActionSummary,
    closureLinkedCapas,
    capasVerified: typeof dto.capasVerified === "boolean" ? dto.capasVerified : fallback.capasVerified,
    mfaSigned: typeof dto.mfaSigned === "boolean" ? dto.mfaSigned : fallback.mfaSigned,
    isEhsConfirmed: typeof dto.isEhsConfirmed === "boolean" ? dto.isEhsConfirmed : (typeof dto.attestationConfirmed === "boolean" ? dto.attestationConfirmed : fallback.isEhsConfirmed),
    residualRisk: parseResidualRisk(dto.residualRisk),
    verificationChecklist,
    approverName: dto.approverName ?? fallback.approverName,
    approverRole: dto.approverRole ?? fallback.approverRole,
    approverInitials: dto.approverInitials ?? fallback.approverInitials,
    isApproved: typeof dto.isApproved === "boolean" ? dto.isApproved : fallback.isApproved,
  };
}

/**
 * Maps IncidentClosureData view model into UpdateIncidentClosureRequestDto for PUT /api/Incident/{incidentId}/closure
 */
export function mapIncidentClosureDataToUpdateDto(
  data: IncidentClosureData,
  incidentId: number,
): UpdateIncidentClosureRequestDto {
  const parsedCategoryId = Number(data.primaryRootCause);
  const primaryRootCauseCategoryId = Number.isFinite(parsedCategoryId)
    ? Math.trunc(parsedCategoryId)
    : 0;

  return {
    finalIncidentType: data.finalIncidentType,
    sifClassification: data.sifClassification,
    daysAwayFromWork: data.daysAwayFromWork,
    daysOnRestrictedDuty: data.daysOnRestrictedDuty,
    isOshaRecordable: data.isOshaRecordable,
    primaryRootCauseCategoryId,
    contributingFactorTags: Array.from(data.contributingFactors),
    rootCauseDescription: data.rootCauseSummary || data.closureNotes,
    actionsTaken: data.actionsTaken || data.preventiveActionSummary,
    attestationConfirmed: data.isEhsConfirmed || data.isApproved,

    // Extended / legacy fields
    incidentId,
    closureId: data.closureId,
    currentStep: data.currentStep,
    closureStatus: data.closureStatus,
    closedAt: data.closedAt,
    closedBy: data.closedBy,
    closedByRole: data.closedByRole,
    closureDate: data.closureDate,
    durationOpen: data.durationOpen,
    oshaOverrideReason: data.oshaOverrideReason,
    closureStatement: data.closureStatement,
    lessonsLearned: data.lessonsLearned,
    closureNotes: data.closureNotes,
    rootCauseSummary: data.rootCauseSummary,
    primaryRootCause: data.primaryRootCause,
    contributingFactors: Array.from(data.contributingFactors),
    equipmentProceduresNote: data.equipmentProceduresNote,
    preventiveActionSummary: data.preventiveActionSummary,
    capasVerified: data.capasVerified,
    mfaSigned: data.mfaSigned,
    isEhsConfirmed: data.isEhsConfirmed,
    residualRisk: data.residualRisk,
    approverName: data.approverName,
    approverRole: data.approverRole,
    approverInitials: data.approverInitials,
    isApproved: data.isApproved,
  };
}

