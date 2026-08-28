"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FormBuilder,
  createInitialValues,
  type FormValues,
  type SelectOption,
} from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useSubmitLock } from "@/hooks/use-submit-lock";
import { useCreateInspectionMutation } from "@/hooks/use-inspection-mutations";
import {
  useInspectionTemplateQuery,
  useInspectionTemplatesQuery,
} from "@/hooks/use-inspection-template-queries";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { getCurrentUser } from "@/lib/current-user";
import { toAssigneeOptions } from "@/lib/map-user";
import { toast } from "@/lib/toast";
import {
  buildStartInspectionSchema,
  type StartInspectionValues,
} from "./start-inspection-schema";

const INSPECTION_LIST_ROUTE = "/dashboard/inspections";
const INSPECTION_CHECKLIST_ROUTE = "/dashboard/inspections/checklist";
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

  // GET /api/v1/audit-templates/{id} labels the locked option.
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

    // `?.` on dataModel too: the envelope types it nullable, and the optional
    // chain stopped one level short, so a null dataModel threw
    // "Cannot read properties of null (reading 'data')" and took the page down
    // rather than falling back to the empty list this `?? []` intends.
    return (templatesQuery.data?.dataModel?.data ?? []).map((template) => ({
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

  const createInspection = useCreateInspectionMutation();
  // Held past the response: `isPending` drops when the record is saved, while
  // the navigation away is still in flight. A click in that gap saved a
  // duplicate.
  const submitLock = useSubmitLock();

  const handleSubmit = (values: FormValues) => {
    // Values are keyed by the schema field names, matching StartInspectionValues.
    const inspection = values as StartInspectionValues;
    const { userId, siteId } = getCurrentUser();

    // The date input yields "YYYY-MM-DD"; send a full ISO date-time.
    const parsedDate = inspection.scheduledDate
      ? new Date(inspection.scheduledDate)
      : null;
    const scheduleDate =
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toISOString()
        : new Date().toISOString();

    // Due Date is optional — only sent when the inspector set one.
    const parsedDueDate = inspection.dueDate
      ? new Date(inspection.dueDate)
      : null;
    const dueDate =
      parsedDueDate && !Number.isNaN(parsedDueDate.getTime())
        ? parsedDueDate.toISOString()
        : undefined;

    if (!submitLock.acquire()) {
      return;
    }

    createInspection.mutate(
      {
        id: 0,
        inspectionTitle: inspection.inspectionTitle.trim(),
        inspectionTemplateId: Number(inspection.template) || 0,
        location: inspection.location,
        // A custom (external) inspector has no directory id, so it goes out as 0.
        inspectorId: Number(inspection.inspector) || 0,
        scheduleDate,
        dueDate,
        userId,
        siteId,
      },
      {
        onSuccess: (response) => {
          toast.success(response.message || "Inspection scheduled");

          // Open the checklist for the inspection run the backend just created.
          const createdId = response.dataModel?.id;
          router.push(
            createdId
              ? `${INSPECTION_CHECKLIST_ROUTE}?inspectionid=${encodeURIComponent(String(createdId))}`
              : INSPECTION_LIST_ROUTE,
          );
        },
        onError: (error) => {
          submitLock.release();
          toast.error(
            getMutationErrorMessage(
              error,
              "Could not schedule the inspection. Please try again.",
            ),
          );
        },
      },
    );
  };

  return (
    <IncidentGlassCard paddingClassName="p-6" className="w-full">
      <FormBuilder
        // Remount once when preselection flips in post-hydration, so the
        // one-shot initialValues seed picks up the preselected template.
        key={activeTemplateId || "blank"}
        schema={schema}
        initialValues={initialValues}
        submitLabel={
          submitLock.isLocked ? "Scheduling…" : "Schedule Inspection"
        }
        cancelLabel="Cancel"
        isSubmitting={submitLock.isLocked}
        onSubmit={handleSubmit}
        onCancel={() => router.push(INSPECTION_LIST_ROUTE)}
      />
    </IncidentGlassCard>
  );
}
