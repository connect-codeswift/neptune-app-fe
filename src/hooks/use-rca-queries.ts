"use client";

import { useQuery } from "@tanstack/react-query";
import { getRcaCategories } from "@/services/rca.service";

export const rcaQueryKeys = {
  categories: ["rca", "categories"] as const,
};

export function useRcaCategoriesQuery() {
  return useQuery({
    queryKey: rcaQueryKeys.categories,
    queryFn: () => getRcaCategories(),
  });
}
