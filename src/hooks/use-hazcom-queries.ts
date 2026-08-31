"use client";

import { useSyncExternalStore } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type {
  HazcomChemical,
  HazcomDashboardKpis,
  HazcomRiskAssessment,
  HazcomSdsRecord,
  HazcomSdsStatusOverview,
  HazcomStatementCode,
  HazcomTrainingCompliance,
  HazcomTrainingSession,
  HazcomUpcomingDeadline,
} from "@/components/hazcom/shared";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { getAccessToken, isApiError } from "@/lib/axios";
import { parseRecordNumericId } from "@/lib/format-record-id";
import {
  getAllChemicalRiskAssessments,
  getAllChemicals,
  getAllSafetyDataSheets,
  getAllTrainingLogs,
  getChemicalById,
  getChemicalNames,
  getDashboardKpis,
  getHazardHCodes,
  getPrecautionaryCodes,
  getSafetyDataSheetById,
  getSdsLabel,
  getSdsStatements,
  getSdsStatusOverview,
  getTrainingCompliance,
  getUpcomingDeadlines,
  searchSafetyDataSheets,
} from "@/services/hazcom.service";
import {
  mapChemicalDtoToHazcomChemical,
  mapChemicalDtosToHazcomChemicals,
  mapChemicalNameDtos,
  type HazcomChemicalName,
} from "@/services/mappers/hazcom-chemical.mapper";
import { mapRiskAssessmentDtosToHazcomAssessments } from "@/services/mappers/hazcom-risk-assessment.mapper";
import {
  mapGhsCodeDtos,
  mapSdsDtoToHazcomSdsDetail,
  mapSdsDtosToHazcomSdsRecords,
  mapSdsLabelDto,
  mapSdsSearchResultDtos,
  mapSdsStatementsDto,
  type HazcomSdsDetail,
  type HazcomSdsLabel,
  type HazcomSdsSearchResult,
} from "@/services/mappers/hazcom-sds.mapper";
import {
  mapDashboardKpisDto,
  mapSdsStatusOverviewDto,
  mapTrainingComplianceDto,
  mapUpcomingDeadlineDtos,
} from "@/services/mappers/hazcom-dashboard.mapper";
import { mapTrainingLogDtosToHazcomSessions } from "@/services/mappers/hazcom-training.mapper";

type PageParams = { pageNumber: number; pageSize: number };

export const hazcomQueryKeys = {
  all: ["hazcom"] as const,
  chemicals: (params: PageParams) =>
    [...hazcomQueryKeys.all, "chemicals", params] as const,
  chemical: (id: number) => [...hazcomQueryKeys.all, "chemical", id] as const,
  chemicalNames: () => [...hazcomQueryKeys.all, "chemical-names"] as const,
  sdsList: (params: PageParams) =>
    [...hazcomQueryKeys.all, "sds", params] as const,
  sds: (id: number) => [...hazcomQueryKeys.all, "sds", id] as const,
  sdsStatements: (id: number) =>
    [...hazcomQueryKeys.all, "sds", id, "statements"] as const,
  sdsSearch: (query: string) =>
    [...hazcomQueryKeys.all, "sds", "search", query] as const,
  sdsLabel: (id: number) =>
    [...hazcomQueryKeys.all, "sds", id, "label"] as const,
  hazardHCodes: () => [...hazcomQueryKeys.all, "hazard-hcodes"] as const,
  precautionaryCodes: () =>
    [...hazcomQueryKeys.all, "precautionary-codes"] as const,
  trainingLogs: (params: PageParams) =>
    [...hazcomQueryKeys.all, "training", params] as const,
  riskAssessments: (params: PageParams) =>
    [...hazcomQueryKeys.all, "risk-assessments", params] as const,
  dashboardKpis: () => [...hazcomQueryKeys.all, "dashboard", "kpis"] as const,
  sdsStatusOverview: () =>
    [...hazcomQueryKeys.all, "dashboard", "sds-status"] as const,
  upcomingDeadlines: () =>
    [...hazcomQueryKeys.all, "dashboard", "upcoming-deadlines"] as const,
  trainingCompliance: () =>
    [...hazcomQueryKeys.all, "dashboard", "training-compliance"] as const,
};

