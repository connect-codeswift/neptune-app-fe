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
