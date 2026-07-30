"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FormBuilder,
  createInitialValues,
  type FormValues,
  type SelectOption,
} from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents";
import {
  useInspectionTemplateQuery,
  useInspectionTemplatesQuery,
} from "@/hooks/use-inspection-template-queries";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { toAssigneeOptions } from "@/lib/map-user";
import { toast } from "@/lib/toast";
import {
  buildStartInspectionSchema,
  type StartInspectionValues,
} from "./start-inspection-schema";

const INSPECTION_LIST_ROUTE = "/dashboard/inspections";
const TEMPLATE_PAGE_SIZE = 10;

export function StartInspectionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Set when arriving via a card's "Use Template" — preselects that template.
  const preselectedTemplateId = searchParams.get("templateId") ?? "";

  // False on the server and the first client render, true afterwards — so the
  // query-param preselection is applied only post-hydration.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const activeTemplateId = hydrated ? preselectedTemplateId : "";
  const isTemplateLocked = activeTemplateId !== "";

  const userDropdownQuery = useUserDropdownQuery();
  const users = userDropdownQuery.data?.dataModel;

  // Only published templates can start an inspection. Skipped entirely when a
  // template is already chosen — that one is fetched by id instead.
  const templatesQuery = useInspectionTemplatesQuery({
    pageNumber: 1,
    pageSize: TEMPLATE_PAGE_SIZE,
    status: "Published",
  });

  // GET /api/AuditTemplate/{id} labels the locked option.
  const templateQuery = useInspectionTemplateQuery(activeTemplateId);
  const lockedTemplate = templateQuery.data?.dataModel ?? null;
  const templateOptions = useMemo<SelectOption[]>(() => {
    if (isTemplateLocked) {
      return [
        {
          value: activeTemplateId,
          label: lockedTemplate?.templateName || "",
        },
      ];
    }

    return (templatesQuery.data?.dataModel.data ?? []).map((template) => ({
      value: String(template.id),
      label: template.templateName || "Untitled template",
    }));
  }, [isTemplateLocked, activeTemplateId, lockedTemplate, templatesQuery.data]);

  const schema = useMemo(
    () =>
      buildStartInspectionSchema({
        inspectorOptions: toAssigneeOptions(users ?? []),
        templateOptions,
        isTemplateLocked,
      }),
    [users, templateOptions, isTemplateLocked],
  );

  // Seed the template value from the query param. Deferred to post-hydration
  // via activeTemplateId; the FormBuilder key below reseeds when it flips in.
  const initialValues = useMemo<FormValues | undefined>(() => {
    if (!activeTemplateId) return undefined;
    return { ...createInitialValues(schema), template: activeTemplateId };
    // Only the active id should re-seed; option lists loading in must not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTemplateId]);

  const handleSubmit = (values: FormValues) => {
    // Values are keyed by the schema field names, matching StartInspectionValues.
    const inspection = values as StartInspectionValues;

    // TODO: wire to an inspection-create mutation once the service exists.
    void inspection;

    toast.success("Inspection created");
    router.push(INSPECTION_LIST_ROUTE);
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      className="mx-auto w-full max-w-3xl bg-white!"
    >
      <FormBuilder
        // Remount once when preselection flips in post-hydration, so the
        // one-shot initialValues seed picks up the preselected template.
        key={activeTemplateId || "blank"}
        schema={schema}
        initialValues={initialValues}
        submitLabel="Begin Inspection"
        cancelLabel="Cancel"
        onSubmit={handleSubmit}
        onCancel={() => router.push(INSPECTION_LIST_ROUTE)}
      />
    </IncidentGlassCard>
  );
}
