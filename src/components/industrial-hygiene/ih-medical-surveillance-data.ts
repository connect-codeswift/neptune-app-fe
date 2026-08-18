export type IhSurveillanceProgram = Readonly<{
  id: string;
  code: string;
  title: string;
  regulation: string;
  overdueLabel: string | null;
  enrolled: number;
  overdue: number;
  compliant: number;
  frequency: string;
  lastReviewed: string;
}>;

/** Medical Surveillance — Figma 5348:37332. */
export const IH_SURVEILLANCE_PROGRAMS: readonly IhSurveillanceProgram[] = [
  {
    id: "sv-1",
    code: "SV-001",
    title: "Hearing Conservation Program",
    regulation: "OSHA 29 CFR 1910.95",
    overdueLabel: "3 overdue",
    enrolled: 28,
    overdue: 3,
    compliant: 25,
    frequency: "Annual",
    lastReviewed: "2025-11-01",
  },
  {
    id: "sv-2",
    code: "SV-002",
    title: "Respiratory Protection Program",
    regulation: "OSHA 29 CFR 1910.134",
    overdueLabel: "1 overdue",
    enrolled: 14,
    overdue: 1,
    compliant: 13,
    frequency: "Annual",
    lastReviewed: "2026-01-15",
  },
  {
    id: "sv-3",
    code: "SV-003",
    title: "Benzene Surveillance Program",
    regulation: "OSHA 29 CFR 1910.1028",
    overdueLabel: null,
    enrolled: 8,
    overdue: 0,
    compliant: 8,
    frequency: "Annual",
    lastReviewed: "2026-02-20",
  },
  {
    id: "sv-4",
    code: "SV-004",
    title: "Lead Medical Surveillance",
    regulation: "OSHA 29 CFR 1910.1025",
    overdueLabel: "2 overdue",
    enrolled: 5,
    overdue: 2,
    compliant: 3,
    frequency: "Annual",
    lastReviewed: "2025-08-10",
  },
  {
    id: "sv-5",
    code: "SV-005",
    title: "Asbestos Health Monitoring",
    regulation: "OSHA 29 CFR 1910.1001",
    overdueLabel: null,
    enrolled: 4,
    overdue: 0,
    compliant: 4,
    frequency: "Annual",
    lastReviewed: "2026-03-05",
  },
];