/** Spec defaults for GET /api/hazcom/chemical. */
export const DEFAULT_CHEMICALS_PAGE_NUMBER = 1;
export const DEFAULT_CHEMICALS_PAGE_SIZE = 10;

/**
 * Loads the chemical inventory via GET /api/hazcom/chemical
 * query: `{ pageNumber, pageSize }`
 *
 * The endpoint takes no search or filter params, so the caller filters the
 * returned page client-side.
 */
export function useChemicalsListQuery(
  options: HazcomListOptions = {},
): HazcomListState<HazcomChemical> {
  return useHazcomListQuery(
    hazcomQueryKeys.chemicals,
    async (params) => {
      const page = (await getAllChemicals(params)).dataModel;

      return {
        items: mapChemicalDtosToHazcomChemicals(page?.data ?? []),
        totalRecords: page?.totalRecords ?? 0,
      };
    },
    {
      signedOut: "Please sign in to load the chemical inventory.",
      failed: "Failed to load chemicals.",
    },
    options,
  );
}

/** Never emits, so the snapshot flips exactly once — at hydration. */
const subscribeToNothing = () => () => {};

/**
 * False on the server and during the first client render, true afterwards.
 * The access token lives in localStorage, so anything derived from it has to
 * wait for hydration or the first client render desyncs from the server pass.
 */
