"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  useCreateAuditTemplateMutation,
  useUpdateAuditTemplateMutation,
} from "@/hooks/use-audit-template-mutations";
import { toast } from "@/lib/toast";
import { BuildSectionsStep } from "./BuildSectionsStep";
import { ReviewPublishStep } from "./ReviewPublishStep";
import { TemplateWizardProgress } from "./TemplateWizardSteps";
import {
  createInitialSections,
  isItemValueFilled,
  type TemplateSection,
  type WizardState,
} from "./template-builder-data";
import {
  createTemplateInitialValues,
  createTemplateSchema,
} from "./create-template-schema";
import { toAuditTemplatePayload } from "./to-template-payload";

const TEMPLATES_ROUTE = "/dashboard/audits/template";
const BASIC_INFO_FORM_ID = "create-template-basic-info";

export type CreateTemplateContentProps = Readonly<{
  /** Seed all steps from an existing template (edit mode). */
  initialState?: WizardState;
  /** "edit" changes the heading and skips the answer-value validation, since a
   * template defines questions, not answers. */
  mode?: "create" | "edit";
  /** Id of the template being edited — required to PUT on publish. */
  templateId?: string;
  /** The edited template's last-known updatedDate, sent on update for the
   * backend's optimistic-concurrency check. */
  expectedUpdatedDate?: string;
}>;

