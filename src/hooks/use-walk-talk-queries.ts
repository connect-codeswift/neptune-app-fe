import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { WalkTalkSessionDto } from "@/dtos/res/walk-talk-response.dto";
import { toWalkTalkSessions } from "@/lib/map-walk-talk";
import {
  getWalkTalkDashboardCounts,
  getWalkTalkGraph,
  getWalkTalkParticipants,
  getWalkTalkSessionById,
  getWalkTalkSessions,
  getWalkTalkTopFindings,
} from "@/services/walk-talk.service";

export const DEFAULT_WALK_TALK_PAGE_NUMBER = 1;
export const DEFAULT_WALK_TALK_PAGE_SIZE = 5;
export const DEFAULT_WALK_TALK_GRAPH_WEEKS = 12;

function toSessionsPage(payload: unknown): {
  items: WalkTalkSessionDto[];
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
} {
  if (Array.isArray(payload)) {
    return {
      items: payload as WalkTalkSessionDto[],
      totalRecords: payload.length,
      pageNumber: DEFAULT_WALK_TALK_PAGE_NUMBER,
      pageSize: DEFAULT_WALK_TALK_PAGE_SIZE,
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
      ? (page.data as WalkTalkSessionDto[])
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
          : DEFAULT_WALK_TALK_PAGE_NUMBER,
      pageSize:
        typeof page.pageSize === "number"
          ? page.pageSize
          : DEFAULT_WALK_TALK_PAGE_SIZE,
    };
  }

  return {
    items: [],
    totalRecords: 0,
    pageNumber: DEFAULT_WALK_TALK_PAGE_NUMBER,
    pageSize: DEFAULT_WALK_TALK_PAGE_SIZE,
  };
}

/** Fetches GET /api/walkandtalk/participants for the log form. */
export function useWalkTalkParticipantsQuery() {
  return useQuery({
    queryKey: ["walkandtalk", "participants"] as const,
    queryFn: () => getWalkTalkParticipants(),
  });
}

/** Fetches GET /api/walkandtalk/dashboard-counts for StatMetricCards. */
export function useWalkTalkDashboardCountsQuery() {
  return useQuery({
    queryKey: ["walkandtalk", "dashboard-counts"] as const,
    queryFn: () => getWalkTalkDashboardCounts(),
  });
}

/** Fetches GET /api/walkandtalk/top-findings for the top findings card. */
export function useWalkTalkTopFindingsQuery() {
  return useQuery({
    queryKey: ["walkandtalk", "top-findings"] as const,
    queryFn: () => getWalkTalkTopFindings(),
  });
}

/** Fetches GET /api/walkandtalk/graph for the trends card. */
export function useWalkTalkGraphQuery(
  weeks = DEFAULT_WALK_TALK_GRAPH_WEEKS,
) {
  return useQuery({
    queryKey: ["walkandtalk", "graph", weeks] as const,
    queryFn: () => getWalkTalkGraph(weeks),
  });
}

/** Fetches GET /api/walkandtalk with paging for recent sessions. */
export function useWalkTalkSessionsQuery(
  params: Readonly<{
    pageNumber?: number;
    pageSize?: number;
  }> = {},
) {
  const pageNumber = params.pageNumber ?? DEFAULT_WALK_TALK_PAGE_NUMBER;
  const pageSize = params.pageSize ?? DEFAULT_WALK_TALK_PAGE_SIZE;

  return useQuery({
    queryKey: ["walkandtalk", "list", { pageNumber, pageSize }] as const,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await getWalkTalkSessions({ pageNumber, pageSize });
      const page = toSessionsPage(response.dataModel);
      return {
        ...page,
        sessions: toWalkTalkSessions(page.items),
      };
    },
  });
}

/**
 * Parses list/UI ids like "WT-2", "WIT-2", or "2" into the numeric id the
 * detail endpoint expects.
 */
export function toWalkTalkSessionApiId(
  id: string | null | undefined,
): number | null {
  if (!id) return null;

  const match = /^(?:W(?:IT|T)-)?(\d+)$/i.exec(id.trim());
  if (!match) return null;

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Fetches one session from GET /api/walkandtalk/{id}. */
export function useWalkTalkSessionDetailQuery(sessionId: string | null) {
  const apiId = toWalkTalkSessionApiId(sessionId);
  return useQuery({
    queryKey: ["walkandtalk", "detail", apiId] as const,
    enabled: apiId !== null,
    queryFn: () => getWalkTalkSessionById(apiId ?? 0),
  });
}
