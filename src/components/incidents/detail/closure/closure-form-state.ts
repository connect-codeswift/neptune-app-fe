import type {
  ClosureChecklistItem,
  IncidentClosureData,
} from "@/components/incidents/detail/incident-detail-types";
import { getAuthDisplayName } from "@/lib/auth-context";
import { formatShortDateTime } from "@/lib/format-short-date-time";

const DEFAULT_VERIFICATION_CHECKLIST: readonly ClosureChecklistItem[] = [
  {
    id: "chk-1",
    label: "Immediate containment & emergency response completed",
    completed: false,
    required: true,
  },
  {
    id: "chk-2",
    label: "Root cause analysis & 5-Why investigation finalized",
    completed: false,
    required: true,
  },
  {
    id: "chk-3",
    label: "Corrective and Preventive Actions (CAPA) assigned",
    completed: false,
    required: true,
  },
  {
    id: "chk-4",
    label: "Regulatory notification & compliance report submitted",
    completed: false,
    required: false,
  },
  {
    id: "chk-5",
    label: "Final EHS Manager closure review & sign-off",
    completed: false,
    required: true,
  },
];

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "EU";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
}

export type CreateInitialClosureDataOptions = Readonly<{
  finalIncidentType?: string;
  closedBy?: string;
  approverName?: string;
}>;

/** Default closure wizard state — used on first load and after Cancel. */
export function createInitialClosureData(
  options: CreateInitialClosureDataOptions = {},
): IncidentClosureData {
  const closedBy = options.closedBy ?? (getAuthDisplayName() || "EHS Lead");
  const approverName = options.approverName ?? closedBy;

  return {
    currentStep: 1,
    maxAccessibleStep: 1,
    closureStatus: "Pending Checklist",
    draftSavedAt: "",
    draftStep: 1,
    closureId: undefined,
    closedAt: undefined,
    closedBy,
    closedByRole: "EHS Manager",
    closureDate: formatShortDateTime(new Date()),
    durationOpen: "—",
    finalIncidentType: options.finalIncidentType ?? "Select option",
    sifClassification: "Non-SIF",
    daysAwayFromWork: 0,
    daysOnRestrictedDuty: 0,
    isOshaRecordable: false,
    oshaOverrideReason: undefined,
    closureStatement: "",
    lessonsLearned: "",
    closureNotes: "",
    rootCauseSummary: "",
    primaryRootCauseCategoryIds: [],
    contributingFactors: [],
    equipmentProceduresNote: "",
    actionsTaken: "",
    preventiveActionSummary: "",
    closureLinkedCapas: [],
    capasVerified: false,
    mfaSigned: false,
    isEhsConfirmed: false,
    residualRisk: "Low",
    verificationChecklist: DEFAULT_VERIFICATION_CHECKLIST.map((item) => ({
      ...item,
    })),
    approverName,
    approverRole: "EHS Manager",
    approverInitials: initialsFromName(approverName),
    isApproved: false,
  };
}

/** Clears step inputs and returns the user to step 1. Preserves closure metadata. */
export function resetClosureWizardFields(
  prev: IncidentClosureData,
  options: CreateInitialClosureDataOptions = {},
): IncidentClosureData {
  const fresh = createInitialClosureData({
    finalIncidentType: options.finalIncidentType,
    closedBy: prev.closedBy || options.closedBy,
    approverName: prev.approverName || options.approverName,
  });

  return {
    ...fresh,
    closureStatus: prev.closureStatus,
    draftSavedAt: prev.draftSavedAt,
    draftStep: prev.draftStep,
    closureId: prev.closureId,
    closedAt: prev.closedAt,
    closedByRole: prev.closedByRole,
    closureDate: prev.closureDate,
    durationOpen: prev.durationOpen,
    approverRole: prev.approverRole,
    approverInitials: prev.approverInitials,
    residualRisk: prev.residualRisk,
    closureLinkedCapas: prev.closureLinkedCapas,
  };
}
