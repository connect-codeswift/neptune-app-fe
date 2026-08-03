import type {
  ComplianceCalendarEventDto,
  ComplianceCategoryStatDto,
  ComplianceDashboardKpisDto,
  ComplianceDto,
  ComplianceUpcomingFilingDto,
  GetAllCompliancesResultDto,
} from "@/dtos/res/compliance-response.dto";
import type {
  ComplianceCategoryProgress,
  ComplianceKpiItem,
  ComplianceObligationDetail,
  ComplianceObligationItem,
  CalendarEventItem,
  UpcomingFilingItem,
} from "@/components/regulatory-compliance/regulatory-compliance-types";
import type {
  AddComplianceRequestDto,
  GetAllCompliancesRequestDto,
  UpdateComplianceRequestDto,
} from "@/dtos/req/compliance-request.dto";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNumber(
  record: Record<string, unknown>,
  ...keys: string[]
): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }
  return null;
}

function readString(
  record: Record<string, unknown>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

const CATEGORY_PROGRESS_COLORS = [
  "var(--ehs-navy)",
  "var(--ehs-normal-blue)",
  "var(--ehs-darker)",
  "#0891a6",
  "#566072",
] as const;

/** Normalizes one category-stat row (camelCase or PascalCase). */
export function normalizeComplianceCategoryStatDto(
  raw: unknown,
): ComplianceCategoryStatDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  const category = readString(
    raw,
    "category",
    "Category",
    "categoryName",
    "CategoryName",
  );
  const compliant = readNumber(
    raw,
    "compliant",
    "Compliant",
    "compliantCount",
    "CompliantCount",
    "current",
    "Current",
  );
  const total = readNumber(
    raw,
    "total",
    "Total",
    "totalCount",
    "TotalCount",
    "obligationsTracked",
    "ObligationsTracked",
  );

  if (!category && compliant == null && total == null) {
    return null;
  }

  return {
    category: category ?? "Uncategorized",
    compliant,
    total,
  };
}

/** Normalizes GET /api/Compliance/category-stats list payload. */
export function normalizeComplianceCategoryStatsList(
  raw: unknown,
): ComplianceCategoryStatDto[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((entry) => normalizeComplianceCategoryStatDto(entry))
    .filter((entry): entry is ComplianceCategoryStatDto => entry != null);
}
/** Normalizes dashboard KPI payload (camelCase or PascalCase). */
export function normalizeComplianceDashboardKpisDto(
  raw: unknown,
): ComplianceDashboardKpisDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  return {
    obligationsTracked: readNumber(
      raw,
      "obligationsTracked",
      "ObligationsTracked",
    ),
    compliant: readNumber(raw, "compliant", "Compliant"),
    dueIn60Days: readNumber(raw, "dueIn60Days", "DueIn60Days"),
    actionRequired: readNumber(raw, "actionRequired", "ActionRequired"),
  };
}

function asCount(value: number | null | undefined): number {
  if (value == null || !Number.isFinite(value)) {
    return 0;
  }
  return value;
}

/** Maps GET /api/Compliance/dashboard-kpis into the four dashboard cards. */
export function mapComplianceDashboardKpisToItems(
  dto: ComplianceDashboardKpisDto | null | undefined,
): readonly ComplianceKpiItem[] {
  return [
    {
      id: "obligations-tracked",
      label: "OBLIGATIONS TRACKED",
      count: asCount(dto?.obligationsTracked),
      badgeValue: "",
      badgeTone: "green",
    },
    {
      id: "compliant",
      label: "COMPLIANT",
      count: asCount(dto?.compliant),
      badgeValue: "",
      badgeTone: "green",
    },
    {
      id: "due-in-60-days",
      label: "DUE IN 60 DAYS",
      count: asCount(dto?.dueIn60Days),
      badgeValue: "",
      badgeTone: "coral",
    },
    {
      id: "action-required",
      label: "ACTION REQUIRED",
      count: asCount(dto?.actionRequired),
      badgeValue: "",
      badgeTone: "green",
    },
  ];
}

