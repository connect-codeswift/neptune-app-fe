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
import { ScoringLogicStep } from "./ScoringLogicStep";
import {
  TemplateWizardProgress,
  TemplateWizardStepList,
} from "./TemplateWizardSteps";
import {
  createInitialSections,
  createScoringConfig,
  isItemValueFilled,
  isRuleComplete,
  type ScoringConfig,
  type TemplateRule,
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

/** Live preview of how the template will present in the templates grid. */
function TemplatePreview(
  props: Readonly<{ name: string; tags: readonly string[] }>,
) {
  const { name, tags } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      incidentGlassCardClassName="gap-3"
    >
      <Text as="h3" className="text9 text-ehs-muted-text">
        Preview
      </Text>

      <div className="border-ehs-border-ink/10 bg-ehs-surface flex flex-col gap-2 rounded-xl border p-4">
        <span
          className={
            name ? "text5 text-ehs-dark-bg" : "text4 text-ehs-muted-text"
          }
        >
          {name || "Template name…"}
        </span>

        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-ehs-normal-blue/10 text-ehs-dark-blue text8 rounded-md px-2 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </IncidentGlassCard>
  );
}

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
  const [scoring, setScoring] = useState<ScoringConfig>(
    () => initialState?.scoring ?? createScoringConfig(),
  );
  const [rules, setRules] = useState<TemplateRule[]>(
    () => initialState?.rules ?? [],
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
    // The backend rejects the whole template if any rule is half-filled.
    if (rules.some((rule) => !isRuleComplete(rule))) {
      toast.error(
        "Every rule needs a question, a condition and an action — complete or remove it.",
      );
      setStep(3);
      return;
    }

    const draft = { values, sections, scoring, rules };
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

  /** Step 3's Next: catch half-filled rules here rather than at publish. */
  const handleScoringLogicNext = () => {
    if (rules.some((rule) => !isRuleComplete(rule))) {
      toast.error(
        "Every rule needs a question, a condition and an action — complete or remove it.",
      );
      return;
    }

    setStep(4);
  };

  /** Advance/finish depending on the current step. */
  const handleNext = () => {
    if (step === 2) handleBuildSectionsNext();
    else if (step === 3) handleScoringLogicNext();
  };

  const NEXT_LABEL: Record<number, string> = {
    1: "Next: Build Sections",
    2: "Next: Scoring & Logic",
    3: "Next: Review & Publish",
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
            4-step wizard — build, configure, and publish your template
          </Text>
        </div>

        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={isSavingTemplate}
          className="text4 text-ehs-dark-bg border-ehs-border-ink/12 bg-ehs-surface inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon
            icon="mdi:content-save-outline"
            className="size-5 shrink-0"
            aria-hidden="true"
          />
          Save as Draft
        </button>
      </div>

      <TemplateWizardProgress currentStep={step} />

      {step === 1 ? (
        /* Step 1 body + side rail */
        <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
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

          <div className="flex min-w-0 flex-col gap-3.5">
            <TemplatePreview
              name={String(values.templateName ?? "")}
              tags={(values.tags as string[] | undefined) ?? []}
            />
            <TemplateWizardStepList currentStep={step} />
          </div>
        </div>
      ) : step === 2 ? (
        <BuildSectionsStep
          sections={sections}
          onSectionsChange={setSections}
          highlightUnfilled={showUnfilledItems}
          exemptItemIds={initialItemIds}
        />
      ) : step === 3 ? (
        <ScoringLogicStep
          sections={sections}
          onSectionsChange={setSections}
          scoring={scoring}
          onScoringChange={setScoring}
          rules={rules}
          onRulesChange={setRules}
        />
      ) : (
        <ReviewPublishStep
          values={values}
          sections={sections}
          scoring={scoring}
          rules={rules}
          isSubmitting={isSavingTemplate}
          onEditStep={setStep}
          onPublish={handlePublish}
          onSaveDraft={handleSaveDraft}
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

        {/* The final step carries its own Publish / Save actions in the panel. */}
        {step < 4 ? (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="text4 text-ehs-dark-bg border-ehs-border-ink/12 bg-ehs-surface inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 transition-colors"
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
              className="text4 bg-ehs-normal-blue hover:bg-ehs-normal-blue-hover active:bg-ehs-normal-blue-active rounded-2.5 text-ehs-on-accent inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 shadow-(--ehs-shadow-button-primary-flat) transition-colors"
            >
              <Icon
                icon="mdi:arrow-right"
                className="size-4 shrink-0"
                aria-hidden="true"
              />
              {NEXT_LABEL[step]}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
