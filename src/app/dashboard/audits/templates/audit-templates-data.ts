export type AuditTemplate = Readonly<{
  id: string;
  title: string;
  sectionCount: number;
  itemCount: number;
  /** Programme the template belongs to, e.g. "Safety". */
  category: string;
  /** Sites it applies to, e.g. "Manufacturing" or "All". */
  scope: string;
  lastUsed: string;
}>;

export const AUDIT_TEMPLATES: readonly AuditTemplate[] = [
  {
    id: "iso-45001-annual",
    title: "ISO 45001 Annual Inspection",
    sectionCount: 8,
    itemCount: 64,
    category: "Safety",
    scope: "All",
    lastUsed: "2025-03-05",
  },
  {
    id: "fire-safety-monthly",
    title: "Fire Safety Monthly Inspection Audit",
    sectionCount: 4,
    itemCount: 24,
    category: "Fire Safety",
    scope: "All",
    lastUsed: "2025-03-15",
  },
  {
    id: "chemical-management",
    title: "Chemical Management Audit",
    sectionCount: 5,
    itemCount: 38,
    category: "Environment",
    scope: "Chemical / Manufacturing",
    lastUsed: "2025-02-10",
  },
  {
    id: "loto-checklist",
    title: "LOTO Audit Checklist",
    sectionCount: 6,
    itemCount: 42,
    category: "Safety",
    scope: "Manufacturing",
    lastUsed: "2025-02-20",
  },
  {
    id: "contractor-safety",
    title: "Contractor Safety Audit",
    sectionCount: 5,
    itemCount: 30,
    category: "Contractor",
    scope: "All",
    lastUsed: "2025-01-15",
  },
  {
    id: "environmental-compliance",
    title: "Environmental Compliance Audit",
    sectionCount: 7,
    itemCount: 55,
    category: "Environment",
    scope: "All",
    lastUsed: "2025-01-20",
  },
];
