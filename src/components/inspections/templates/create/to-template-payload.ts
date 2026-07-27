import type { FormValues } from "@/components/form-builder";
import type { CreateInspectionTemplateRequestDto } from "@/dtos/req/inspection-template-request.dto";
import { getCurrentUser } from "@/lib/current-user";
import {
  itemDisplayName,
  type ScoringConfig,
  type TemplateRule,
  type TemplateSection,
  type TemplateSettings,
} from "./template-builder-data";

/** Everything the 5-step wizard collects. */
export type TemplateDraft = Readonly<{
  values: FormValues;
  sections: TemplateSection[];
  scoring: ScoringConfig;
  rules: TemplateRule[];
  settings: TemplateSettings;
}>;

/**
 * Flatten the wizard state into the backend's inspection-template body.
 *
 * `publish: false` marks the record as a draft instead. Fields the wizard
 * doesn't collect yet (assignee, schedule, finding severity/category) are sent
 * as neutral defaults; new records send id 0 so the backend assigns them.
 */
export function toInspectionTemplatePayload(
  draft: TemplateDraft,
  options: Readonly<{ publish: boolean }>,
): CreateInspectionTemplateRequestDto {
  const { values, sections, scoring, rules, settings } = draft;
  const { userId, subCompanyId } = getCurrentUser();

  const isPublished = options.publish;
  const isDraft = !options.publish;
  const tags = (values.tags as string[] | undefined) ?? [];

  return {
    templateName: String(values.templateName ?? "").trim(),
    templateType: String(values.templateType ?? "Inspection"),
    templateTags: tags.join(","),
    description: String(values.description ?? "").trim(),

    isScoringEnable: scoring.enabled,
    passThreshold: scoring.passThreshold,
    isScoreVisibility: scoring.showScoreToUser,

    isTemplateDuplicationAllow: settings.allowDuplication,
    isAllowEditing: settings.allowEditing,
    isDraft,
    isPublished,

    frequency: String(values.frequency ?? ""),

    // Not captured by the wizard yet — sent as defaults. Foreign keys go out
    // as null rather than 0, which would point at a non-existent row.
    defaultAssigneeId: null,
    defaultLocation: settings.sites.join(", "),
    scheduleStartDate: new Date().toISOString(),
    dueWindowDays: 0,
    notifyAssignee: true,

    userId,
    subCompanyId,

    sections: sections.map((section, sectionIndex) => ({
      id: 0,
      sectionTitle: section.title,
      description: section.description,
      displayOrder: sectionIndex + 1,
      isDraft,
      isPublished,
      userId,
      subCompanyId,
      inspectionTemplateId: 0,
      items: section.items.map((item, itemIndex) => ({
        id: 0,
        itemType: item.type,
        question: itemDisplayName(item),
        hint: item.guidance,
        scoreWeight: item.scoreWeight,
        itemWeight: item.scoreWeight,
        responseSetId: null,
        isCritical: false,
        allowNA: true,
        requireNote: false,
        requirePhoto: item.type === "Photo / Media",
        isRequired: item.required,
        displayOrder: itemIndex + 1,
        isDraft,
        isPublished,
        userId,
        subCompanyId,
        templateSectionId: 0,
      })),
    })),

    conditionalLogics: rules.map((rule) => ({
      id: 0,
      status: rule.active ? "Active" : "Inactive",
      if: rule.ifQuestion,
      condition: rule.ifOperator,
      then: rule.thenAction,
      result: rule.thenValue,
      sourceItemId: null,
      operator: rule.ifOperator,
      conditionValue: rule.ifValue,
      action: rule.thenAction,
      targetItemId: null,
      findingSeverity: "",
      findingCategory: "",
      isDraft,
      isPublished,
      userId,
      subCompanyId,
      inspectionTemplateId: 0,
    })),
  };
}