export function useIsClientReady(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

/** Route segment as an id the API can address, e.g. `12` or `CHEM-12`. */
function toNumericId(idParam: string): number | null {
  return parseRecordNumericId(idParam);
}

export type ChemicalDetailState = Readonly<{
  chemical: HazcomChemical | null;
  isLoading: boolean;
  /** Set when the record can't be loaded at all; render an error card. */
  errorMessage: string | null;
  /** The id matches no record — render the not-found card instead. */
  isNotFound: boolean;
  refetch: () => void;
}>;

/**
 * Loads one chemical via GET /api/hazcom/chemical/{id} for the detail and edit
 * pages, and folds the hydration + token gating into the returned state so
 * both views can render straight from it.
 */
export function useChemicalDetailQuery(
  chemicalIdParam: string,
): ChemicalDetailState {
  const isClientReady = useIsClientReady();
  const hasToken = isClientReady && Boolean(getAccessToken());
  const chemicalId = toNumericId(chemicalIdParam);

  const query = useQuery({
    // `chemicalId` is only null while the query is disabled, so the -1 key is
    // never fetched against.
    queryKey: hazcomQueryKeys.chemical(chemicalId ?? -1),
    enabled: hasToken && chemicalId !== null,
    queryFn: async () => {
      const response = await getChemicalById(chemicalId as number);
      const row = response.dataModel;

      return row === null ? null : mapChemicalDtoToHazcomChemical(row);
    },
  });

  // A legacy route segment ("C001") addresses nothing on this API — the same
  // dead end as an id the backend doesn't know.
  if (chemicalId === null) {
    return {
      chemical: null,
      isLoading: false,
      errorMessage: null,
      isNotFound: true,
      refetch: () => undefined,
    };
  }

  if (isClientReady && !hasToken) {
    return {
      chemical: null,
      isLoading: false,
      errorMessage: "Please sign in to load this chemical.",
      isNotFound: false,
      refetch: () => undefined,
    };
  }

  // The API answers a missing record either way, so both read as not-found.
  const isNotFound =
    query.data === null ||
    (isApiError(query.error) && query.error.status === 404);

  return {
    chemical: query.data ?? null,
    isLoading: !isClientReady || query.isLoading,
    errorMessage:
      query.isError && !isNotFound
        ? getMutationErrorMessage(query.error, "Failed to load this chemical.")
        : null,
    isNotFound,
    refetch: () => void query.refetch(),
  };
}

/* -------------------------------------------------------------------------- */
/* Paged list queries                                                         */
/* -------------------------------------------------------------------------- */

/** Spec defaults shared by every paged HazCom list endpoint. */
export const DEFAULT_HAZCOM_PAGE_NUMBER = 1;
export const DEFAULT_HAZCOM_PAGE_SIZE = 10;

export type HazcomListState<TItem> = Readonly<{
  items: readonly TItem[];
  totalRecords: number;
  isLoading: boolean;
  /** Set while a background refetch is in flight — for disabling pagers. */
  isFetching: boolean;
  errorMessage: string | null;
  refetch: () => void;
}>;

export type HazcomListOptions = Readonly<{
  pageNumber?: number;
  pageSize?: number;
}>;

/**
 * Runs a paged HazCom list query behind the same hydration + token gate the
 * detail hook uses, so each list view renders straight from the result.
 */
function useHazcomListQuery<TItem>(
  buildKey: (params: PageParams) => readonly unknown[],
  fetchPage: (
    params: PageParams,
  ) => Promise<{ items: TItem[]; totalRecords: number }>,
  labels: Readonly<{ signedOut: string; failed: string }>,
  options: HazcomListOptions = {},
): HazcomListState<TItem> {
  const pageNumber = options.pageNumber ?? DEFAULT_HAZCOM_PAGE_NUMBER;
  const pageSize = options.pageSize ?? DEFAULT_HAZCOM_PAGE_SIZE;
  const isClientReady = useIsClientReady();
  const hasToken = isClientReady && Boolean(getAccessToken());

  const query = useQuery({
    queryKey: buildKey({ pageNumber, pageSize }),
    enabled: hasToken,
    placeholderData: keepPreviousData,
    queryFn: () => fetchPage({ pageNumber, pageSize }),
  });

  return {
    items: query.data?.items ?? [],
    totalRecords: query.data?.totalRecords ?? 0,
    isLoading: !isClientReady || (hasToken && query.isLoading),
    isFetching: query.isFetching,
    errorMessage:
      isClientReady && !hasToken
        ? labels.signedOut
        : query.isError
          ? getMutationErrorMessage(query.error, labels.failed)
          : null,
    refetch: () => void query.refetch(),
  };
}

/** GET /api/hazcom/sds?pageNumber&pageSize */
export function useSdsListQuery(
  options: HazcomListOptions = {},
): HazcomListState<HazcomSdsRecord> {
  return useHazcomListQuery(
    hazcomQueryKeys.sdsList,
    async (params) => {
      const page = (await getAllSafetyDataSheets(params)).dataModel;

      return {
        items: mapSdsDtosToHazcomSdsRecords(page?.data ?? []),
        totalRecords: page?.totalRecords ?? 0,
      };
    },
    {
      signedOut: "Please sign in to load the SDS library.",
      failed: "Failed to load SDS records.",
    },
    options,
  );
}

/**
 * GET /api/v1/hazcom/sds/search?query= — typeahead behind the chemical form's
 * "autofill from SDS" picker. Disabled for a blank query so opening the
 * picker doesn't fire a request before the user has typed anything.
 */
export function useSdsSearchQuery(
  query: string,
  enabled: boolean,
): Readonly<{
  results: readonly HazcomSdsSearchResult[];
  isLoading: boolean;
  isFetching: boolean;
}> {
  const isClientReady = useIsClientReady();
  const hasToken = isClientReady && Boolean(getAccessToken());
  const trimmed = query.trim();

  const searchQuery = useQuery({
    queryKey: hazcomQueryKeys.sdsSearch(trimmed),
    enabled: enabled && hasToken && trimmed !== "",
    queryFn: async () => {
      const response = await searchSafetyDataSheets(trimmed);

      return mapSdsSearchResultDtos(response.dataModel ?? []);
    },
  });

  return {
    results: searchQuery.data ?? [],
    isLoading: enabled && trimmed !== "" && searchQuery.isLoading,
    isFetching: searchQuery.isFetching,
  };
}

/**
 * GET /api/v1/hazcom/sds/{id}/label — the autofill payload for one picked
 * SDS. Fetched imperatively (`queryClient.fetchQuery(sdsLabelQueryKey(id), …)`)
 * from the chemical form in response to picking an SDS, the same "one
 * deliberate action, not a state to keep in sync" pattern the affected-person
 * gender lookup uses — not wrapped in a `useQuery` hook of its own.
 */
export async function fetchSdsLabel(
  id: number,
): Promise<HazcomSdsLabel | null> {
  const response = await getSdsLabel(id);

  return mapSdsLabelDto(response.dataModel);
}

/** GET /api/hazcom/training?pageNumber&pageSize */
export function useTrainingLogsQuery(
  options: HazcomListOptions = {},
): HazcomListState<HazcomTrainingSession> {
  return useHazcomListQuery(
    hazcomQueryKeys.trainingLogs,
    async (params) => {
      const page = (await getAllTrainingLogs(params)).dataModel;

      return {
        items: mapTrainingLogDtosToHazcomSessions(page?.data ?? []),
        totalRecords: page?.totalRecords ?? 0,
      };
    },
    {
      signedOut: "Please sign in to load the training log.",
      failed: "Failed to load training sessions.",
    },
    options,
  );
}

/** GET /api/hazcom/risk-assessment?pageNumber&pageSize */
export function useRiskAssessmentsQuery(
  options: HazcomListOptions = {},
): HazcomListState<HazcomRiskAssessment> {
  return useHazcomListQuery(
    hazcomQueryKeys.riskAssessments,
    async (params) => {
      const page = (await getAllChemicalRiskAssessments(params)).dataModel;

      return {
        items: mapRiskAssessmentDtosToHazcomAssessments(page?.data ?? []),
        totalRecords: page?.totalRecords ?? 0,
      };
    },
    {
      signedOut: "Please sign in to load risk assessments.",
      failed: "Failed to load risk assessments.",
    },
    options,
  );
}

/* -------------------------------------------------------------------------- */
/* Lookups and detail                                                         */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/hazcom/chemical/names — the picker lookup. Both the SDS form and
 * the risk-assessment form need it to turn a chosen name into a `chemicalId`.
 */
export function useChemicalNamesQuery(): Readonly<{
  chemicals: readonly HazcomChemicalName[];
  isLoading: boolean;
  errorMessage: string | null;
}> {
  const isClientReady = useIsClientReady();
  const hasToken = isClientReady && Boolean(getAccessToken());

  const query = useQuery({
    queryKey: hazcomQueryKeys.chemicalNames(),
    enabled: hasToken,
    // The lookup barely changes and is read by two separate forms.
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const response = await getChemicalNames();

      return mapChemicalNameDtos(response.dataModel ?? []);
    },
  });

  return {
    chemicals: query.data ?? [],
    isLoading: !isClientReady || (hasToken && query.isLoading),
    errorMessage: query.isError
      ? getMutationErrorMessage(
          query.error,
          "Failed to load the chemical list.",
        )
      : null,
  };
}

