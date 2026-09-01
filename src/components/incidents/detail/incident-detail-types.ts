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
  /**
   * The CAPA's stored status, exactly as the API spells it - see `CAPA_API_STATUS`.
   * Was a three-value union of its own (`Planning` / `In Progress` / `Completed`), which
   * meant a status the API stopped sending still type-checked and simply rendered wrong.
   */
  status: string;
}>;

export type IncidentClosureData = Readonly<{
  currentStep: 1 | 2 | 3 | 4;
  /** Furthest step unlocked via Proceed — sidebar cannot jump beyond this. */
  maxAccessibleStep: 1 | 2 | 3 | 4;
  closureStatus:
    "Pending Checklist" | "Ready for Closure" | "Closed" | "Under Review";
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

/**
 * Shown in the affected person's name slot when the record carries no name.
 *
 * Two placeholders, not one, because "nobody is recorded" and "somebody is
 * recorded but we have no name for them" are different facts and the second
 * still has an employee id worth showing.
 *
 * They are compared against rather than only rendered, so they are constants:
 * the edit inputs must not seed a reporter's field with one, and the card must
 * not treat one as a real name.
 */
export const NO_AFFECTED_PERSON_LABEL = "No affected person logged";
export const AFFECTED_NAME_UNKNOWN_LABEL = "Name not recorded";

export function isAffectedNamePlaceholder(value: string): boolean {
  const trimmed = value.trim();
  return (
    trimmed === NO_AFFECTED_PERSON_LABEL ||
    trimmed === AFFECTED_NAME_UNKNOWN_LABEL
  );
}
