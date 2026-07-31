"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAllChemicals } from "@/services/hazcom.service";
import { mapChemicalDtosToHazcomChemicals } from "@/services/mappers/hazcom-chemical.mapper";

export const hazcomQueryKeys = {
  all: ["hazcom"] as const,
  chemicals: (params: { pageNumber: number; pageSize: number }) =>
    [...hazcomQueryKeys.all, "chemicals", params] as const,
};

/** Spec defaults for GET /api/hazcom/chemical. */
export const DEFAULT_CHEMICALS_PAGE_NUMBER = 1;
export const DEFAULT_CHEMICALS_PAGE_SIZE = 10;

export type UseChemicalsListQueryOptions = Readonly<{
  pageNumber?: number;
  pageSize?: number;
  /** Parent should enable only after client mount + token check. */
  enabled?: boolean;
}>;

/**
 * Loads the chemical inventory via GET /api/hazcom/chemical
 * query: `{ pageNumber, pageSize }`
 *
 * The endpoint takes no search or filter params, so the caller filters the
 * returned page client-side.
 */
export function useChemicalsListQuery(
  options: UseChemicalsListQueryOptions = {},
) {
  const pageNumber = options.pageNumber ?? DEFAULT_CHEMICALS_PAGE_NUMBER;
  const pageSize = options.pageSize ?? DEFAULT_CHEMICALS_PAGE_SIZE;
  const enabled = options.enabled ?? false;

  return useQuery({
    queryKey: hazcomQueryKeys.chemicals({ pageNumber, pageSize }),
    enabled,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const response = await getAllChemicals({ pageNumber, pageSize });
      const page = response.dataModel;

      return {
        chemicals: mapChemicalDtosToHazcomChemicals(page?.data ?? []),
        totalRecords: page?.totalRecords ?? 0,
        pageNumber: page?.pageNumber ?? pageNumber,
        pageSize: page?.pageSize ?? pageSize,
      };
    },
  });
}