/**
 * GET /api/hazcom/chemicals?pageNumber=1&pageSize=500 — a one-page snapshot of
 * the register, used to check a CAS number for uniqueness before saving. The
 * chemicals list endpoint has no search-by-CAS route, so the whole (single
 * page) register is fetched and keyed in-memory.
 *
 * Returns a normalized CAS → numeric id map, so callers can tell whether a
 * given CAS belongs to a *different* row (edit mode) or to any row (add mode).
 */
export function useChemicalCasLookup(): Readonly<{
  casToId: ReadonlyMap<string, number>;
  isLoading: boolean;
}> {
  const isClientReady = useIsClientReady();
  const hasToken = isClientReady && Boolean(getAccessToken());

  const query = useQuery({
    queryKey: [...hazcomQueryKeys.all, "chemical-cas-lookup"] as const,
    enabled: hasToken,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const page = (await getAllChemicals({ pageNumber: 1, pageSize: 500 }))
        .dataModel;

      const map = new Map<string, number>();
      for (const chemical of mapChemicalDtosToHazcomChemicals(
        page?.data ?? [],
      )) {
        const cas = chemical.casNumber.trim().toLowerCase();
        if (cas === "") continue;

        const id = parseRecordNumericId(chemical.id);
        if (id !== null) map.set(cas, id);
      }

      return map;
    },
  });

  return {
    casToId: query.data ?? new Map<string, number>(),
    isLoading: !isClientReady || (hasToken && query.isLoading),
  };
}