/** Maps GET /api/Compliance/category-stats into By Category progress rows. */
export function mapComplianceCategoryStatsToProgress(
  stats: readonly ComplianceCategoryStatDto[] | null | undefined,
): readonly ComplianceCategoryProgress[] {
  return (stats ?? []).map((stat, index) => {
    const current = asCount(stat.compliant);
    const total = Math.max(asCount(stat.total), current);
    const category = stat.category?.trim() || "Uncategorized";
    const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    return {
      id: slug || `category-${String(index)}`,
      category,
      current,
      total,
      colorHex:
        CATEGORY_PROGRESS_COLORS[index % CATEGORY_PROGRESS_COLORS.length] ??
        "var(--ehs-normal-blue)",
    };
  });
}

function readStringArray(
  record: Record<string, unknown>,
  ...keys: string[]
): readonly string[] {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value.filter(
        (entry): entry is string => typeof entry === "string",
      );
    }
  }
  return [];
}

/** Normalizes one compliance row (camelCase or PascalCase). */
export function coerceComplianceDto(
  raw: Record<string, unknown>,
): ComplianceDto {
  return {
    id:
      readNumber(raw, "id", "Id", "complianceId", "ComplianceId") ?? undefined,
    code: readString(raw, "code", "Code"),
    title: readString(raw, "title", "Title"),
    category: readString(raw, "category", "Category"),
    jurisdiction: readString(raw, "jurisdiction", "Jurisdiction"),
    regulatoryBody: readString(raw, "regulatoryBody", "RegulatoryBody"),
    dueDate: readString(raw, "dueDate", "DueDate"),
    nextDue: readString(raw, "nextDue", "NextDue"),
    recurrence: readString(raw, "recurrence", "Recurrence"),
    responsiblePersonId:
      readNumber(raw, "responsiblePersonId", "ResponsiblePersonId") ??
      undefined,
    responsiblePerson: readString(
      raw,
      "responsiblePerson",
      "ResponsiblePerson",
    ),
    priority: readString(raw, "priority", "Priority"),
    status: readString(raw, "status", "Status"),
    completedDate: readString(raw, "completedDate", "CompletedDate"),
    evidenceUrls: readStringArray(raw, "evidenceUrls", "EvidenceUrls"),
    markComplete:
      typeof raw.markComplete === "boolean"
        ? raw.markComplete
        : typeof raw.MarkComplete === "boolean"
          ? raw.MarkComplete
          : undefined,
  };
}

/** Normalizes GET /api/Compliance/{id} envelope into a single ComplianceDto. */
export function normalizeComplianceByIdResponse(
  data: unknown,
): ComplianceDto | null {
  if (isRecord(data) && isRecord(data.dataModel)) {
    const dto = coerceComplianceDto(data.dataModel);
    if (dto.id == null && !dto.title?.trim() && !dto.code?.trim()) {
      return null;
    }
    return dto;
  }

  if (isRecord(data) && isRecord(data.DataModel)) {
    const dto = coerceComplianceDto(data.DataModel);
    if (dto.id == null && !dto.title?.trim() && !dto.code?.trim()) {
      return null;
    }
    return dto;
  }

  if (isRecord(data)) {
    const dto = coerceComplianceDto(data);
    if (dto.id == null && !dto.title?.trim() && !dto.code?.trim()) {
      return null;
    }
    return dto;
  }

  return null;
}

function normalizeDetailStatus(
  value: string | null | undefined,
): ComplianceObligationDetail["status"] {
  const normalized = value?.trim().toLowerCase() ?? "";
  if (normalized.includes("action")) {
    return "Action Required";
  }
  if (normalized.includes("due")) {
    return "Due Soon";
  }
  return "Compliant";
}

function normalizeDetailPriority(
  value: string | null | undefined,
): ComplianceObligationDetail["priority"] {
  const normalized = value?.trim().toLowerCase() ?? "";
  if (normalized.includes("high")) {
    return "High";
  }
  if (normalized.includes("low")) {
    return "Low";
  }
  return "Medium";
}

function formatCompletedDate(value: string | null | undefined): string {
  if (!value?.trim()) {
    return "Not yet completed";
  }
  return formatIsoDate(value);
}

