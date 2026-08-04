import type { CreateBbsObservationRequestDto } from "@/dtos/req/bbs-request.dto";
import type { BehaviorCategoryDto } from "@/dtos/res/bbs-response.dto";
import type { ObservationFormValues } from "@/components/bbs/log/observation-form-schema";

const OBSERVE_LABEL_BY_VALUE: Record<string, string> = {
  safe: "Safe",
  "at-risk": "At-Risk",
};

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
