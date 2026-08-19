export type NotificationPreferenceKey =
  | "incidentEmails"
  | "inspectionDeadlineEmails"
  | "criticalSmsAlerts"
  | "weeklyComplianceReport"
  | "trainingExpirationReminders"
  | "systemAnnouncements";

export type NotificationPreference = Readonly<{
  key: NotificationPreferenceKey;
  label: string;
  defaultEnabled: boolean;
}>;

export const NOTIFICATION_PREFERENCES: readonly NotificationPreference[] = [
  {
    key: "incidentEmails",
    label: "Email notifications for assigned incidents",
    defaultEnabled: true,
  },
  {
    key: "inspectionDeadlineEmails",
    label: "Email notifications for inspection deadlines",
    defaultEnabled: true,
  },
  {
    key: "criticalSmsAlerts",
    label: "SMS alerts for critical safety events",
    defaultEnabled: true,
  },
  {
    key: "weeklyComplianceReport",
    label: "Weekly compliance summary report",
    defaultEnabled: false,
  },
  {
    key: "trainingExpirationReminders",
    label: "Training expiration reminders",
    defaultEnabled: true,
  },
  {
    key: "systemAnnouncements",
    label: "System announcements",
    defaultEnabled: false,
  },
];

export const DEPARTMENT_OPTIONS = [
  { value: "environmental-health", label: "Environmental Health" },
  { value: "operations", label: "Operations" },
  { value: "facilities", label: "Facilities" },
  { value: "manufacturing", label: "Manufacturing" },
] as const;

export const RELATIONSHIP_OPTIONS = [
  { value: "spouse", label: "Spouse" },
  { value: "parent", label: "Parent" },
  { value: "sibling", label: "Sibling" },
  { value: "friend", label: "Friend" },
  { value: "other", label: "Other" },
] as const;

export const REPORTS_TO_OPTIONS = [
  { value: "michael-torres", label: "Michael Torres" },
  { value: "jane-doe", label: "Jane Doe" },
  { value: "alex-rivera", label: "Alex Rivera" },
] as const;

export const DEFAULT_EMERGENCY_CONTACT = {
  name: "Robert Mitchell",
  relationship: "spouse",
  phone: "+1 (713) 555-0198",
  altPhone: "+1 (713) 555-0199",
} as const;

export const DEFAULT_PROFILE_FORM = {
  phone: "+1 (713) 555-0142",
  jobTitle: "EHS Manager",
  department: "environmental-health",
  office: "Building A, Room 312",
  reportsTo: "michael-torres",
} as const;

export function splitDisplayName(displayName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }

  if (parts.length === 1) {
    return { firstName: parts[0]!, lastName: "" };
  }

  return {
    firstName: parts[0]!,
    lastName: parts.slice(1).join(" "),
  };
}