export type MapComplianceDtoToObligationDetailOptions = Readonly<{
  responsibleName?: string;
}>;

/** Maps GET /api/Compliance/{id} into the obligation detail view model. */
export function mapComplianceDtoToObligationDetail(
  dto: ComplianceDto,
  options: MapComplianceDtoToObligationDetailOptions = {},
): ComplianceObligationDetail {
  const category = dto.category?.trim() || "—";
  const regulatoryBody = dto.regulatoryBody?.trim() || "—";
  const subtitleParts = [category, regulatoryBody].filter(
    (part) => part !== "—",
  );

  return {
    id: dto.id != null ? String(dto.id) : "",
    code: dto.code?.trim() || "—",
    title: dto.title?.trim() || dto.code?.trim() || "Untitled obligation",
    subtitle: subtitleParts.join(" · ") || "—",
    status: normalizeDetailStatus(dto.status),
    category,
    recurrence: dto.recurrence?.trim() || "—",
    regulatoryBody,
    dueDate: formatIsoDate(dto.dueDate ?? dto.nextDue),
    responsible:
      dto.responsiblePerson?.trim() || options.responsibleName?.trim() || "—",
    priority: normalizeDetailPriority(dto.priority),
    completedDate: formatCompletedDate(dto.completedDate),
  };
}

function asComplianceArray(value: unknown): ComplianceDto[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isRecord).map((entry) => coerceComplianceDto(entry));
}

/** Normalizes POST /api/Compliance/GetAllCompliances response. */
export function normalizeGetAllCompliancesResponse(
  data: unknown,
  request: GetAllCompliancesRequestDto,
): GetAllCompliancesResultDto {
  if (Array.isArray(data)) {
    const items = asComplianceArray(data);
    return {
      items,
      totalCount: items.length,
      pageNumber: request.pageNumber,
      pageSize: request.pageSize,
    };
  }

  if (!isRecord(data)) {
    return {
      items: [],
      totalCount: 0,
      pageNumber: request.pageNumber,
      pageSize: request.pageSize,
    };
  }

  const dataModel = isRecord(data.dataModel)
    ? data.dataModel
    : isRecord(data.DataModel)
      ? data.DataModel
      : null;
  const nestedData = isRecord(data.data) ? data.data : null;
  const page = dataModel ?? nestedData;

  const items = asComplianceArray(
    (page && (page.data ?? page.Data ?? page.items ?? page.Items)) ??
      data.items ??
      data.Items ??
      data.data ??
      data.result ??
      data.Result ??
      data.compliances ??
      data.Compliances ??
      data.records ??
      data.Records,
  );

  const totalCountRaw =
    (page &&
      (page.totalRecords ??
        page.TotalRecords ??
        page.totalCount ??
        page.TotalCount ??
        page.total ??
        page.count)) ??
    data.totalCount ??
    data.TotalCount ??
    data.total ??
    data.count;
  const totalCount =
    typeof totalCountRaw === "number" && Number.isFinite(totalCountRaw)
      ? totalCountRaw
      : items.length;

  const pageNumberRaw =
    (page && (page.pageNumber ?? page.PageNumber)) ??
    data.pageNumber ??
    data.PageNumber;
  const pageSizeRaw =
    (page && (page.pageSize ?? page.PageSize)) ??
    data.pageSize ??
    data.PageSize;

  return {
    items,
    totalCount,
    pageNumber:
      typeof pageNumberRaw === "number" ? pageNumberRaw : request.pageNumber,
    pageSize: typeof pageSizeRaw === "number" ? pageSizeRaw : request.pageSize,
  };
}

