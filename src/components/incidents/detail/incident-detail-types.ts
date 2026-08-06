/**
 * Detail view-model types shared by mappers and presentational cards.
 * Mappers should import from this module (or linked-capa/capa-types), not card files.
 */

export type { AttachmentItem } from "@/components/incidents/detail/shared/types";

export type {
  HrcaMeta,
  HrcaRow,
  HrcaWhyStep,
} from "@/components/incidents/detail/investigations/hrca/hrca-data";

export type IncidentDetailInfoItemKind = "text" | "yesno" | "readonly";

export type IncidentDetailInfoItem = Readonly<{
  key: string;
  label: string;
  value: string;
  kind?: IncidentDetailInfoItemKind;
}>;

export type IncidentDetailResponseAction = Readonly<{
  id: string;
  label: string;
  completed: boolean;
}>;

export type IncidentRoutingMember = Readonly<{
  role: string;
  name: string;
  initials: string;
  subtitle?: string;
}>;

export type ResponderMember = Readonly<{
  role: string;
  name: string;
  initials: string;
  empId: string;
  badgeLabel: string;
  badgeTone: "teal" | "green" | "gray" | "blue";
}>;

export type WitnessRow = Readonly<{
  name: string;
  role: string;
  initials: string;
  badgeLabel: string;
  badgeTone: "green" | "gray";
}>;

export type TimelineEvent = Readonly<{
  id: string;
  title: string;
  description: string;
  time: string;
  actorName: string;
  actorInitials: string;
  actorRole?: string;
  icon: string;
}>;

export type MetricRow = Readonly<{
  label: string;
  value: string;
}>;

export type WhyChainItem = Readonly<{
  step: number;
  label: string;
  text: string;
  isRootCause?: boolean;
}>;

export type ContributingFactorItem = Readonly<{
  category: string;
  text: string;
  accent: string;
}>;

export type StatusChecklistRow = Readonly<{
  label: string;
  completed: boolean;
}>;

export type SignOffRow = Readonly<{
  name: string;
  role: string;
  initials: string;
  badgeLabel: string;
  badgeTone: "green" | "gray";
}>;

export type ClosureChecklistItem = Readonly<{
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
  completedAt?: string;
  completedBy?: string;
}>;

export type ClosureLinkedCapaItem = Readonly<{
  id: string;
  title: string;
  subtitle: string;
  progressPercent: number;
  status: "Completed" | "In Progress" | "Planning";
}>;

export type IncidentClosureData = Readonly<{
  currentStep: 1 | 2 | 3 | 4;
  /** Furthest step unlocked via Proceed — sidebar cannot jump beyond this. */
  maxAccessibleStep: 1 | 2 | 3 | 4;
  closureStatus:
    | "Pending Checklist"
    | "Ready for Closure"
    | "Closed"
    | "Under Review";
  closureId?: string;
  closedAt?: string;
  closedBy: string;
  closedByRole: string;
  closureDate: string;
  durationOpen: string;
  finalIncidentType: string;
  sifClassification: string;
  daysAwayFromWork: number;
  daysOnRestrictedDuty: number;
  isOshaRecordable: boolean;
  oshaOverrideReason?: string;
  closureStatement: string;
  lessonsLearned: string;
  closureNotes: string;
  rootCauseSummary: string;
  primaryRootCauseCategoryIds: readonly string[];
  contributingFactors: readonly string[];
  equipmentProceduresNote: string;
  actionsTaken: string;
  preventiveActionSummary: string;
  closureLinkedCapas: readonly ClosureLinkedCapaItem[];
  capasVerified: boolean;
  mfaSigned: boolean;
  isEhsConfirmed: boolean;
  residualRisk: "Low" | "Medium" | "High";
  verificationChecklist: readonly ClosureChecklistItem[];
  approverName: string;
  approverRole: string;
  approverInitials: string;
  isApproved: boolean;
}>;
