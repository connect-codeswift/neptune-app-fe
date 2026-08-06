import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  PpeAcknowledgementEntry,
  PpeCatalogDetail,
  PpeEmployeeProfile,
  PpeIssuanceLogEntry,
  PpeMetric,
} from "@/app/dashboard/ppe-management/ppe-data";
import type {
  PpeIssueDetailDto,
  PpeIssueDto,
  PpeItemDto,
  PpeKpiDto,
} from "@/dtos/res/ppe-response.dto";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { getAccessToken, isApiError } from "@/lib/axios";
import {
  toPpeAcknowledgementEntries,
  toPpeCatalogDetail,
  toPpeEmployeeProfileFromIssue,
  toPpeIssuanceLogEntries,
  toPpeMetricsFromKpi,
} from "@/lib/map-ppe";
import {
  getPpeIssueById,
  getPpeIssuesAssignedTo,
  getPpeIssuesByStatus,
  getPpeItemById,
  getPpeItems,
  getPpeKpi,
} from "@/services/ppe.service";

function toList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];

  if (payload !== null && typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    for (const key of ["data", "Data", "items", "Items"]) {
      if (Array.isArray(record[key])) {
        return record[key] as T[];
      }
    }
  }

  return [];
}

function readDataModel(response: Record<string, unknown>): unknown {
  return response.dataModel ?? response.DataModel ?? response;
}

function subscribeToNothing() {
  return () => undefined;
}