function formatIsoDate(value: string | null | undefined): string {
  if (!value?.trim()) {
    return "—";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 10);
  }
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${String(year)}-${month}-${day}`;
}

function formatMonthDay(value: string | null | undefined): string {
  if (!value?.trim()) {
    return "—";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value.slice(5, 10).replace("/", "-");
  }
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}

function normalizeJurisdiction(
  value: string | null | undefined,
): ComplianceObligationItem["jurisdiction"] {
  const normalized = value?.trim().toLowerCase() ?? "";
  if (normalized.includes("state")) {
    return "State";
  }
  if (normalized.includes("local")) {
    return "Local";
  }
  return "Federal";
}

function normalizeObligationStatus(
  value: string | null | undefined,
): ComplianceObligationItem["status"] {
  const normalized = value?.trim().toLowerCase() ?? "";
  if (normalized.includes("action")) {
    return "Action required";
  }
  if (normalized.includes("due")) {
    return "Due soon";
  }
  return "Compliant";
}

function evidenceLabel(dto: ComplianceDto): string {
  const count = dto.evidenceUrls?.length ?? 0;
  if (count === 0) {
    return "—";
  }
  return count === 1 ? "1 doc" : `${String(count)} docs`;
}

/** Maps ComplianceDto rows into register table rows. */
export function mapComplianceDtosToObligationItems(
  items: readonly ComplianceDto[],
): readonly ComplianceObligationItem[] {
  return items.flatMap((dto) => {
    if (dto.id == null) {
      return [];
    }

    const status = normalizeObligationStatus(dto.status);

    return [
      {
        id: String(dto.id),
        code: dto.code?.trim() || "—",
        obligation:
          dto.title?.trim() || dto.code?.trim() || "Untitled obligation",
        jurisdiction: normalizeJurisdiction(dto.jurisdiction),
        status,
        nextDue: formatIsoDate(dto.nextDue ?? dto.dueDate),
        evidenceText: evidenceLabel(dto),
        isHighlighted: status === "Action required",
      },
    ];
  });
}

export type CompliancesListQueryData = GetAllCompliancesResultDto & {
  records: readonly ComplianceObligationItem[];
};

/** Applies a successful PUT /Compliance/Update to cached register rows. */
export function patchComplianceListQueryData(
  current: CompliancesListQueryData | undefined,
  update: Pick<
    UpdateComplianceRequestDto,
    "id" | "status" | "completedDate" | "nextDue" | "dueDate"
  >,
): CompliancesListQueryData | undefined {
  if (!current) {
    return current;
  }

  const nextStatus = normalizeObligationStatus(update.status);
  const nextDueValue = update.nextDue ?? update.dueDate;
  const formattedNextDue = nextDueValue
    ? formatIsoDate(nextDueValue)
    : undefined;

  return {
    ...current,
    items: current.items.map((item) =>
      item.id === update.id
        ? {
            ...item,
            status: update.status,
            completedDate: update.completedDate,
            nextDue: update.nextDue ?? item.nextDue,
            dueDate: update.dueDate ?? item.dueDate,
          }
        : item,
    ),
    records: current.records.map((item) =>
      item.id === String(update.id)
        ? {
            ...item,
            status: nextStatus,
            nextDue: formattedNextDue ?? item.nextDue,
            isHighlighted: nextStatus === "Action required",
          }
        : item,
    ),
  };
}

function filingBadge(
  dto: ComplianceUpcomingFilingDto,
): Pick<UpcomingFilingItem, "badgeLabel" | "badgeTone"> {
  const status = dto.status?.trim().toLowerCase() ?? "";
  if (status.includes("action")) {
    return { badgeLabel: "Action", badgeTone: "action" };
  }

  const jurisdiction = normalizeJurisdiction(dto.jurisdiction);
  if (jurisdiction === "State") {
    return { badgeLabel: "State", badgeTone: "state" };
  }
  if (jurisdiction === "Local") {
    return { badgeLabel: "Local", badgeTone: "local" };
  }
  return { badgeLabel: "Federal", badgeTone: "federal" };
}

/** Normalizes one upcoming filing row. */
export function normalizeComplianceUpcomingFilingDto(
  raw: unknown,
): ComplianceUpcomingFilingDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  const id = readNumber(raw, "id", "Id");
  const title = readString(raw, "title", "Title");
  const code = readString(raw, "code", "Code");
  const dueDate = readString(raw, "dueDate", "DueDate");
  const nextDue = readString(raw, "nextDue", "NextDue");
  const jurisdiction = readString(raw, "jurisdiction", "Jurisdiction");
  const responsiblePerson = readString(
    raw,
    "responsiblePerson",
    "ResponsiblePerson",
  );
  const status = readString(raw, "status", "Status");
  const regulatoryBody = readString(raw, "regulatoryBody", "RegulatoryBody");

  if (
    id == null &&
    !title?.trim() &&
    !code?.trim() &&
    !dueDate?.trim() &&
    !nextDue?.trim()
  ) {
    return null;
  }

  return {
    id: id ?? undefined,
    title,
    code,
    dueDate,
    nextDue,
    jurisdiction,
    responsiblePerson,
    status,
    regulatoryBody,
  };
}

export function normalizeComplianceUpcomingFilingsList(
  raw: unknown,
): ComplianceUpcomingFilingDto[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((entry) => normalizeComplianceUpcomingFilingDto(entry))
    .filter((entry): entry is ComplianceUpcomingFilingDto => entry != null);
}

/** Maps GET /api/Compliance/upcoming-filings into sidebar rows. */
export function mapComplianceUpcomingFilingsToItems(
  filings: readonly ComplianceUpcomingFilingDto[] | null | undefined,
): readonly UpcomingFilingItem[] {
  return (filings ?? []).flatMap((filing, index) => {
    const badge = filingBadge(filing);
    const title =
      filing.title?.trim() ||
      filing.code?.trim() ||
      filing.regulatoryBody?.trim() ||
      "Upcoming filing";

    return [
      {
        id:
          filing.id != null
            ? String(filing.id)
            : `upcoming-filing-${String(index)}`,
        date: formatMonthDay(filing.nextDue ?? filing.dueDate),
        title,
        responsiblePerson: filing.responsiblePerson?.trim() || undefined,
        badgeLabel: badge.badgeLabel,
        badgeTone: badge.badgeTone,
      },
    ];
  });
}

function calendarChipTone(
  status: string | null | undefined,
): CalendarEventItem["chipTone"] {
  const normalized = status?.trim().toLowerCase() ?? "";
  if (normalized.includes("action")) {
    return "pink";
  }
  return "cyan";
}

function truncateCalendarTitle(value: string, maxLength = 22): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength - 1)}…`;
}

