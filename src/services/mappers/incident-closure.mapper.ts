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
import type { SaveIncidentClosureDto } from "@/dtos/req/incident-closure-request.dto";

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
  if (
    raw === "Potential SIF (P-SIF)" ||
    raw === "SIF Potential" ||
    raw === "Potential SIF"
  ) {
    return "Potential SIF";
  }
  if (raw === "Actual SIF" || raw === "SIF Actual") {
    return "Actual SIF";
  }
  if (raw === "Not SIF" || raw === "Non-SIF") {
    return "Non-SIF";
  }
  return "Non-SIF";
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
    progressPercent:
      typeof item.progressPercent === "number" ? item.progressPercent : 0,
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
  const maxAccessibleStep = Math.max(
    currentStep,
    fallback.maxAccessibleStep ?? 1,
  ) as IncidentClosureData["maxAccessibleStep"];
  const closureStatus =
    parseClosureStatus(dto.closureStatus) ?? fallback.closureStatus;

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
    maxAccessibleStep,
    closureStatus,
    closureId: dto.closureId ?? dto.id?.toString() ?? fallback.closureId,
    closedAt: dto.closedAt ?? fallback.closedAt,
    closedBy: dto.closedBy ?? fallback.closedBy,
    closedByRole: dto.closedByRole ?? fallback.closedByRole,
    closureDate: dto.closureDate ?? fallback.closureDate,
    durationOpen: dto.durationOpen ?? fallback.durationOpen,
    finalIncidentType: dto.finalIncidentType ?? fallback.finalIncidentType,
    sifClassification: parseSifClassification(
      dto.sifClassification ?? fallback.sifClassification,
    ),
    daysAwayFromWork:
      typeof dto.daysAwayFromWork === "number"
        ? dto.daysAwayFromWork
        : fallback.daysAwayFromWork,
    daysOnRestrictedDuty:
      typeof dto.daysOnRestrictedDuty === "number"
        ? dto.daysOnRestrictedDuty
        : fallback.daysOnRestrictedDuty,
    isOshaRecordable:
      typeof dto.isOshaRecordable === "boolean"
        ? dto.isOshaRecordable
        : typeof dto.isOSHARecordable === "boolean"
          ? dto.isOSHARecordable
          : fallback.isOshaRecordable,
    oshaOverrideReason: dto.oshaOverrideReason ?? fallback.oshaOverrideReason,
    closureStatement: dto.closureStatement ?? fallback.closureStatement,
    lessonsLearned: dto.lessonsLearned ?? fallback.lessonsLearned,
    closureNotes: dto.closureNotes ?? fallback.closureNotes,
    rootCauseSummary:
      dto.rootCauseSummary ??
      dto.rootCauseDescription ??
      fallback.rootCauseSummary,
    primaryRootCauseCategoryIds:
      dto.primaryRootCauseCategoryIds?.map(String) ??
      (dto.primaryRootCauseCategoryId != null
        ? [String(dto.primaryRootCauseCategoryId)]
        : fallback.primaryRootCauseCategoryIds),
    contributingFactors:
      dto.contributingFactors ??
      dto.contributingFactorTags ??
      fallback.contributingFactors,
    equipmentProceduresNote:
      dto.equipmentProceduresNote ?? fallback.equipmentProceduresNote,
    actionsTaken: dto.actionsTaken ?? fallback.actionsTaken,
    preventiveActionSummary:
      dto.preventiveActionSummary ?? fallback.preventiveActionSummary,
    closureLinkedCapas,
    capasVerified:
      typeof dto.capasVerified === "boolean"
        ? dto.capasVerified
        : fallback.capasVerified,
    mfaSigned:
      typeof dto.mfaSigned === "boolean" ? dto.mfaSigned : fallback.mfaSigned,
    isEhsConfirmed:
      typeof dto.isEhsConfirmed === "boolean"
        ? dto.isEhsConfirmed
        : typeof dto.attestationConfirmed === "boolean"
          ? dto.attestationConfirmed
          : fallback.isEhsConfirmed,
    residualRisk: parseResidualRisk(dto.residualRisk),
    verificationChecklist,
    approverName: dto.approverName ?? fallback.approverName,
    approverRole: dto.approverRole ?? fallback.approverRole,
    approverInitials: dto.approverInitials ?? fallback.approverInitials,
    isApproved:
      typeof dto.isApproved === "boolean"
        ? dto.isApproved
        : fallback.isApproved,
  };
}

/**
 * Maps IncidentClosureData view model into SaveIncidentClosureDto for
 * PUT /api/Incident/{incidentId}/closure
 */
export function mapIncidentClosureDataToUpdateDto(
  data: IncidentClosureData,
): SaveIncidentClosureDto {
  const primaryRootCauseCategoryIds = data.primaryRootCauseCategoryIds
    .map((id) => Math.trunc(Number(id)))
    .filter((id) => Number.isFinite(id));
  const primaryRootCauseCategoryId = primaryRootCauseCategoryIds[0] ?? null;

  return {
    finalIncidentType:
      !data.finalIncidentType || data.finalIncidentType === "Select option"
        ? null
        : data.finalIncidentType,
    sifClassification: data.sifClassification || null,
    daysAwayFromWork: data.daysAwayFromWork,
    daysOnRestrictedDuty: data.daysOnRestrictedDuty,
    isOshaRecordable: data.isOshaRecordable,
    primaryRootCauseCategoryId,
    contributingFactorTags: Array.from(data.contributingFactors),
    rootCauseDescription: data.rootCauseSummary || data.closureNotes || null,
    actionsTaken: data.actionsTaken || data.preventiveActionSummary || null,
    attestationConfirmed: data.isEhsConfirmed || data.isApproved,
  };
}
