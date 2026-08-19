import type {
  DocumentStatus,
  DocumentStatusFilter,
  LibraryCategory,
  PolicyDocument,
} from "@/components/policy-maker/policy-maker-types";
import { formatDocumentDisplayId } from "@/services/mappers/document-list.mapper";

/** Base library nav labels/icons — counts are computed from API data in the view. */
export const LIBRARY_CATEGORIES: readonly LibraryCategory[] = [
  {
    id: "policies",
    label: "Policies",
    icon: "mdi:file-document-outline",
    count: 0,
  },
  { id: "sops", label: "SOPs", icon: "mdi:clipboard-list-outline", count: 0 },
  { id: "training", label: "Training", icon: "mdi:school-outline", count: 0 },
  {
    id: "permits",
    label: "Permits",
    icon: "mdi:card-account-details-outline",
    count: 0,
  },
  { id: "forms", label: "Forms", icon: "mdi:form-select", count: 0 },
];

export const STATUS_FILTERS: readonly DocumentStatusFilter[] = [
  "All",
  "Current",
  "Review",
  "Expiring",
];

const POLICY_DOCUMENTS: readonly PolicyDocument[] = [
  {
    id: "pol-001",
    category: "policies",
    title: "EHS Policy Statement",
    code: "POL-001",
    site: "All",
    version: "v4.2",
    owner: "Sarah M.",
    ownerFullName: "Sarah Mitchell",
    status: "Current",
    expires: "2027-03-14",
    updated: "2026-01-10",
    reviewersDone: 3,
    reviewersTotal: 3,
    fileType: "PDF",
    fileSize: "1.8 MB",
    department: "EHS",
    documentKind: "Policy",
    reviewDate: "2026-01-10",
    acknowledged: 28,
    acknowledgmentTotal: 30,
    versions: [
      { version: "v4.2", author: "Sarah M.", date: "Jan 10", badge: "current" },
      {
        version: "v4.1",
        author: "Sarah M.",
        date: "Jul 02",
        badge: "review",
      },
    ],
  },
  {
    id: "sop-118",
    category: "sops",
    title: "Hot Work Permit Procedure",
    code: "SOP-118",
    site: "Plant A",
    version: "v2.1",
    owner: "Mike R.",
    ownerFullName: "Mike Rivera",
    status: "Current",
    expires: "2027-04-02",
    updated: "2026-02-18",
    reviewersDone: 2,
    reviewersTotal: 2,
    fileType: "PDF",
    fileSize: "2.1 MB",
    department: "Production",
    documentKind: "Procedure",
    reviewDate: "2026-02-18",
    acknowledged: 22,
    acknowledgmentTotal: 28,
    versions: [
      { version: "v2.1", author: "Mike R.", date: "Feb 18", badge: "current" },
      { version: "v2.0", author: "Mike R.", date: "Sep 04", badge: "review" },
    ],
  },
  {
    id: "sop-204",
    category: "sops",
    title: "LOTO Procedure - Press Equipment",
    code: "DOC-001",
    site: "Plant B",
    version: "v3.1",
    owner: "Sarah M.",
    ownerFullName: "Sarah Mitchell",
    status: "Current",
    expires: "2026-05-15",
    updated: "2026-01-15",
    reviewersDone: 3,
    reviewersTotal: 3,
    fileType: "PDF",
    fileSize: "2.4 MB",
    department: "Production",
    documentKind: "Procedure",
    reviewDate: "2026-01-15",
    acknowledged: 24,
    acknowledgmentTotal: 30,
    versions: [
      {
        version: "v3.1",
        author: "Sarah M.",
        authorFullName: "Sarah Mitchell",
        date: "Jan 15",
        publishedAt: "2025-01-10",
        badge: "current",
        changeLog:
          "Updated guard specification diagrams and ANSI Z244.1 references",
      },
      {
        version: "v3.0",
        author: "David C.",
        authorFullName: "David Chen",
        date: "Jun 15",
        publishedAt: "2024-06-15",
        badge: "review",
        changeLog:
          "Major revision: Added energy control for pneumatic systems, updated training requirements",
      },
      {
        version: "v2.2",
        author: "Sarah M.",
        authorFullName: "Sarah Mitchell",
        date: "Nov 20",
        publishedAt: "2023-11-20",
        badge: "review",
        changeLog: "Minor editorial corrections and formatting updates",
      },
      {
        version: "v2.1",
        author: "Tom B.",
        authorFullName: "Tom Bradley",
        date: "Mar 05",
        publishedAt: "2023-03-05",
        badge: "review",
        changeLog:
          "Added group lockout procedure section per OSHA 1910.147 update",
      },
    ],
  },
  {
    id: "sop-091",
    category: "sops",
    title: "Confined Space Entry",
    code: "SOP-091",
    site: "All",
    version: "v1.8",
    owner: "J. Merrick",
    ownerFullName: "J. Merrick",
    status: "Expiring soon",
    expires: "2026-05-01",
    updated: "2025-11-12",
    reviewersDone: 1,
    reviewersTotal: 2,
    fileType: "PDF",
    fileSize: "1.6 MB",
    department: "Operations",
    documentKind: "Procedure",
    reviewDate: "2025-11-12",
    acknowledged: 18,
    acknowledgmentTotal: 30,
    versions: [
      {
        version: "v1.8",
        author: "J. Merrick",
        date: "Nov 12",
        badge: "current",
      },
      {
        version: "v1.7",
        author: "J. Merrick",
        date: "Mar 08",
        badge: "review",
      },
    ],
  },
  {
    id: "sop-055",
    category: "sops",
    title: "LOTO Isolation Guide",
    code: "SOP-055",
    site: "Plant A",
    version: "v0.9",
    owner: "Alex K.",
    ownerFullName: "Alex Kim",
    status: "In review",
    expires: "—",
    updated: "2026-04-19",
    reviewersDone: 0,
    reviewersTotal: 2,
    fileType: "PDF",
    fileSize: "980 KB",
    department: "Maintenance",
    documentKind: "Procedure",
    reviewDate: "—",
    acknowledged: 0,
    acknowledgmentTotal: 30,
    versions: [
      { version: "v0.9", author: "Alex K.", date: "Apr 19", badge: "review" },
    ],
  },
  {
    id: "trn-012",
    category: "training",
    title: "New Hire Safety Orientation",
    code: "TRN-012",
    site: "All",
    version: "v3.1",
    owner: "Sarah M.",
    ownerFullName: "Sarah Mitchell",
    status: "Current",
    expires: "2027-01-20",
    updated: "2026-03-02",
    reviewersDone: 3,
    reviewersTotal: 3,
    fileType: "PDF",
    fileSize: "3.2 MB",
    department: "Training",
    documentKind: "Training",
    reviewDate: "2026-03-02",
    acknowledged: 29,
    acknowledgmentTotal: 30,
    versions: [
      { version: "v3.1", author: "Sarah M.", date: "Mar 02", badge: "current" },
    ],
  },
  {
    id: "trn-044",
    category: "training",
    title: "Forklift Operator Refresh",
    code: "TRN-044",
    site: "Plant B",
    version: "v1.2",
    owner: "Priya M.",
    ownerFullName: "Priya Mehra",
    status: "In review",
    expires: "2026-08-10",
    updated: "2026-04-15",
    reviewersDone: 1,
    reviewersTotal: 3,
    fileType: "PDF",
    fileSize: "1.1 MB",
    department: "Logistics",
    documentKind: "Training",
    reviewDate: "2026-04-15",
    acknowledged: 12,
    acknowledgmentTotal: 24,
    versions: [
      { version: "v1.2", author: "Priya M.", date: "Apr 15", badge: "review" },
    ],
  },
  {
    id: "prm-007",
    category: "permits",
    title: "Hot Work Permit Template",
    code: "PRM-007",
    site: "All",
    version: "v2.0",
    owner: "Mike R.",
    ownerFullName: "Mike Rivera",
    status: "Current",
    expires: "2027-06-01",
    updated: "2026-01-22",
    reviewersDone: 2,
    reviewersTotal: 2,
    fileType: "PDF",
    fileSize: "420 KB",
    department: "Production",
    documentKind: "Permit",
    reviewDate: "2026-01-22",
    acknowledged: 26,
    acknowledgmentTotal: 30,
    versions: [
      { version: "v2.0", author: "Mike R.", date: "Jan 22", badge: "current" },
    ],
  },
  {
    id: "frm-021",
    category: "forms",
    title: "Incident Witness Statement",
    code: "FRM-021",
    site: "All",
    version: "v1.4",
    owner: "Alex K.",
    ownerFullName: "Alex Kim",
    status: "Current",
    expires: "2027-02-28",
    updated: "2025-12-05",
    reviewersDone: 2,
    reviewersTotal: 2,
    fileType: "PDF",
    fileSize: "310 KB",
    department: "EHS",
    documentKind: "Form",
    reviewDate: "2025-12-05",
    acknowledged: 27,
    acknowledgmentTotal: 30,
    versions: [
      { version: "v1.4", author: "Alex K.", date: "Dec 05", badge: "current" },
    ],
  },
];