/** Normalizes one calendar event row. */
export function normalizeComplianceCalendarEventDto(
  raw: unknown,
): ComplianceCalendarEventDto | null {
  if (!isRecord(raw)) {
    return null;
  }

  const id = readNumber(raw, "id", "Id");
  const title = readString(raw, "title", "Title");
  const code = readString(raw, "code", "Code");
  const dueDate = readString(raw, "dueDate", "DueDate");
  const nextDue = readString(raw, "nextDue", "NextDue");
  const jurisdiction = readString(raw, "jurisdiction", "Jurisdiction");
  const status = readString(raw, "status", "Status");
  const regulatoryBody = readString(raw, "regulatoryBody", "RegulatoryBody");
  const category = readString(raw, "category", "Category");

  if (id == null && !title && !code && !dueDate && !nextDue) {
    return null;
  }

  return {
    id: id ?? undefined,
    title,
    code,
    dueDate,
    nextDue,
    jurisdiction,
    status,
    regulatoryBody,
    category,
  };
}

export function normalizeComplianceCalendarEventsList(
  raw: unknown,
): ComplianceCalendarEventDto[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((entry) => normalizeComplianceCalendarEventDto(entry))
    .filter((entry): entry is ComplianceCalendarEventDto => entry != null);
}

/** Maps GET /api/Compliance/calendar rows into month grid events. */
export function mapComplianceCalendarEventsToItems(
  events: readonly ComplianceCalendarEventDto[] | null | undefined,
): readonly CalendarEventItem[] {
  return (events ?? []).flatMap((event, index) => {
    const dueValue = event.nextDue ?? event.dueDate;
    if (!dueValue?.trim()) {
      return [];
    }

    const parsed = new Date(dueValue);
    if (Number.isNaN(parsed.getTime())) {
      return [];
    }

    const title =
      event.title?.trim() ||
      event.code?.trim() ||
      event.regulatoryBody?.trim() ||
      "Compliance event";

    return [
      {
        id:
          event.id != null
            ? String(event.id)
            : `calendar-event-${String(index)}`,
        day: parsed.getDate(),
        month: parsed.getMonth(),
        year: parsed.getFullYear(),
        title: truncateCalendarTitle(title),
        chipTone: calendarChipTone(event.status),
      },
    ];
  });
}

