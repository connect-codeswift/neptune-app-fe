export type JurisdictionType = "All" | "Federal" | "State" | "Local";

export type ComplianceStatusType = "All" | "Compliant" | "Due soon" | "Action required" | "Action";

export type ComplianceKpiItem = Readonly<{
  id: string;
  label: string;
  count: number;
  badgeValue: string;
  badgeTone: "green" | "danger" | "coral";
}>;

export type ComplianceObligationItem = Readonly<{
  id: string;
  code: string;
  obligation: string;
  jurisdiction: "Federal" | "State" | "Local";
  status: "Compliant" | "Due soon" | "Action required";
  nextDue: string;
  evidenceText: string;
  isHighlighted?: boolean;
}>;

export type ComplianceCategoryProgress = Readonly<{
  id: string;
  category: string;
  current: number;
  total: number;
  colorHex: string;
}>;

export type UpcomingFilingItem = Readonly<{
  id: string;
  date: string;
  title: string;
  responsiblePerson?: string;
  badgeLabel: string;
  badgeTone: "action" | "federal" | "state" | "local";
}>;

export type ComplianceObligationDetail = Readonly<{
  id: string;
  code: string;
  title: string;
  subtitle: string;
  status: "Compliant" | "Due Soon" | "Due soon" | "Action Required" | "Action required";
  category: string;
  recurrence: string;
  regulatoryBody: string;
  dueDate: string;
  responsible: string;
  priority: "High" | "Medium" | "Low";
  completedDate: string;
}>;

export type CalendarEventItem = Readonly<{
  id: string;
  day: number;
  month: number;
  year: number;
  title: string;
  chipTone: "cyan" | "pink";
}>;
