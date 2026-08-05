import type {
  CreateBbsObservationRequestDto,
  UpdateBbsObservationRequestDto,
} from "@/dtos/req/bbs-request.dto";
import type {
  BbsAtRiskCategoriesDto,
  BbsDashboardKpiDto,
  BbsGraphDto,
  BbsObservationDto,
  BehaviorCategoryDto,
} from "@/dtos/res/bbs-response.dto";
import type { ObservationFormValues } from "@/components/bbs/log/observation-form-schema";
import type {
  BehaviorCategory,
  BbsSession,
  EngagementPoint,
  ObservationDetail,
  ObservationPhoto,
} from "@/app/dashboard/bbs/bbs-data";
import type { FormValues } from "@/components/form-builder";
import type { StatMetricCardProps } from "@/components/StatMetricCard";

const OBSERVE_LABEL_BY_VALUE: Record<string, string> = {
  safe: "Safe",
  "at-risk": "At-Risk",
};

function formatObservationDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatObservationTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function toObservationType(observe: string): ObservationDetail["type"] {
  return observe.trim().toLowerCase() === "safe" ? "Safe" : "At-Risk";
}

function toObservationPhoto(photoUrl: string): ObservationPhoto | null {
  const url = photoUrl.trim();
  if (!url) return null;

  const fileName = url.split("/").pop()?.split("?")[0] || "photo.jpg";

  return {
    name: decodeURIComponent(fileName),
    size: "Photo",
    url,
  };
}

/** API observation → detail page model. */
export function toObservationDetail(dto: BbsObservationDto): ObservationDetail {
  const photo = toObservationPhoto(dto.photoUrl ?? "");

  return {
    id: `BBS-${String(dto.id)}`,
    observer: dto.userName?.trim() || "—",
    date: formatObservationDate(dto.createdAt),
    time: formatObservationTime(dto.createdAt),
    location: dto.location?.trim() || "—",
    category: dto.categoryName?.trim() || "—",
    type: toObservationType(dto.observe ?? ""),
    observed: dto.description?.trim() || "—",
    photos: photo ? [photo] : [],
  };
}

/** Category names for the log-observation suggestion menu. */
export function toBehaviorCategorySuggestions(
  categories: readonly BehaviorCategoryDto[],
): string[] {
  return [...categories]
    .filter((category) => category.isActive !== false && category.name.trim())
    .sort((left, right) => {
      const leftOrder = left.displayOrder ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = right.displayOrder ?? Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.name.localeCompare(right.name);
    })
    .map((category) => category.name);
}

export function toBehaviorCategoryId(
  categoryName: string,
  categories: readonly BehaviorCategoryDto[],
): number | null {
  const normalized = categoryName.trim().toLowerCase();
  if (!normalized) return null;

  const match = categories.find(
    (category) =>
      category.id !== undefined &&
      category.name.trim().toLowerCase() === normalized,
  );

  return match?.id ?? null;
}

export function toCreateBbsObservationRequest(
  values: ObservationFormValues,
  categories: readonly BehaviorCategoryDto[],
): CreateBbsObservationRequestDto | null {
  const behaviorCategoryId = toBehaviorCategoryId(values.category, categories);
  if (behaviorCategoryId === null) return null;

  return {
    observe:
      OBSERVE_LABEL_BY_VALUE[values.observationType] ?? values.observationType,
    behaviorCategoryId,
    location: values.location.trim(),
    description: values.description.trim(),
    photoUrl: values.photos[0] ?? "",
  };
}

function asString(value: FormValues[string] | undefined): string {
  return typeof value === "string" ? value : "";
}

function asStringList(value: FormValues[string] | undefined): string[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Edit form values → PUT /api/bbs body (id first).
 * Falls back to `fallbackCategoryId` when the selected name is not in the
 * categories list (e.g. categories still loading / unchanged from GET).
 */
export function toUpdateBbsObservationRequest(
  id: number,
  values: FormValues,
  categories: readonly BehaviorCategoryDto[],
  fallbackCategoryId?: number | null,
): UpdateBbsObservationRequestDto | null {
  const category = asString(values.category).trim();
  const behaviorCategoryId =
    toBehaviorCategoryId(category, categories) ?? fallbackCategoryId ?? null;

  if (behaviorCategoryId === null) return null;

  const observeRaw = asString(values.type).trim();
  const observe =
    OBSERVE_LABEL_BY_VALUE[observeRaw.toLowerCase()] ?? observeRaw;

  return {
    id,
    observe,
    behaviorCategoryId,
    location: asString(values.location).trim(),
    description: asString(values.observed).trim(),
    photoUrl: asStringList(values.photos)[0] ?? "",
  };
}

/** API observation row → recent-sessions table row. */
export function toBbsSession(dto: BbsObservationDto): BbsSession {
  return {
    id: `BBS-${String(dto.id)}`,
    type: dto.observe?.trim() || "Observation",
    observer: dto.userName?.trim() || "—",
    location: dto.location?.trim() || "—",
    behaviors: dto.categoryName?.trim() || "—",
    safePercent: dto.observe?.trim().toLowerCase() === "safe" ? 100 : 0,
  };
}

export function toBbsSessions(
  observations: readonly BbsObservationDto[],
): BbsSession[] {
  return observations.map(toBbsSession);
}

/** Dashboard KPI payload → StatMetricCard props. */
export function toBbsMetricCards(
  kpi: BbsDashboardKpiDto | null | undefined,
): readonly StatMetricCardProps[] {
  const total = kpi?.totalBbsCount ?? 0;
  const safe = kpi?.safeBehaviourCount ?? 0;
  const atRisk = kpi?.atRiskCount ?? 0;
  const safePercent = total > 0 ? Math.round((safe / total) * 100) : 0;

  return [
    {
      title: "Observations (30d)",
      value: total,
    },
    {
      title: "Safe behavior %",
      value: `${String(safePercent)}%`,
    },
    {
      title: "At risk",
      value: atRisk,
    },
  ];
}

/** At-risk categories payload -> card rows (highest count first). */
export function toBbsAtRiskBehaviors(
  payload: BbsAtRiskCategoriesDto | null | undefined,
): readonly BehaviorCategory[] {
  const categories = payload?.categories ?? [];

  return [...categories]
    .map(
      (category): BehaviorCategory => ({
        label: category.categoryName?.trim() || "-",
        count: category.count ?? 0,
        tone: "risk",
      }),
    )
    .sort((left, right) => right.count - left.count);
}

function toWeekLabel(weekStart: string, index: number): string {
  const date = new Date(weekStart);
  if (Number.isNaN(date.getTime())) {
    return `W${String(index + 1)}`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Graph payload -> engagement chart points. */
export function toBbsEngagementPoints(
  payload: BbsGraphDto | null | undefined,
): readonly EngagementPoint[] {
  const points = payload?.graph ?? [];

  return points.map((point, index) => ({
    label: toWeekLabel(point.weekStart, index),
    safe: point.safe ?? 0,
    atRisk: point.atRisk ?? 0,
  }));
}