/** False on the server and during the first client render, true afterwards. */
function useIsClientReady(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

/** Route segment as an id the API can address, or null when it isn't one. */
function toNumericId(idParam: string): number | null {
  const trimmed = idParam.trim();
  return /^\d+$/.test(trimmed) ? Number(trimmed) : null;
}

export function usePpeItemsQuery() {
  return useQuery({
    queryKey: ["ppe", "items"] as const,
    queryFn: async () => {
      const response = await getPpeItems();
      return toList<PpeItemDto>(
        readDataModel(response as Record<string, unknown>),
      );
    },
  });
}

/** Loads PPE KPIs via GET /api/ppe/kpi for the management metrics row. */
export function usePpeKpiQuery() {
  const isClientReady = useIsClientReady();
  const hasToken = isClientReady && Boolean(getAccessToken());

  const query = useQuery({
    queryKey: ["ppe", "kpi"] as const,
    enabled: hasToken,
    queryFn: async () => {
      const response = await getPpeKpi();
      const dataModel = readDataModel(response as Record<string, unknown>);

      if (dataModel === null || dataModel === undefined) {
        return toPpeMetricsFromKpi(null);
      }

      if (typeof dataModel !== "object" || Array.isArray(dataModel)) {
        return toPpeMetricsFromKpi(null);
      }

      return toPpeMetricsFromKpi(dataModel as PpeKpiDto);
    },
  });

  if (isClientReady && !hasToken) {
    return {
      metrics: [] as PpeMetric[],
      isLoading: false,
      errorMessage: "Please sign in to load PPE metrics.",
    };
  }

  return {
    metrics: query.data ?? toPpeMetricsFromKpi(null),
    isLoading: !isClientReady || query.isLoading,
    errorMessage: query.isError
      ? getMutationErrorMessage(query.error, "Failed to load PPE metrics.")
      : null,
  };
}

export type PpeCatalogDetailState = Readonly<{
  item: PpeCatalogDetail | null;
  isLoading: boolean;
  errorMessage: string | null;
  isNotFound: boolean;
  refetch: () => void;
}>;

/** Loads one PPE item via GET /api/ppe/{id} for the catalog detail page. */
export function usePpeItemDetailQuery(
  itemIdParam: string,
): PpeCatalogDetailState {
  const isClientReady = useIsClientReady();
  const hasToken = isClientReady && Boolean(getAccessToken());
  const itemId = toNumericId(itemIdParam);

  const query = useQuery({
    queryKey: ["ppe", "detail", itemId ?? -1] as const,
    enabled: hasToken && itemId !== null,
    queryFn: async () => {
      const response = await getPpeItemById(itemId as number);
      const row = readDataModel(response as Record<string, unknown>);

      if (row === null || row === undefined) return null;
      if (typeof row !== "object" || Array.isArray(row)) return null;

      return toPpeCatalogDetail(row as PpeItemDto);
    },
  });

  if (itemId === null) {
    return {
      item: null,
      isLoading: false,
      errorMessage: null,
      isNotFound: true,
      refetch: () => undefined,
    };
  }

  if (isClientReady && !hasToken) {
    return {
      item: null,
      isLoading: false,
      errorMessage: "Please sign in to load this PPE item.",
      isNotFound: false,
      refetch: () => undefined,
    };
  }

  const isNotFound =
    query.data === null ||
    (isApiError(query.error) && query.error.status === 404);

  return {
    item: query.data ?? null,
    isLoading: !isClientReady || query.isLoading,
    errorMessage:
      query.isError && !isNotFound
        ? getMutationErrorMessage(query.error, "Failed to load this PPE item.")
        : null,
    isNotFound,
    refetch: () => void query.refetch(),
  };
}

export type PpeIssueProfileState = Readonly<{
  profile: PpeEmployeeProfile | null;
  isLoading: boolean;
  errorMessage: string | null;
  isNotFound: boolean;
  refetch: () => void;
}>;

/** Loads PPE issues via GET /api/ppe/issue/by-status for the issuance log. */
export function usePpeIssuesByStatusQuery(status?: string) {
  const isClientReady = useIsClientReady();
  const hasToken = isClientReady && Boolean(getAccessToken());

  const query = useQuery({
    queryKey: ["ppe", "issues-by-status", status ?? "all"] as const,
    enabled: hasToken,
    queryFn: async () => {
      const response = await getPpeIssuesByStatus(status);

      const rows = toList<PpeIssueDto>(
        readDataModel(response as Record<string, unknown>),
      );

      return toPpeIssuanceLogEntries(rows);
    },
  });

  if (isClientReady && !hasToken) {
    return {
      entries: [] as PpeIssuanceLogEntry[],
      isLoading: false,
      errorMessage: "Please sign in to load the issuance log.",
      refetch: () => undefined,
    };
  }

  return {
    entries: query.data ?? [],
    isLoading: !isClientReady || query.isLoading,
    errorMessage: query.isError
      ? getMutationErrorMessage(query.error, "Failed to load the issuance log.")
      : null,
    refetch: () => void query.refetch(),
  };
}

/** Loads assigned PPE via GET /api/ppe/issue/assigned-to for acknowledgements. */
export function usePpeIssuesAssignedToQuery() {
  const isClientReady = useIsClientReady();
  const hasToken = isClientReady && Boolean(getAccessToken());

  const query = useQuery({
    queryKey: ["ppe", "issues-assigned-to"] as const,
    enabled: hasToken,
    queryFn: async () => {
      const response = await getPpeIssuesAssignedTo();
      const rows = toList<PpeIssueDto>(
        readDataModel(response as Record<string, unknown>),
      );
      return toPpeAcknowledgementEntries(rows);
    },
  });

  if (isClientReady && !hasToken) {
    return {
      entries: [] as PpeAcknowledgementEntry[],
      isLoading: false,
      errorMessage: "Please sign in to load your PPE acknowledgements.",
      refetch: () => undefined,
    };
  }

  return {
    entries: query.data ?? [],
    isLoading: !isClientReady || query.isLoading,
    errorMessage: query.isError
      ? getMutationErrorMessage(
          query.error,
          "Failed to load PPE acknowledgements.",
        )
      : null,
    refetch: () => void query.refetch(),
  };
}

/** Loads one PPE issue via GET /api/ppe/issue/{id} for the employee profile page. */
export function usePpeIssueProfileQuery(
  issueIdParam: string,
): PpeIssueProfileState {
  const isClientReady = useIsClientReady();
  const hasToken = isClientReady && Boolean(getAccessToken());
  const issueId = toNumericId(issueIdParam);

  const query = useQuery({
    queryKey: ["ppe", "issue", issueId ?? -1] as const,
    enabled: hasToken && issueId !== null,
    queryFn: async () => {
      const response = await getPpeIssueById(issueId as number);
      const row = readDataModel(response as Record<string, unknown>);
      if (row === null || row === undefined) return null;
      if (typeof row !== "object" || Array.isArray(row)) return null;

      return toPpeEmployeeProfileFromIssue(row as PpeIssueDetailDto);
    },
  });

  if (issueId === null) {
    return {
      profile: null,
      isLoading: false,
      errorMessage: null,
      isNotFound: true,
      refetch: () => undefined,
    };
  }

  if (isClientReady && !hasToken) {
    return {
      profile: null,
      isLoading: false,
      errorMessage: "Please sign in to load this PPE profile.",
      isNotFound: false,
      refetch: () => undefined,
    };
  }

  const isNotFound =
    query.data === null ||
    (isApiError(query.error) && query.error.status === 404);

  return {
    profile: query.data ?? null,
    isLoading: !isClientReady || query.isLoading,
    errorMessage:
      query.isError && !isNotFound
        ? getMutationErrorMessage(
            query.error,
            "Failed to load this PPE issue profile.",
          )
        : null,
    isNotFound,
    refetch: () => void query.refetch(),
  };
}