/** GET /api/hazcom/dashboard/kpis — top KPI cards. */
export function useDashboardKpisQuery(): Readonly<{
  kpis: HazcomDashboardKpis | null;
  isLoading: boolean;
  errorMessage: string | null;
  refetch: () => void;
}> {
  const isClientReady = useIsClientReady();
  const hasToken = isClientReady && Boolean(getAccessToken());

  const query = useQuery({
    queryKey: hazcomQueryKeys.dashboardKpis(),
    enabled: hasToken,
    queryFn: async () => {
      const response = await getDashboardKpis();

      return mapDashboardKpisDto(response.dataModel);
    },
  });

  const isNotFound = isApiError(query.error) && query.error.status === 404;

  return {
    kpis: isNotFound ? null : (query.data ?? null),
    isLoading: !isClientReady || (hasToken && query.isLoading),
    errorMessage:
      query.isError && !isNotFound
        ? getMutationErrorMessage(query.error, "Failed to load HazCom KPIs.")
        : null,
    refetch: () => void query.refetch(),
  };
}

/** GET /api/hazcom/dashboard/sds-status — SDS Status Overview card. */
export function useSdsStatusOverviewQuery(): Readonly<{
  status: HazcomSdsStatusOverview | null;
  isLoading: boolean;
  errorMessage: string | null;
  refetch: () => void;
}> {
  const isClientReady = useIsClientReady();
  const hasToken = isClientReady && Boolean(getAccessToken());

  const query = useQuery({
    queryKey: hazcomQueryKeys.sdsStatusOverview(),
    enabled: hasToken,
    queryFn: async () => {
      const response = await getSdsStatusOverview();

      return mapSdsStatusOverviewDto(response.dataModel);
    },
  });

  const isNotFound = isApiError(query.error) && query.error.status === 404;

  return {
    status: isNotFound ? null : (query.data ?? null),
    isLoading: !isClientReady || (hasToken && query.isLoading),
    errorMessage:
      query.isError && !isNotFound
        ? getMutationErrorMessage(
            query.error,
            "Failed to load the SDS status overview.",
          )
        : null,
    refetch: () => void query.refetch(),
  };
}

/**
 * GET /api/hazcom/dashboard/upcoming-deadlines — unpaged list for the
 * overview card.
 */
export function useUpcomingDeadlinesQuery(): Readonly<{
  deadlines: readonly HazcomUpcomingDeadline[];
  isLoading: boolean;
  errorMessage: string | null;
  refetch: () => void;
}> {
  const isClientReady = useIsClientReady();
  const hasToken = isClientReady && Boolean(getAccessToken());

  const query = useQuery({
    queryKey: hazcomQueryKeys.upcomingDeadlines(),
    enabled: hasToken,
    queryFn: async () => {
      const response = await getUpcomingDeadlines();

      return mapUpcomingDeadlineDtos(response.dataModel ?? []);
    },
  });

  const isNotFound = isApiError(query.error) && query.error.status === 404;

  return {
    deadlines: query.data ?? [],
    isLoading: !isClientReady || (hasToken && query.isLoading),
    errorMessage:
      query.isError && !isNotFound
        ? getMutationErrorMessage(
            query.error,
            "Failed to load upcoming deadlines.",
          )
        : null,
    refetch: () => void query.refetch(),
  };
}

/**
 * GET /api/hazcom/dashboard/training-compliance — overview count split.
 */
export function useTrainingComplianceQuery(): Readonly<{
  compliance: HazcomTrainingCompliance | null;
  isLoading: boolean;
  errorMessage: string | null;
  refetch: () => void;
}> {
  const isClientReady = useIsClientReady();
  const hasToken = isClientReady && Boolean(getAccessToken());

  const query = useQuery({
    queryKey: hazcomQueryKeys.trainingCompliance(),
    enabled: hasToken,
    queryFn: async () => {
      const response = await getTrainingCompliance();

      return mapTrainingComplianceDto(response.dataModel);
    },
  });

  const isNotFound = isApiError(query.error) && query.error.status === 404;

  return {
    compliance: isNotFound ? null : (query.data ?? null),
    isLoading: !isClientReady || (hasToken && query.isLoading),
    errorMessage:
      query.isError && !isNotFound
        ? getMutationErrorMessage(
            query.error,
            "Failed to load training compliance.",
          )
        : null,
    refetch: () => void query.refetch(),
  };
}