export function filterDocuments(
  documents: readonly PolicyDocument[],
  categoryId: string,
  statusFilter: DocumentStatusFilter,
): PolicyDocument[] {
  return documents.filter((doc) => {
    if (categoryId !== "all" && doc.category !== categoryId) {
      return false;
    }
    if (statusFilter === "All") {
      return true;
    }
    if (statusFilter === "Review") {
      return doc.status === "In review";
    }
    if (statusFilter === "Expiring") {
      return doc.status === "Expiring soon";
    }
    return doc.status === statusFilter;
  });
}

export function documentMatchesSearch(
  document: PolicyDocument,
  query: string,
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;

  return [
    document.title,
    formatDocumentDisplayId(document.id),
    document.id,
    document.code,
    document.owner,
    document.ownerFullName,
    document.site,
  ].some((field) => field.toLowerCase().includes(needle));
}

export function categoryLabel(categoryId: string): string {
  if (categoryId === "all") {
    return "All documents";
  }
  return (
    LIBRARY_CATEGORIES.find((item) => item.id === categoryId)?.label ??
    "Documents"
  );
}

export function getDocumentById(id: string): PolicyDocument | undefined {
  return POLICY_DOCUMENTS.find((doc) => doc.id === id);
}

/** Detail badge label — Current maps to Published per Figma. */
export function documentDisplayStatus(status: DocumentStatus): string {
  if (status === "Current") {
    return "Published";
  }
  return status;
}

export function acknowledgmentPercent(document: PolicyDocument): number {
  if (document.acknowledgmentTotal <= 0) {
    return 0;
  }
  return Math.round(
    (document.acknowledged / document.acknowledgmentTotal) * 100,
  );
}