export function CreateTemplateContent(props: CreateTemplateContentProps) {
  const {
    initialState,
    mode = "create",
    templateId,
    expectedUpdatedDate,
  } = props;
  const isEdit = mode === "edit";
  const router = useRouter();

  const [step, setStep] = useState(1);

  // Mirrors the form so the preview can react as the user types.
  const [values, setValues] = useState<FormValues>(
    () => initialState?.values ?? createTemplateInitialValues,
  );
  const [sections, setSections] = useState<TemplateSection[]>(
    () => initialState?.sections ?? createInitialSections(),
  );
  const [showUnfilledItems, setShowUnfilledItems] = useState(false);

  // Items present when editing began — these are exempt from the "must fill a
  // value" rule; only items added during this session must be filled.
  const initialItemIds = useMemo(() => {
    const ids = new Set<string>();
    (initialState?.sections ?? []).forEach((section) =>
      section.items.forEach((item) => ids.add(item.id)),
    );
    return ids;
  }, [initialState]);

  const createTemplate = useCreateAuditTemplateMutation();
  const updateTemplate = useUpdateAuditTemplateMutation();
  /**
   * Either mutation blocks the submit controls: edit mode goes through
   * updateTemplate, so gating on createTemplate alone left Save/Publish live
   * during a PUT and allowed duplicate submits.
   */
  const isSavingTemplate = createTemplate.isPending || updateTemplate.isPending;

  /** Persist the wizard state as a draft or a published template. In edit mode
   * with a known id this PUTs an update; otherwise it POSTs a new template. */
  const submitTemplate = (publish: boolean) => {
    const draft = { values, sections };
    const isUpdate = isEdit && Boolean(templateId);
    // On update, existing sections/items/logics keep their ids so the backend
    // updates those rows instead of creating duplicates.
    const payload = toAuditTemplatePayload(draft, {
      publish,
      ...(isUpdate ? { templateId } : {}),
    });

    const handlers = {
      // Both create and update answer with the standard envelope, so prefer the
      // backend's own wording and fall back to ours when it sends none.
      onSuccess: (response: ApiEnvelopeDto<unknown>) => {
        toast.success(
          response.message || (publish ? "Template published" : "Draft saved"),
        );
        if (publish) router.push(TEMPLATES_ROUTE);
      },
      onError: (error: unknown) => {
        toast.error(
          getMutationErrorMessage(
            error,
            publish
              ? "Could not publish the template. Please try again."
              : "Could not save the draft. Please try again.",
          ),
        );
      },
    };

    if (isEdit && templateId) {
      // Normalize to an ISO date-time; null skips the backend concurrency check.
      const parsed = expectedUpdatedDate ? new Date(expectedUpdatedDate) : null;
      const concurrencyDate =
        parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : null;

      updateTemplate.mutate(
        { templateId, payload, expectedUpdatedDate: concurrencyDate },
        handlers,
      );
    } else {
      createTemplate.mutate(payload, handlers);
    }
  };

  const handleSaveDraft = () => {
    submitTemplate(false);
  };

  /** Step 1's Next: only fires once FormBuilder's validation passes. */
  const handleBasicInfoSubmit = (submitted: FormValues) => {
    // Commit the latest basic-info values into the shared wizard state.
    setValues(submitted);
    setStep(2);
  };

  const handleBuildSectionsNext = () => {
    const untitled = sections.some((section) => section.title.trim() === "");
    if (untitled) {
      toast.error("Every section needs a title.");
      return;
    }

    // A saved template defines questions, not answers, so pre-loaded items are
    // exempt when editing — but a newly added item must still be filled.
    const hasUnfilled = sections.some((section) =>
      section.items.some(
        (item) =>
          (!isEdit || !initialItemIds.has(item.id)) && !isItemValueFilled(item),
      ),
    );
    if (hasUnfilled) {
      setShowUnfilledItems(true);
      toast.error("Please fill every required item before continuing.");
      return;
    }

    setStep(3);
  };

  const handlePublish = () => {
    submitTemplate(true);
  };

  /** Advance/finish depending on the current step. */
  const handleNext = () => {
    if (step === 2) handleBuildSectionsNext();
    else if (step === 3) handlePublish();
  };

  const PRIMARY_LABEL: Record<number, string> = {
    1: "Next: Build Sections",
    2: "Next: Review & Publish",
    3: isSavingTemplate ? "Publishing..." : "Publish Template",
  };
  const PRIMARY_ICON: Record<number, string> = {
    1: "mdi:arrow-right",
    2: "mdi:arrow-right",
    3: "mdi:check-circle-outline",
  };

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      {/* Header */}
      <div className="bg-ehs-surface border-ehs-border-ink/8 relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-6 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)]">
        <div className="flex min-w-0 flex-col gap-1.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1">
            <Link
              href={TEMPLATES_ROUTE}
              className="text8 text-ehs-muted-text hover:text-ehs-gray transition-colors"
            >
              Templates
            </Link>
            <Icon
              icon="mdi:chevron-right"
              className="text-ehs-muted-text size-3 shrink-0"
              aria-hidden="true"
            />
            <Text as="span" className="text8 text-ehs-gray">
              {isEdit ? "Edit Template" : "Create Template"}
            </Text>
          </nav>

          <Text as="h1" className="text1 text-ehs-darker">
            {isEdit ? "Edit Audit Template" : "Create Audit Template"}
          </Text>

          <Text as="p" className="text8 text-ehs-muted-text">
            3-step wizard — build, configure, and publish your template
          </Text>
        </div>
      </div>

      <TemplateWizardProgress currentStep={step} />

      {step === 1 ? (
        /* Step 1 body + side rail */
        <div className="grid min-w-0 items-start gap-3.5">
          <IncidentGlassCard
            paddingClassName="p-6"
            incidentGlassCardClassName="gap-5"
            className="min-w-0"
          >
            <Text as="h2" className="text3 text-ehs-dark-bg">
              Basic Information
            </Text>

            {/* Seed from the persisted `values` so re-entering step 1
                restores what was typed rather than the blank defaults. */}
            <FormBuilder
              schema={createTemplateSchema}
              initialValues={values}
              onSubmit={handleBasicInfoSubmit}
              onChange={setValues}
              formId={BASIC_INFO_FORM_ID}
              className="fields-solid"
              hideActions
            />
          </IncidentGlassCard>
        </div>
      ) : step === 2 ? (
        <BuildSectionsStep
          sections={sections}
          onSectionsChange={setSections}
          highlightUnfilled={showUnfilledItems}
          exemptItemIds={initialItemIds}
        />
      ) : (
        <ReviewPublishStep
          values={values}
          sections={sections}
          onEditStep={setStep}
        />
      )}

      {/* Wizard footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        {step === 1 ? (
          <button
            type="button"
            onClick={() => router.push(TEMPLATES_ROUTE)}
            className="text4 text-ehs-dark-bg rounded-2.5 border-ehs-border-ink/12 bg-ehs-surface cursor-pointer border px-5 py-2.5 transition-colors"
          >
            Cancel
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="text4 text-ehs-dark-bg rounded-2.5 border-ehs-border-ink/12 bg-ehs-surface inline-flex cursor-pointer items-center gap-2 border px-5 py-2.5 transition-colors"
          >
            <Icon
              icon="mdi:arrow-left"
              className="size-4 shrink-0"
              aria-hidden="true"
            />
            Back
          </button>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingTemplate}
            className="text4 text-ehs-dark-bg border-ehs-border-ink/12 bg-ehs-surface inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon
              icon="mdi:content-save-outline"
              className="size-5 shrink-0"
              aria-hidden="true"
            />
            Save as Draft
          </button>

          {/* Step 1 submits the form so its validation runs first. */}
          <button
            type={step === 1 ? "submit" : "button"}
            form={step === 1 ? BASIC_INFO_FORM_ID : undefined}
            onClick={step === 1 ? undefined : handleNext}
            disabled={isSavingTemplate}
            className="text4 bg-ehs-normal-blue hover:bg-ehs-normal-blue-hover active:bg-ehs-normal-blue-active rounded-2.5 text-ehs-on-accent inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 shadow-(--ehs-shadow-button-primary-flat) transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Icon
              icon={PRIMARY_ICON[step]}
              className="size-4 shrink-0"
              aria-hidden="true"
            />
            {PRIMARY_LABEL[step]}
          </button>
        </div>
      </div>
    </div>
  );
}
