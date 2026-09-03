"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FormBuilder,
  type FormValues,
  type SelectOption,
} from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { SkeletonTable } from "@/components/ui/skeletons";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useSubmitLock } from "@/hooks/use-submit-lock";
import { useUpdateAuditMutation } from "@/hooks/use-audit-mutations";
import { useAuditDetailQuery } from "@/hooks/use-audit-queries";
import { toast } from "@/lib/toast";
import {
  buildStartAuditSchema,
  type StartAuditValues,
} from "@/components/audits/start/start-audit-schema";

const AUDIT_DETAIL_ROUTE = "/dashboard/audits";

/**
 * Statuses the backend refuses to edit. Submit is one-way and reopen is the
 * correction path, so offering the form for a closed run would only produce a
 * 400 after the auditor had retyped everything.
 */
const UNEDITABLE_STATUSES = new Set(["submitted", "completed", "cancelled"]);

/** `2026-09-04T00:00:00Z` → `2026-09-04`, which is what a date input reads. */
function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

export type EditAuditFormProps = Readonly<{ auditId: string }>;

/**
 * Edits an unsubmitted run: title, location, auditor and dates.
 *
 * Shares the schedule form's schema rather than restating it, so the two stay in
 * step. `isEdit` locks the template — a run's answers are keyed to the version
 * pinned when it was created — and lifts the `not-past` date limit, without
 * which a run scheduled last week could not be saved at all.
 */
export function EditAuditForm(props: EditAuditFormProps) {
  const { auditId } = props;
  const router = useRouter();

  const detailQuery = useAuditDetailQuery(auditId);
  const audit = detailQuery.data?.dataModel ?? null;

  const updateAudit = useUpdateAuditMutation();
  // Held past the response for the same reason the create form holds it: the
  // navigation away is still in flight when `isPending` drops.
  const submitLock = useSubmitLock();

  const lockedTemplateOption = useMemo<SelectOption | undefined>(() => {
    if (!audit) return undefined;
    return {
      value: String(audit.templateId),
      label: audit.snapshot?.templateName || "Selected template",
    };
  }, [audit]);

  const schema = useMemo(
    () =>
      buildStartAuditSchema({
        templateOptions: lockedTemplateOption ? [lockedTemplateOption] : [],
        selectedTemplateOption: lockedTemplateOption,
        isEdit: true,
      }),
    [lockedTemplateOption],
  );

  const initialValues = useMemo<FormValues | undefined>(() => {
    if (!audit) return undefined;
    return {
      auditTitle: audit.auditTitle,
      template: String(audit.templateId),
      location: audit.location,
      auditor: String(audit.auditorId),
      // The person picker reads its label from `${name}Name` by default.
      auditorName: audit.auditorName,
      scheduledDate: toDateInputValue(audit.scheduleDate),
      dueDate: toDateInputValue(audit.dueDate),
    };
  }, [audit]);

  if (detailQuery.isPending) {
    return <SkeletonTable />;
  }

  if (!audit) {
    return (
      <IncidentGlassCard paddingClassName="p-6">
        <Text as="p" className="text4 text-ehs-muted-text">
          This audit could not be loaded.
        </Text>
      </IncidentGlassCard>
    );
  }

  if (UNEDITABLE_STATUSES.has(audit.status.trim().toLowerCase())) {
    return (
      <IncidentGlassCard paddingClassName="p-6">
        <Text as="p" className="text4 text-ehs-muted-text">
          {`A ${audit.status.toLowerCase()} audit cannot be edited. Reopen it first to make corrections.`}
        </Text>
      </IncidentGlassCard>
    );
  }

  const handleSubmit = (values: FormValues) => {
    const edited = values as StartAuditValues;

    // The date input yields "YYYY-MM-DD"; the API takes a full ISO date-time.
    const parsedDate = edited.scheduledDate
      ? new Date(edited.scheduledDate)
      : null;
    const scheduleDate =
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate.toISOString()
        : new Date().toISOString();

    const parsedDueDate = edited.dueDate ? new Date(edited.dueDate) : null;
    const dueDate =
      parsedDueDate && !Number.isNaN(parsedDueDate.getTime())
        ? parsedDueDate.toISOString()
        : undefined;

    if (!submitLock.acquire()) {
      return;
    }

    updateAudit.mutate(
      {
        auditId,
        payload: {
          auditTitle: edited.auditTitle.trim(),
          location: edited.location,
          auditorId: Number(edited.auditor) || 0,
          scheduleDate,
          dueDate,
        },
      },
      {
        onSuccess: () => {
          toast.success("Audit updated");
          router.push(`${AUDIT_DETAIL_ROUTE}/${encodeURIComponent(auditId)}`);
        },
        onError: (error) => {
          submitLock.release();
          toast.error(
            getMutationErrorMessage(
              error,
              "Could not save the audit. Please try again.",
            ),
          );
        },
      },
    );
  };

  return (
    <IncidentGlassCard paddingClassName="p-6" className="min-w-0">
      <FormBuilder
        schema={schema}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        className="fields-solid"
        submitLabel="Save Changes"
        isSubmitting={updateAudit.isPending || submitLock.isLocked}
        onCancel={() => {
          router.push(`${AUDIT_DETAIL_ROUTE}/${encodeURIComponent(auditId)}`);
        }}
      />
    </IncidentGlassCard>
  );
}