/** Inclusive month bounds as ISO date-time strings for GET /api/Compliance/calendar. */
export function getComplianceCalendarMonthRange(activeStartDate: Date): {
  startDate: string;
  endDate: string;
} {
  const start = new Date(
    activeStartDate.getFullYear(),
    activeStartDate.getMonth(),
    1,
    0,
    0,
    0,
    0,
  );
  const end = new Date(
    activeStartDate.getFullYear(),
    activeStartDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

/** Converts an HTML date input value (YYYY-MM-DD) to ISO date-time. */
export function dateInputToIsoDateTime(dateInput: string): string {
  const [yearPart, monthPart, dayPart] = dateInput.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return new Date(dateInput).toISOString();
  }

  return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
}

export type BuildAddComplianceRequestInput = Readonly<{
  title: string;
  category: string;
  code: string;
  jurisdiction: string;
  regulatoryBody: string;
  dueDate: string;
  recurrence: string;
  responsiblePersonId: number;
  priority: string;
  evidenceUrls: readonly string[];
}>;

/** Maps add-obligation form values into POST /api/Compliance/AddCompliance body. */
export function buildAddComplianceRequest(
  input: BuildAddComplianceRequestInput,
): AddComplianceRequestDto {
  return {
    title: input.title.trim(),
    category: input.category.trim(),
    code: input.code.trim(),
    jurisdiction: input.jurisdiction.trim(),
    regulatoryBody: input.regulatoryBody.trim(),
    dueDate: dateInputToIsoDateTime(input.dueDate),
    recurrence: input.recurrence.trim(),
    responsiblePersonId: input.responsiblePersonId,
    priority: input.priority.trim(),
    evidenceUrls: [...input.evidenceUrls],
  };
}

function toIsoDateTime(
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value?.trim()) {
    return fallback;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString();
}

/** Maps a ComplianceDto into PUT /api/Compliance/Update body. */
export function buildUpdateComplianceRequest(
  dto: ComplianceDto,
  overrides: Partial<UpdateComplianceRequestDto> = {},
): UpdateComplianceRequestDto {
  const now = new Date().toISOString();
  const dueDate = toIsoDateTime(dto.dueDate, now);
  const nextDue = toIsoDateTime(dto.nextDue ?? dto.dueDate, dueDate);
  const completedDate = toIsoDateTime(dto.completedDate, now);
  const id = overrides.id ?? dto.id;

  if (id == null || id <= 0) {
    throw new Error("Compliance id is required to update an obligation.");
  }

  return {
    id,
    code: dto.code?.trim() ?? "",
    title: dto.title?.trim() ?? "",
    category: dto.category?.trim() ?? "",
    jurisdiction: dto.jurisdiction?.trim() ?? "",
    regulatoryBody: dto.regulatoryBody?.trim() ?? "",
    dueDate,
    nextDue,
    recurrence: dto.recurrence?.trim() ?? "",
    responsiblePersonId: dto.responsiblePersonId ?? 0,
    responsiblePerson: dto.responsiblePerson?.trim() ?? "",
    priority: dto.priority?.trim() ?? "",
    status: dto.status?.trim() ?? "",
    completedDate,
    evidenceUrls: [...(dto.evidenceUrls ?? [])],
    markComplete: dto.markComplete ?? false,
    ...overrides,
    id,
  };
}

/** Builds PUT /api/Compliance/Update payload for Mark as Complete. */
export function buildMarkCompleteComplianceRequest(
  dto: ComplianceDto,
  complianceId: number,
): UpdateComplianceRequestDto {
  const now = new Date().toISOString();

  return buildUpdateComplianceRequest(
    { ...dto, id: complianceId },
    {
      id: complianceId,
      status: "Compliant",
      completedDate: now,
      markComplete: true,
    },
  );
}
