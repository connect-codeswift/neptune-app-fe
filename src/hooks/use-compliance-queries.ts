"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getAllCompliances,
  getComplianceById,
  getComplianceCalendar,
  getComplianceCategoryStats,
  getComplianceDashboardKpis,
  getComplianceUpcomingFilings,
} from "@/services/compliance.service";
import {
  mapComplianceCalendarEventsToItems,
  mapComplianceDtoToObligationDetail,
  mapComplianceDtosToObligationItems,
  mapComplianceUpcomingFilingsToItems,
} from "@/services/mappers/compliance.mapper";
import type { ComplianceObligationDetail } from "@/components/regulatory-compliance/regulatory-compliance-types";
import type { ComplianceDto } from "@/dtos/res/compliance-response.dto";

export const complianceQueryKeys = {
  all: ["compliance"] as const,
  dashboardKpis: ["compliance", "dashboard-kpis"] as const,
  categoryStats: ["compliance", "category-stats"] as const,
  upcomingFilings: ["compliance", "upcoming-filings"] as const,
  calendar: (params: { startDate: string; endDate: string }) =>
    [...complianceQueryKeys.all, "calendar", params] as const,
  list: (params: {
    pageNumber: number;
    pageSize: number;
    search: string;
    jurisdiction: string;
    status: string;
  }) => [...complianceQueryKeys.all, "list", params] as const,
  detail: (id: number) => [...complianceQueryKeys.all, "detail", id] as const,
};

export const DEFAULT_COMPLIANCES_PAGE_NUMBER = 1;
export const DEFAULT_COMPLIANCES_PAGE_SIZE = 10;

/** GET /api/v1/compliance-records/dashboard-kpis */
export function useComplianceDashboardKpisQuery(enabled = true) {
  return useQuery({
    queryKey: complianceQueryKeys.dashboardKpis,
    queryFn: () => getComplianceDashboardKpis(),
    enabled,
  });
}

/** GET /api/v1/compliance-records/category-stats */
export function useComplianceCategoryStatsQuery(enabled = true) {
  return useQuery({
    queryKey: complianceQueryKeys.categoryStats,
    queryFn: () => getComplianceCategoryStats(),
    enabled,
  });
}

/** GET /api/v1/compliance-records/upcoming-filings */
export function useComplianceUpcomingFilingsQuery(enabled = true) {
  return useQuery({
    queryKey: complianceQueryKeys.upcomingFilings,
    queryFn: () => getComplianceUpcomingFilings(),
    enabled,
    select: (response) =>
      mapComplianceUpcomingFilingsToItems(response.dataModel ?? []),
  });
}

export type UseComplianceCalendarQueryOptions = Readonly<{
  startDate: string;
  endDate: string;
  enabled?: boolean;
}>;

/** GET /api/v1/compliance-records/calendar */
export function useComplianceCalendarQuery(
  options: UseComplianceCalendarQueryOptions,
) {
  const enabled = options.enabled ?? false;

  return useQuery({
    queryKey: complianceQueryKeys.calendar({
      startDate: options.startDate,
      endDate: options.endDate,
    }),
    enabled,
    queryFn: async () => {
      const response = await getComplianceCalendar({
        startDate: options.startDate,
        endDate: options.endDate,
      });

      return mapComplianceCalendarEventsToItems(response.dataModel ?? []);
    },
  });
}

export type UseComplianceByIdQueryOptions = Readonly<{
  id: number | null;
  enabled?: boolean;
  responsibleNameById?: ReadonlyMap<string, string>;
}>;

export type ComplianceByIdQueryResult = Readonly<{
  dto: ComplianceDto;
  detail: ComplianceObligationDetail;
}>;

/** GET /api/v1/compliance-records/{id} */
export function useComplianceByIdQuery(options: UseComplianceByIdQueryOptions) {
  const enabled =
    (options.enabled ?? false) && options.id != null && options.id > 0;

  return useQuery({
    queryKey: complianceQueryKeys.detail(options.id ?? 0),
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<ComplianceByIdQueryResult | null> => {
      if (options.id == null) {
        return null;
      }

      const dto = await getComplianceById(options.id);
      if (!dto) {
        return null;
      }

      return {
        dto,
        detail: mapComplianceDtoToObligationDetail(dto, {
          responsibleName: options.responsibleNameById?.get(
            String(dto.responsiblePersonId ?? ""),
          ),
        }),
      };
    },
  });
}

export type UseCompliancesListQueryOptions = Readonly<{
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  jurisdiction?: string;
  status?: string;
  enabled?: boolean;
}>;

/** POST /api/v1/compliance-records/search */
export function useCompliancesListQuery(
  options: UseCompliancesListQueryOptions = {},
) {
  const pageNumber = options.pageNumber ?? DEFAULT_COMPLIANCES_PAGE_NUMBER;
  const pageSize = options.pageSize ?? DEFAULT_COMPLIANCES_PAGE_SIZE;
  const enabled = options.enabled ?? false;
  const search = options.search?.trim() ?? "";
  const jurisdiction = options.jurisdiction?.trim() ?? "";
  const status = options.status?.trim() ?? "";

  return useQuery({
    queryKey: complianceQueryKeys.list({
      pageNumber,
      pageSize,
      search,
      jurisdiction,
      status,
    }),
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await getAllCompliances({
        pageNumber,
        pageSize,
        search: search || undefined,
        jurisdiction: jurisdiction || undefined,
        status: status || undefined,
      });

      return {
        ...response,
        records: mapComplianceDtosToObligationItems(response.items),
      };
    },
  });
}
