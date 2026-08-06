export type LotoTabId =
  | "equipment"
  | "active-lockouts"
  | "history"
  | "personnel";

export type LotoEquipmentStatus =
  | "Operational"
  | "Locked Out"
  | "Maintenance";

export type LotoStatusFilter = "all" | LotoEquipmentStatus;

export type LotoMetric = Readonly<{
  value: string;
  label: string;
}>;

export type LotoEquipmentItem = Readonly<{
  id: string;
  name: string;
  type: string;
  location: string;
  energySources: readonly string[];
  procedureId: string;
  status: LotoEquipmentStatus;
  lastInspection: string;
}>;

export const LOTO_TABS = [
  { id: "equipment" as const, label: "Equipment", count: 5 },
  { id: "active-lockouts" as const, label: "Active Lockouts", count: 2 },
  { id: "history" as const, label: "History", count: 6 },
  { id: "personnel" as const, label: "Personnel", count: 7 },
] as const;

export const LOTO_METRICS: readonly LotoMetric[] = [
  { value: "5", label: "Equipment on File" },
  { value: "2", label: "Active Lockouts" },
  { value: "7", label: "Authorized Personnel" },
  { value: "10", label: "Total Lockouts" },
];

export const LOTO_STATUS_FILTERS = [
  { id: "all" as const, label: "All" },
  { id: "Operational" as const, label: "Operational" },
  { id: "Locked Out" as const, label: "Locked Out" },
  { id: "Maintenance" as const, label: "Maintenance" },
] as const;

export type LotoActiveLockoutAccent = "amber" | "red";

export type LotoActiveLockout = Readonly<{
  id: string;
  equipmentId: string;
  equipmentName: string;
  purpose: string;
  operator: string;
  lockNumber: string;
  startedAt: string;
  expectedEndAt: string;
  accent: LotoActiveLockoutAccent;
}>;

export type LotoHistoryResult = "Completed" | "Active";

export type LotoHistoryRecord = Readonly<{
  id: string;
  logId: string;
  equipment: string;
  operator: string;
  lockNumber: string;
  startAt: string;
  endAt: string;
  purpose: string;
  duration: string;
  result: LotoHistoryResult;
}>;

export type LotoPersonnelStatus = "Current" | "Expired";

export type LotoPersonnel = Readonly<{
  id: string;
  name: string;
  initials: string;
  role: string;
  department: string;
  certifiedOn: string;
  expiresOn: string;
  equipmentIds: readonly string[];
  status: LotoPersonnelStatus;
}>;

/** Equipment rows matching Figma 6835:39794. */
export const LOTO_EQUIPMENT: readonly LotoEquipmentItem[] = [
  {
    id: "eq-1",
    name: "Hydraulic Press #4 - Station A",
    type: "Press",
    location: "Press Area",
    energySources: ["Electrical 480V", "Hydraulic"],
    procedureId: "LOTO-PR-004",
    status: "Operational",
    lastInspection: "2025-02-15",
  },
  {
    id: "eq-2",
    name: "Conveyor Belt System - Line B",
    type: "Conveyor",
    location: "Line B",
    energySources: ["Electrical 240V"],
    procedureId: "LOTO-PR-012",
    status: "Locked Out",
    lastInspection: "2025-03-01",
  },
  {
    id: "eq-3",
    name: "Air Compressor - Maintenance Bay",
    type: "Compressor",
    location: "Maintenance",
    energySources: ["Electrical 480V", "Pneumatic", "Stored Pressure"],
    procedureId: "LOTO-PR-008",
    status: "Operational",
    lastInspection: "2025-01-20",
  },
  {
    id: "eq-4",
    name: "CNC Milling Machine #2",
    type: "CNC Machine",
    location: "Machining",
    energySources: ["Electrical 480V", "Pneumatic", "Hydraulic"],
    procedureId: "LOTO-PR-015",
    status: "Operational",
    lastInspection: "2025-02-28",
  },
  {
    id: "eq-5",
    name: "Industrial Mixer - Chemical Tank 1",
    type: "Mixer",
    location: "Chemical Area",
    energySources: ["Electrical 240V", "Chemical Stored Energy"],
    procedureId: "LOTO-PR-021",
    status: "Maintenance",
    lastInspection: "2025-02-10",
  },
];

/** Active lockout cards matching Figma 6888:48666. */
export const LOTO_ACTIVE_LOCKOUTS: readonly LotoActiveLockout[] = [
  {
    id: "al-1",
    equipmentId: "eq-2",
    equipmentName: "Conveyor Belt System - Line B",
    purpose: "Belt replacement maintenance",
    operator: "Frank Torres",
    lockNumber: "LK-047",
    startedAt: "2025-03-16 08:30",
    expectedEndAt: "2025-03-16 16:00",
    accent: "amber",
  },
  {
    id: "al-2",
    equipmentId: "eq-3",
    equipmentName: "Air Compressor - Maintenance Bay",
    purpose: "Filter replacement",
    operator: "Tom Bradley",
    lockNumber: "LK-023",
    startedAt: "2025-03-16 10:00",
    expectedEndAt: "2025-03-16 12:00",
    accent: "red",
  },
];

