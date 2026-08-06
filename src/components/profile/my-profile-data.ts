export type ProfileCertification = Readonly<{
  name: string;
  issued: string;
  expires: string;
  status: "Valid" | "Expired";
}>;

export type ProfileActivityItem = Readonly<{
  icon: string;
  title: string;
  timeAgo: string;
}>;

export type ProfilePersonalInfo = Readonly<{
  employeeId: string;
  startDate: string;
  reportsTo: string;
  directReports: string;
  employmentType: string;
  office: string;
}>;

/** Placeholder profile fields until dedicated user-profile APIs exist. */
export const PLACEHOLDER_PERSONAL_INFO: ProfilePersonalInfo = {
  employeeId: "EMP-2847",
  startDate: "March 15, 2021",
  reportsTo: "Michael Torres (Director of EHS)",
  directReports: "4",
  employmentType: "Full-time",
  office: "Building A, Room 312",
};

export const PLACEHOLDER_ASSIGNED_PERMISSIONS = [
  "Incident Management",
  "Inspection Approval",
  "Report Generation",
  "Training Assignment",
  "Audit Management",
  "Corrective Actions",
] as const;

export const PLACEHOLDER_CERTIFICATIONS: readonly ProfileCertification[] = [
  {
    name: "OSHA 30-Hour General Industry",
    issued: "Jan 2023",
    expires: "Jan 2026",
    status: "Valid",
  },
  {
    name: "Certified Safety Professional (CSP)",
    issued: "Jun 2022",
    expires: "Jun 2025",
    status: "Valid",
  },
  {
    name: "HAZWOPER 40-Hour",
    issued: "Mar 2021",
    expires: "Mar 2024",
    status: "Expired",
  },
  {
    name: "First Aid/CPR/AED",
    issued: "Aug 2023",
    expires: "Aug 2025",
    status: "Valid",
  },
  {
    name: "ISO 14001 Internal Auditor",
    issued: "Nov 2022",
    expires: "No expiry",
    status: "Valid",
  },
];

export const PLACEHOLDER_ACTIVITY: readonly ProfileActivityItem[] = [
  {
    icon: "mdi:clipboard-check-outline",
    title: "Completed Incident Report #IR-2024-089",
    timeAgo: "2 hours ago",
  },
  {
    icon: "mdi:shield-check-outline",
    title: "Approved Safety Inspection for Warehouse Zone 4",
    timeAgo: "Yesterday",
  },
  {
    icon: "mdi:file-document-edit-outline",
    title: "Updated Emergency Response Plan v3.2",
    timeAgo: "2 days ago",
  },
  {
    icon: "mdi:chart-box-outline",
    title: "Submitted Monthly EHS Compliance Report",
    timeAgo: "3 days ago",
  },
  {
    icon: "mdi:account-arrow-right-outline",
    title: "Assigned corrective action to Marcus Chen",
    timeAgo: "1 week ago",
  },
];

export function formatPermissionLabel(permission: string): string {
  return permission
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