/**
 * GET /api/hazcom/hazard-hcode and /precautionary-code — the two GHS code
 * libraries the SDS form's statement pickers are built from. Both are unpaged
 * reference lists that rarely change.
 */
function useGhsCodeLibrary(
  queryKey: readonly unknown[],
  fetchCodes: () => Promise<readonly unknown[]>,
): Readonly<{ codes: readonly HazcomStatementCode[]; isLoading: boolean }> {
  const isClientReady = useIsClientReady();
  const hasToken = isClientReady && Boolean(getAccessToken());

  const query = useQuery({
    queryKey,
    enabled: hasToken,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => mapGhsCodeDtos(await fetchCodes()),
  });

  return {
    codes: query.data ?? [],
    isLoading: !isClientReady || (hasToken && query.isLoading),
  };
}

export function useHazardHCodesQuery() {
  return useGhsCodeLibrary(hazcomQueryKeys.hazardHCodes(), async () => {
    const response = await getHazardHCodes();
    return response.dataModel ?? [];
  });
}

export function usePrecautionaryCodesQuery() {
  return useGhsCodeLibrary(hazcomQueryKeys.precautionaryCodes(), async () => {
    const response = await getPrecautionaryCodes();
    return response.dataModel ?? [];
  });
}

export type SdsDetailState = Readonly<{
  detail: HazcomSdsDetail | null;
  /** Resolved from GET /sds/{id}/statements, falling back to the row itself. */
  statements: readonly HazcomStatementCode[];
  isLoading: boolean;
  errorMessage: string | null;
  isNotFound: boolean;
  refetch: () => void;
}>;

/**
 * GET /api/hazcom/sds/{id} plus its statement list, for the SDS viewer.
 *
 * The statements call is a separate endpoint and is allowed to fail on its
 * own: a sheet that loads but whose statements 404 still renders, falling
 * back to the codes written on the record.
 */
export function useSdsDetailQuery(sdsIdParam: string): SdsDetailState {
  const isClientReady = useIsClientReady();
  const hasToken = isClientReady && Boolean(getAccessToken());
  const sdsId = toNumericId(sdsIdParam);
  const enabled = hasToken && sdsId !== null;

  const detailQuery = useQuery({
    queryKey: hazcomQueryKeys.sds(sdsId ?? -1),
    enabled,
    queryFn: async () => {
      const row = (await getSafetyDataSheetById(sdsId as number)).dataModel;

      return row === null ? null : mapSdsDtoToHazcomSdsDetail(row);
    },
  });

  const statementsQuery = useQuery({
    queryKey: hazcomQueryKeys.sdsStatements(sdsId ?? -1),
    enabled: enabled && detailQuery.data != null,
    queryFn: async () => {
      const row = (await getSdsStatements(sdsId as number)).dataModel;

      return mapSdsStatementsDto(row);
    },
  });

  if (sdsId === null) {
    return {
      detail: null,
      statements: [],
      isLoading: false,
      errorMessage: null,
      isNotFound: true,
      refetch: () => undefined,
    };
  }

  if (isClientReady && !hasToken) {
    return {
      detail: null,
      statements: [],
      isLoading: false,
      errorMessage: "Please sign in to load this SDS record.",
      isNotFound: false,
      refetch: () => undefined,
    };
  }

  const isNotFound =
    detailQuery.data === null ||
    (isApiError(detailQuery.error) && detailQuery.error.status === 404);

  // Codes on the record are the fallback when /statements gives nothing.
  const fallbackStatements: HazcomStatementCode[] = [
    ...(detailQuery.data?.hazardStatements ?? []),
    ...(detailQuery.data?.precautionaryStatements ?? []),
  ].map((code) => ({ code, text: "" }));

  const statements = statementsQuery.data?.length
    ? statementsQuery.data
    : fallbackStatements;

  return {
    detail: detailQuery.data ?? null,
    statements,
    isLoading: !isClientReady || detailQuery.isLoading,
    errorMessage:
      detailQuery.isError && !isNotFound
        ? getMutationErrorMessage(
            detailQuery.error,
            "Failed to load this SDS record.",
          )
        : null,
    isNotFound,
    refetch: () => void detailQuery.refetch(),
  };
}
