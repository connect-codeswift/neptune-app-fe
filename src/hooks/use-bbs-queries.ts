import { useQuery } from "@tanstack/react-query";
import type { BehaviorCategoryDto } from "@/dtos/res/bbs-response.dto";
import { getBehaviorCategories } from "@/services/bbs.service";

function toList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];

  if (payload !== null && typeof payload === "object") {
    const nested = (payload as { data?: unknown }).data;
    if (Array.isArray(nested)) return nested as T[];
  }

  return [];
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
