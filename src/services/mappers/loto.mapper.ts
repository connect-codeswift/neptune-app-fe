import type {
  LotoDashboardKpisDto,
  LotoEquipmentDetailDto,
  LotoEquipmentGridRowDto,
  LotoLockoutRowDto,
  LotoPersonnelDto,
} from "@/dtos/res/loto-response.dto";
import type {
  LotoActiveLockout,
  LotoEquipmentItem,
  LotoHistoryRecord,
  LotoMetric,
  LotoPersonnel,
} from "@/app/dashboard/lockout-tagout/loto-data";
import type {
  LotoEquipmentDetail,
  LotoRecentLockout,
} from "@/app/dashboard/lockout-tagout/loto-equipment-detail-data";

/** Backend codes are bare per-site sequences ("7"); draw them with the module prefix. */
export function withEquipmentPrefix(code: string): string {
  const trimmed = code.trim();
  if (trimmed === "") return "—";
  return trimmed.toUpperCase().startsWith("EQ-") ? trimmed : `EQ-${trimmed}`;
}

export function withLockPrefix(code: string): string {
  const trimmed = code.trim();
  if (trimmed === "") return "—";
  return trimmed.toUpperCase().startsWith("LK-") ? trimmed : `LK-${trimmed}`;
}

/** ISO with offset → `yyyy-MM-dd HH:mm` in the viewer's local time. */
function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const pad = (part: number) => String(part).padStart(2, "0");
  return `${String(parsed.getFullYear())}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

/** ISO with offset → `yyyy-MM-dd`, or an em dash when there is no date on record. */
function formatDate(value: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const pad = (part: number) => String(part).padStart(2, "0");
  return `${String(parsed.getFullYear())}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
}

/** "4h 25m" between two ISO stamps; an active lockout reads as in progress. */
function formatDuration(
  startedAt: string,
  removedAt: string | null,
): string {
  const start = new Date(startedAt);
  if (Number.isNaN(start.getTime())) return "—";
  if (!removedAt) return "In progress";

  const end = new Date(removedAt);
  if (Number.isNaN(end.getTime())) return "—";

  const totalMinutes = Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / 60000),
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours)}h ${String(minutes).padStart(2, "0")}m`;
}

export function splitEnergySources(energySources: string): string[] {
  return energySources
    .split(",")
    .map((source) => source.trim())
    .filter((source) => source !== "");
}

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]!.charAt(0)}${parts.at(-1)!.charAt(0)}`.toUpperCase();
}

export function toLotoEquipmentItem(
  dto: LotoEquipmentGridRowDto,
): LotoEquipmentItem {
  return {
    id: dto.id,
    equipmentCode: withEquipmentPrefix(dto.equipmentCode),
    name: dto.name,
    location: dto.location,
    energySources: splitEnergySources(dto.energySources),
    status: dto.status,
    lastInspection: formatDate(dto.lastInspectionAt),
  };
}

export function toLotoActiveLockout(dto: LotoLockoutRowDto): LotoActiveLockout {
  return {
    id: dto.id,
    logCode: dto.logCode,
    equipmentId: dto.lotoEquipmentId,
    equipmentName: dto.equipmentName,
    purpose: dto.purpose,
    operator: dto.operatorName,
    lockNumber: withLockPrefix(dto.lockNumber),
    startedAt: formatDateTime(dto.startedAt),
    expectedEndAt: formatDateTime(dto.expectedCompletionAt),
    canRemove: dto.canRemove,
  };
}

export function toLotoHistoryRecord(dto: LotoLockoutRowDto): LotoHistoryRecord {
  return {
    id: dto.id,
    logId: dto.logCode,
    equipment: dto.equipmentName,
    operator: dto.operatorName,
    lockNumber: withLockPrefix(dto.lockNumber),
    startAt: formatDateTime(dto.startedAt),
    endAt: dto.status === "Active" ? "In progress" : formatDateTime(dto.removedAt),
    purpose: dto.purpose,
    duration: formatDuration(dto.startedAt, dto.removedAt),
    result: dto.status,
  };
}

export function toLotoPersonnel(dto: LotoPersonnelDto): LotoPersonnel {
  return {
    id: dto.userId,
    name: dto.fullName,
    initials: initialsFor(dto.fullName),
    certifiedOn: formatDate(dto.certifiedAt),
    expiresOn: formatDate(dto.expiresAt),
    equipmentIds: dto.equipment.map(withEquipmentPrefix),
    status: dto.status,
  };
}

/** GET /api/Loto/dashboard-kpis → the equipment tab's KPI strip. */
export function toLotoMetrics(kpis: LotoDashboardKpisDto): LotoMetric[] {
  return [
    {
      title: "Equipment on File",
      value: kpis.equipmentOnFile,
      description: "Registered for lockout",
      icon: "mdi:cog-outline",
    },
    {
      title: "Active Lockouts",
      value: kpis.activeLockouts,
      description: "Currently locked out",
      icon: "mdi:lock-outline",
    },
    {
      title: "Authorized Personnel",
      value: kpis.authorizedPersonnel,
      description: "Trained and certified",
      icon: "mdi:account-check-outline",
    },
    {
      title: "Available Equipment",
      value: kpis.availableEquipment,
      description: "Ready to lock out",
      icon: "mdi:check-circle-outline",
    },
  ];
}

/** Composes the equipment detail view from the detail DTO plus the machine's history rows. */
export function toLotoEquipmentDetail(
  dto: LotoEquipmentDetailDto,
  history: readonly LotoLockoutRowDto[],
): LotoEquipmentDetail {
  const historyRecords = history.map(toLotoHistoryRecord);

  const recentLockouts: LotoRecentLockout[] = history.slice(0, 3).map((row) => ({
    id: row.id,
    purpose: row.purpose,
    operator: row.operatorName,
    date: formatDate(row.startedAt),
    duration: formatDuration(row.startedAt, row.removedAt),
  }));

  return {
    id: dto.id,
    equipmentCode: withEquipmentPrefix(dto.equipmentCode),
    name: dto.name,
    location: dto.location,
    locationId: dto.locationId,
    status: dto.status,
    hazardLevel: dto.hazardLevel ?? "",
    description: dto.description ?? "",
    additionalNotes: dto.additionalNotes ?? "",
    isOutOfService: dto.isOutOfService,
    lastInspection: formatDate(dto.lastInspectionAt),
    lastInspectionAt: dto.lastInspectionAt,
    energySources: splitEnergySources(dto.energySources),
    authorizedPersonnel: dto.authorizedPersonnel.map((person) => ({
      id: person.userId,
      name: person.fullName,
      initials: initialsFor(person.fullName),
    })),
    procedureSteps: dto.steps.map((step, index) => ({
      id: `step-${String(index + 1)}`,
      tag: step.energyType ?? "Step",
      description: step.description,
      isolationPoint: step.isolationPoint ?? "",
      lockTagPosition: step.lockTagPosition ?? "",
    })),
    recentLockouts,
    history: historyRecords,
    canApply: dto.canApply,
    cannotApplyReason: dto.cannotApplyReason,
  };
}