/** History rows matching Figma 6888:49236. */
export const LOTO_HISTORY: readonly LotoHistoryRecord[] = [
  {
    id: "hist-1",
    logId: "LO-2026-018",
    equipment: "Hydraulic Press #4",
    operator: "Robert Kim",
    lockNumber: "LK-038",
    startAt: "2026-04-22 07:15",
    endAt: "2026-04-22 11:40",
    purpose: "Die replacement & alignment check",
    duration: "4h 25m",
    result: "Completed",
  },
  {
    id: "hist-2",
    logId: "LO-2026-011",
    equipment: "Hydraulic Press #4",
    operator: "Carlos Ruiz",
    lockNumber: "LK-031",
    startAt: "2026-03-14 09:00",
    endAt: "2026-03-14 13:30",
    purpose: "Hydraulic seal inspection",
    duration: "4h 30m",
    result: "Completed",
  },
  {
    id: "hist-3",
    logId: "LO-2026-004",
    equipment: "Hydraulic Press #4",
    operator: "Tom Bradley",
    lockNumber: "LK-019",
    startAt: "2026-02-07 06:45",
    endAt: "2026-02-07 10:15",
    purpose: "Annual preventive maintenance",
    duration: "3h 30m",
    result: "Completed",
  },
  {
    id: "hist-4",
    logId: "LO-2025-042",
    equipment: "Hydraulic Press #4",
    operator: "Robert Kim",
    lockNumber: "LK-058",
    startAt: "2025-12-10 08:00",
    endAt: "2025-12-10 09:45",
    purpose: "Pressure relief valve test",
    duration: "1h 45m",
    result: "Completed",
  },
  {
    id: "hist-5",
    logId: "LO-2025-033",
    equipment: "Conveyor Belt System",
    operator: "Frank Torres",
    lockNumber: "LK-047",
    startAt: "2025-03-16 08:30",
    endAt: "2025-03-16 16:00",
    purpose: "Belt replacement maintenance",
    duration: "—",
    result: "Active",
  },
  {
    id: "hist-6",
    logId: "LO-2025-031",
    equipment: "Conveyor Belt System",
    operator: "James Carter",
    lockNumber: "LK-041",
    startAt: "2025-11-05 10:00",
    endAt: "2025-11-05 14:30",
    purpose: "Drive motor lubrication",
    duration: "4h 30m",
    result: "Completed",
  },
];

/** Personnel rows matching Figma 6888:49696. */
export const LOTO_PERSONNEL: readonly LotoPersonnel[] = [
  {
    id: "per-1",
    name: "Robert Kim",
    initials: "RK",
    role: "Lead Tech",
    department: "Maintenance",
    certifiedOn: "2025-01-10",
    expiresOn: "2026-01-10",
    equipmentIds: ["EQ-001", "EQ-003"],
    status: "Current",
  },
  {
    id: "per-2",
    name: "Tom Bradley",
    initials: "TB",
    role: "Senior Tech",
    department: "Maintenance",
    certifiedOn: "2025-03-15",
    expiresOn: "2026-03-15",
    equipmentIds: ["EQ-001", "EQ-003", "EQ-005"],
    status: "Current",
  },
  {
    id: "per-3",
    name: "Carlos Ruiz",
    initials: "CR",
    role: "Operator III",
    department: "Production",
    certifiedOn: "2025-02-20",
    expiresOn: "2026-02-20",
    equipmentIds: ["EQ-001", "EQ-004"],
    status: "Current",
  },
  {
    id: "per-4",
    name: "Frank Torres",
    initials: "FT",
    role: "Operator II",
    department: "Production",
    certifiedOn: "2024-11-05",
    expiresOn: "2025-11-05",
    equipmentIds: ["EQ-002", "EQ-004"],
    status: "Expired",
  },
  {
    id: "per-5",
    name: "James Carter",
    initials: "JC",
    role: "Tech",
    department: "Maintenance",
    certifiedOn: "2025-04-01",
    expiresOn: "2026-04-01",
    equipmentIds: ["EQ-002", "EQ-004"],
    status: "Current",
  },
  {
    id: "per-6",
    name: "David Chen",
    initials: "DC",
    role: "EHS Specialist",
    department: "EHS",
    certifiedOn: "2025-01-22",
    expiresOn: "2026-01-22",
    equipmentIds: ["EQ-005"],
    status: "Current",
  },
  {
    id: "per-7",
    name: "Sarah Mitchell",
    initials: "SM",
    role: "EHS Manager",
    department: "EHS",
    certifiedOn: "2025-06-10",
    expiresOn: "2026-06-10",
    equipmentIds: ["EQ-001", "EQ-002", "EQ-003", "EQ-004", "EQ-005"],
    status: "Current",
  },
];
