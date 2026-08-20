import type { FormValues } from "@/components/form-builder";
import type { CreateAuditTemplateRequestDto } from "@/dtos/req/audit-template-request.dto";
import { getCurrentUser } from "@/lib/current-user";
import {
  itemDisplayName,
  type ScoringConfig,
  type TemplateRule,
  type TemplateSection,
} from "./template-builder-data";

/** Everything the 4-step wizard collects. */
export type TemplateDraft = Readonly<{
  values: FormValues;
  sections: TemplateSection[];
  scoring: ScoringConfig;
  rules: TemplateRule[];
}>;

/**
 * Rows loaded from the API keep their numeric id; rows added in the wizard have
 * a generated id like "item-3", which goes out as 0 so the backend creates them.
 */
function toBackendId(id: string): number {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

/**
 * Flatten the wizard state into the backend's audit-template body.
 *
 * `publish: false` marks the record as a draft instead. Fields the wizard
 * doesn't collect yet (assignee, schedule, finding severity/category) are sent
 * as neutral defaults; new records send id 0 so the backend assigns them.
 * Passing `templateId` (update) keeps existing children's ids so they're
 * updated in place rather than duplicated.
 */
export function toAuditTemplatePayload(
  draft: TemplateDraft,
  options: Readonly<{ publish: boolean; templateId?: string }>,
): CreateAuditTemplateRequestDto {
  const { values, sections, scoring, rules } = draft;
  const { userId, siteId } = getCurrentUser();

  const isPublished = options.publish;
  const isDraft = !options.publish;
  const tags = (values.tags as string[] | undefined) ?? [];
  // 0 on create; on update every child points back at the real template.
  const auditTemplateId = options.templateId
    ? toBackendId(options.templateId)
    : 0;

  return {
    templateName: String(values.templateName ?? "").trim(),
    templateType: String(values.templateType ?? "Audit"),
    templateTags: tags.join(","),
    description: String(values.description ?? "").trim(),

    isScoringEnable: scoring.enabled,
    passThreshold: scoring.passThreshold,
    isScoreVisibility: scoring.showScoreToUser,

    isDraft,
    isPublished,

    frequency: String(values.frequency ?? ""),

    // Not captured by the wizard yet — sent as defaults. Foreign keys go out
    // as null rather than 0, which would point at a non-existent row.
    defaultAssigneeId: null,
    defaultLocation: "",
    scheduleStartDate: new Date().toISOString(),
    dueWindowDays: 0,
    notifyAssignee: true,

    userId,
    siteId,

    sections: sections.map((section, sectionIndex) => {
      const sectionId = toBackendId(section.id);

      return {
        id: sectionId,
        sectionTitle: section.title,
        description: section.description,
        displayOrder: sectionIndex + 1,
        isDraft,
        isPublished,
        userId,
        siteId,
        auditTemplateId,
        items: section.items.map((item, itemIndex) => ({
          id: toBackendId(item.id),
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
          siteId,
          templateSectionId: sectionId,
        })),
      };
    }),

    conditionalLogics: rules.map((rule) => ({
      id: toBackendId(rule.id),
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
      siteId,
      auditTemplateId,
    })),
  };
}
