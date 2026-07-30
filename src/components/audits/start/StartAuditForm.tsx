"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FormBuilder,
  createInitialValues,
  type FormValues,
  type SelectOption,
} from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateAuditMutation } from "@/hooks/use-audit-mutations";
import { useAuditTemplatesQuery } from "@/hooks/use-audit-template-queries";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { getCurrentUser } from "@/lib/current-user";
import { toAssigneeOptions } from "@/lib/map-user";
import { toast } from "@/lib/toast";
import { setSelectedAudit } from "@/store/audit-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  buildStartAuditSchema,
  type StartAuditValues,
} from "./start-audit-schema";

const AUDIT_LIST_ROUTE = "/dashboard/audits";
const AUDIT_CHECKLIST_ROUTE = "/dashboard/audits/checklist";
const TEMPLATE_PAGE_SIZE = 10;

export function StartAuditForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  // Set when arriving via a card's "Use Template" — preselects that template.
  const preselectedTemplateId = searchParams.get("templateId") ?? "";

  const [templatePage, setTemplatePage] = useState(1);

  // Preselection resolves from client-only sources (the query param, the
  // persisted store, and fetched options). useSyncExternalStore returns false on
  // the server and the first (hydration) client render, then true afterwards —
  // so preselection is applied only post-hydration, avoiding a text mismatch.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const activeTemplateId = hydrated ? preselectedTemplateId : "";

  const userDropdownQuery = useUserDropdownQuery();
  const users = userDropdownQuery.data?.dataModel;

  const templatesQuery = useAuditTemplatesQuery({
    pageNumber: templatePage,
    pageSize: TEMPLATE_PAGE_SIZE,
  });
  const templatePageData = templatesQuery.data?.dataModel;

  // Only published templates can start an audit (the backend rejects drafts),
  // so drafts are filtered out of the dropdown entirely.
  const templateOptions = useMemo<SelectOption[]>(
    () =>
      (templatePageData?.data ?? [])
        .filter((template) => template.isPublished)
        .map((template) => ({
          value: String(template.id),
          label: template.templateName || "Untitled template",
        })),
    [templatePageData],
  );

  const totalRecords = templatePageData?.totalRecords ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / TEMPLATE_PAGE_SIZE));

  // The preselected template's name comes from the store (stashed on "Use"), so
  // the trigger shows it even before that template's page is loaded.
  const selectedTemplate = useAppSelector(
    (state) => state.auditTemplate.selected,
  );
  const selectedTemplateOption = useMemo<SelectOption | undefined>(() => {
    if (
      !activeTemplateId ||
      !selectedTemplate ||
      String(selectedTemplate.id) !== activeTemplateId
    ) {
      return undefined;
    }
    return {
      value: activeTemplateId,
      label: selectedTemplate.templateName || "Untitled template",
    };
  }, [activeTemplateId, selectedTemplate]);
  // Arriving via "Use template" fixes the choice, so the dropdown is locked to
  // that one template rather than listing every other option.
  const isTemplateLocked = activeTemplateId !== "";
  const lockedOption = useMemo<SelectOption | undefined>(() => {
    if (!isTemplateLocked) return undefined;
    return (
      selectedTemplateOption ??
      templateOptions.find((option) => option.value === activeTemplateId) ?? {
        value: activeTemplateId,
        label: "Selected template",
      }
    );
  }, [
    isTemplateLocked,
    selectedTemplateOption,
    templateOptions,
    activeTemplateId,
  ]);

  const schema = useMemo(
    () =>
      buildStartAuditSchema({
        auditorOptions: toAssigneeOptions(users ?? []),
        templateOptions: lockedOption ? [lockedOption] : templateOptions,
        templatePagination: {
          pageNumber: templatePage,
          totalPages,
          onPrev: () => setTemplatePage((page) => Math.max(1, page - 1)),
          onNext: () =>
            setTemplatePage((page) => Math.min(totalPages, page + 1)),
          isLoading: templatesQuery.isFetching,
        },
        selectedTemplateOption,
        isTemplateLocked,
      }),
    [
      users,
      templateOptions,
      templatePage,
      totalPages,
      templatesQuery.isFetching,
      selectedTemplateOption,
      isTemplateLocked,
      lockedOption,
    ],
  );

  // Seed the template value from the query param. Deferred to post-hydration via
  // activeTemplateId; the FormBuilder key below reseeds when it flips in.
  const initialValues = useMemo<FormValues | undefined>(() => {
    if (!activeTemplateId) return undefined;
    return { ...createInitialValues(schema), template: activeTemplateId };
    // Only the active id should re-seed; option lists loading in must not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTemplateId]);

  const createAudit = useCreateAuditMutation();

  const handleSubmit = (values: FormValues) => {
    // Values are keyed by the schema field names, matching StartAuditValues.
    const audit = values as StartAuditValues;
    const { userId, subCompanyId } = getCurrentUser();

    // The date input yields "YYYY-MM-DD"; send a full ISO date-time.
    const parsedDate = audit.scheduledDate
      ? new Date(audit.scheduledDate)
      : null;
    const scheduleDate =
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toISOString()
        : new Date().toISOString();

    createAudit.mutate(
      {
        id: 0,
        auditTitle: audit.auditTitle.trim(),
        templateId: Number(audit.template) || 0,
        location: audit.location,
        // A custom (external) auditor has no directory id, so it goes out as 0.
        auditorId: Number(audit.auditor) || 0,
        scheduleDate,
        userId,
        subCompanyId,
      },
      {
        onSuccess: (response) => {
          toast.success("Audit created");
          // Stash the created audit so the checklist can label its header
          // without waiting on the list to refetch.
          const created = response.dataModel;
          if (created) dispatch(setSelectedAudit(created));

          // Go straight to the checklist, which loads the template's sections
          // and items from its id.
          router.push(
            audit.template
              ? `${AUDIT_CHECKLIST_ROUTE}?templateid=${encodeURIComponent(audit.template)}`
              : AUDIT_LIST_ROUTE,
          );
        },
        onError: (error) => {
          toast.error(
            getMutationErrorMessage(
              error,
              "Could not start the audit. Please try again.",
            ),
          );
        },
      },
    );
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
        submitLabel={createAudit.isPending ? "Starting…" : "Begin Audit"}
        cancelLabel="Cancel"
        isSubmitting={createAudit.isPending}
        onSubmit={handleSubmit}
        onCancel={() => router.push(AUDIT_LIST_ROUTE)}
      />
    </IncidentGlassCard>
  );
}
