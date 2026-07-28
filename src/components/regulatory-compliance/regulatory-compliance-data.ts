import type {
  CalendarEventItem,
  ComplianceCategoryProgress,
  ComplianceKpiItem,
  ComplianceObligationDetail,
  ComplianceObligationItem,
  UpcomingFilingItem,
} from "./regulatory-compliance-types";

export const INITIAL_KPI_ITEMS: readonly ComplianceKpiItem[] = [
  {
    id: "kpi-1",
    label: "OBLIGATIONS TRACKED",
    count: 132,
    badgeValue: "+5",
    badgeTone: "green",
  },
  {
    id: "kpi-2",
    label: "COMPLIANT",
    count: 118,
    badgeValue: "+3",
    badgeTone: "green",
  },
  {
    id: "kpi-3",
    label: "DUE IN 60 DAYS",
    count: 9,
    badgeValue: "+2",
    badgeTone: "coral",
  },
  {
    id: "kpi-4",
    label: "ACTION REQUIRED",
    count: 5,
    badgeValue: "-2",
    badgeTone: "green",
  },
];

export const INITIAL_OBLIGATIONS: readonly ComplianceObligationItem[] = [
  {
    id: "obl-1",
    code: "OSHA 29 CFR 1910.147",
    obligation: "Lockout/Tagout",
    jurisdiction: "Federal",
    status: "Compliant",
    nextDue: "2026-09-12",
    evidenceText: "12 docs",
  },
  {
    id: "obl-2",
    code: "EPA TRI",
    obligation: "Toxic Release Inventory · Form R",
    jurisdiction: "Federal",
    status: "Due soon",
    nextDue: "2026-09-12",
    evidenceText: "4 docs",
  },
  {
    id: "obl-3",
    code: "OSHA 300A",
    obligation: "Annual Summary Posting",
    jurisdiction: "Federal",
    status: "Compliant",
    nextDue: "2026-09-12",
    evidenceText: "Posted",
  },
  {
    id: "obl-4",
    code: "PA DEP Air Permit",
    obligation: "Plant A · Title V",
    jurisdiction: "State",
    status: "Compliant",
    nextDue: "2026-09-12",
    evidenceText: "8 docs",
  },
  {
    id: "obl-5",
    code: "NFPA 70E",
    obligation: "Arc-flash assessment",
    jurisdiction: "Federal",
    status: "Action required",
    nextDue: "2026-09-12",
    evidenceText: "2 docs",
    isHighlighted: true,
  },
  {
    id: "obl-6",
    code: "Local FD Ord. 14-2",
    obligation: "Hot work permit registration",
    jurisdiction: "Local",
    status: "Compliant",
    nextDue: "2026-09-12",
    evidenceText: "1 doc",
  },
  {
    id: "obl-7",
    code: "DOT 49 CFR 172",
    obligation: "HazMat shipping training",
    jurisdiction: "Federal",
    status: "Due soon",
    nextDue: "2026-09-12",
    evidenceText: "3 docs",
  },
];

export const INITIAL_CATEGORIES: readonly ComplianceCategoryProgress[] = [
  {
    id: "cat-1",
    category: "Regulatory",
    current: 58,
    total: 64,
    colorHex: "#2563eb",
  },
  {
    id: "cat-2",
    category: "Safety",
    current: 38,
    total: 41,
    colorHex: "#0891a6",
  },
  {
    id: "cat-3",
    category: "Health",
    current: 22,
    total: 27,
    colorHex: "#334155",
  },
];

export const INITIAL_UPCOMING_FILINGS: readonly UpcomingFilingItem[] = [
  {
    id: "filing-1",
    date: "05-15",
    title: "NFPA 70E arc-flash update",
    badgeLabel: "Action",
    badgeTone: "action",
  },
  {
    id: "filing-2",
    date: "06-10",
    title: "HazMat training — annual",
    badgeLabel: "Federal",
    badgeTone: "federal",
  },
  {
    id: "filing-3",
    date: "07-01",
    title: "EPA TRI Form R",
    badgeLabel: "Federal",
    badgeTone: "federal",
  },
];

export const INITIAL_CALENDAR_EVENTS: readonly CalendarEventItem[] = [
  {
    id: "evt-1",
    day: 1,
    title: "OSHA 300A Annual...",
    chipTone: "cyan",
  },
  {
    id: "evt-2",
    day: 1,
    title: "Air Emission Pe...",
    chipTone: "pink",
  },
  {
    id: "evt-3",
    day: 15,
    title: "Hearing Conserv...",
    chipTone: "cyan",
  },
  {
    id: "evt-4",
    day: 25,
    title: "Hazardous Waste...",
    chipTone: "pink",
  },
  {
    id: "evt-5",
    day: 30,
    title: "Emergency Respo...",
    chipTone: "cyan",
  },
  {
    id: "evt-6",
    day: 31,
    title: "Fire Extinguish...",
    chipTone: "pink",
  },
];

export const DEFAULT_OBLIGATION_DETAIL: ComplianceObligationDetail = {
  id: "nfpa-70e",
  code: "NFPA 70E",
  title: "Fire Extinguisher Monthly Inspection",
  subtitle: "Safety · NFPA",
  status: "Due Soon",
  category: "Federal",
  recurrence: "Monthly",
  regulatoryBody: "NFPA",
  dueDate: "2025-03-31",
  responsible: "Emily Ross",
  priority: "High",
  completedDate: "Not yet completed",
};

export function getComplianceObligationById(
  id: string,
): ComplianceObligationDetail {
  const matched = INITIAL_OBLIGATIONS.find(
    (o) => o.id === id || o.code.toLowerCase().includes(id.toLowerCase()),
  );

  if (matched) {
    return {
      id: matched.id,
      code: matched.code,
      title: `${matched.obligation} Inspection`,
      subtitle: `Safety · ${matched.code.split(" ")[0]}`,
      status: matched.status === "Compliant" ? "Compliant" : "Due Soon",
      category: matched.jurisdiction,
      recurrence: "Monthly",
      regulatoryBody: matched.code.split(" ")[0] ?? "OSHA",
      dueDate: matched.nextDue,
      responsible: "Emily Ross",
      priority: matched.status === "Action required" ? "High" : "Medium",
      completedDate: matched.status === "Compliant" ? "2026-04-12" : "Not yet completed",
    };
  }

  return DEFAULT_OBLIGATION_DETAIL;
}
