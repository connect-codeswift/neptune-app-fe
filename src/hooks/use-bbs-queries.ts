import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { GetBbsObservationsParams } from "@/dtos/req/bbs-request.dto";
import type {
  BbsObservationDto,
  BehaviorCategoryDto,
} from "@/dtos/res/bbs-response.dto";
import { toBbsSessions } from "@/lib/map-bbs";
import {
  getBbsAtRiskCategories,
  getBbsDashboardKpi,
  getBbsGraph,
  getBbsObservationById,
  getBbsObservations,
  getBehaviorCategories,
} from "@/services/bbs.service";

export const DEFAULT_BBS_PAGE_NUMBER = 1;
export const DEFAULT_BBS_PAGE_SIZE = 10;
export const DEFAULT_BBS_GRAPH_WEEKS = 12;

function toList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];

  if (payload !== null && typeof payload === "object") {
    const nested = (payload as { data?: unknown }).data;
    if (Array.isArray(nested)) return nested as T[];
  }

  return [];
}

function toObservationPage(payload: unknown): {
  items: BbsObservationDto[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
} {
  if (Array.isArray(payload)) {
    return {
      items: payload as BbsObservationDto[],
      totalRecords: payload.length,
      pageNumber: DEFAULT_BBS_PAGE_NUMBER,
      pageSize: DEFAULT_BBS_PAGE_SIZE,
    };
  }

  if (payload !== null && typeof payload === "object") {
    const page = payload as {
      data?: unknown;
      totalRecords?: number;
      pageNumber?: number;
      pageSize?: number;
    };
    const items = Array.isArray(page.data)
      ? (page.data as BbsObservationDto[])
      : [];

    return {
      items,
      totalRecords:
        typeof page.totalRecords === "number"
          ? page.totalRecords
          : items.length,
      pageNumber:
        typeof page.pageNumber === "number"
          ? page.pageNumber
          : DEFAULT_BBS_PAGE_NUMBER,
      pageSize:
        typeof page.pageSize === "number"
          ? page.pageSize
          : DEFAULT_BBS_PAGE_SIZE,
    };
  }

  return {
    items: [],
    totalRecords: 0,
    pageNumber: DEFAULT_BBS_PAGE_NUMBER,
    pageSize: DEFAULT_BBS_PAGE_SIZE,
  };
}

export function useBehaviorCategoriesQuery() {
  return useQuery({
    queryKey: ["bbs", "behavior-categories"] as const,
    queryFn: async () => {
      const response = await getBehaviorCategories();
      return toList<BehaviorCategoryDto>(response.dataModel);
    },
  });
}

/** Fetches GET /api/bbs/dashboard-kpi for the MetricCard row. */
export function useBbsDashboardKpiQuery() {
  return useQuery({
    queryKey: ["bbs", "dashboard-kpi"] as const,
    queryFn: () => getBbsDashboardKpi(),
  });
}

/** Fetches GET /api/bbs/at-risk-categories for the at-risk behaviors card. */
export function useBbsAtRiskCategoriesQuery() {
  return useQuery({
    queryKey: ["bbs", "at-risk-categories"] as const,
    queryFn: () => getBbsAtRiskCategories(),
  });
}

/** Fetches GET /api/bbs/graph for the engagement card. */
export function useBbsGraphQuery(weeks = DEFAULT_BBS_GRAPH_WEEKS) {
  return useQuery({
    queryKey: ["bbs", "graph", weeks] as const,
    queryFn: () => getBbsGraph(weeks),
  });
}

/**
 * Fetches GET /api/bbs/observations. Every filter is the server's job — type,
 * search, category and paging all go over the wire, so a filtered result is the
 * whole matching set rather than whatever survived on the page already loaded.
 */
export function useBbsObservationsQuery(
  params: Readonly<{
    observe?: string;
    search?: string;
    categoryId?: number;
    pageNumber?: number;
    pageSize?: number;
  }> = {},
) {
  const request: GetBbsObservationsParams = {
    observe: params.observe ?? "",
    ...(params.search ? { search: params.search } : {}),
    ...(params.categoryId !== undefined
      ? { categoryId: params.categoryId }
      : {}),
    pageNumber: params.pageNumber ?? DEFAULT_BBS_PAGE_NUMBER,
    pageSize: params.pageSize ?? DEFAULT_BBS_PAGE_SIZE,
  };

  return useQuery({
    queryKey: ["bbs", "list", request] as const,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await getBbsObservations(request);
      const page = toObservationPage(response.dataModel);
      return {
        ...page,
        sessions: toBbsSessions(page.items),
        raw: response,
      };
    },
  });
}

/**
 * Parses list/UI ids like "BBS-2" or "2" into the numeric id the detail
 * endpoint expects.
 */
export function toBbsObservationApiId(
  id: string | null | undefined,
): number | null {
  if (!id) return null;

  const match = /^(?:BBS-)?(\d+)$/i.exec(id.trim());
  if (!match) return null;

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Fetches one observation from GET /api/bbs/{id}. */
export function useBbsObservationDetailQuery(observationId: string | null) {
  const apiId = toBbsObservationApiId(observationId);

  return useQuery({
    queryKey: ["bbs", "detail", apiId] as const,
    enabled: apiId !== null,
    queryFn: () => getBbsObservationById(apiId ?? 0),
  });
}
