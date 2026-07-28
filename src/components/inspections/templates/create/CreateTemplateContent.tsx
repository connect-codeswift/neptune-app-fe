"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateInspectionTemplateMutation } from "@/hooks/use-inspection-template-mutations";
import { toast } from "@/lib/toast";
import { BuildSectionsStep } from "./BuildSectionsStep";
import { ReviewPublishStep } from "./ReviewPublishStep";
import { ScoringLogicStep } from "./ScoringLogicStep";
import { SettingsStep } from "./SettingsStep";
import {
  TemplateWizardProgress,
  TemplateWizardStepList,
} from "./TemplateWizardSteps";
import {
  createInitialSections,
  createScoringConfig,
  createSettings,
  isItemValueFilled,
  isRuleComplete,
  type ScoringConfig,
  type TemplateRule,
  type TemplateSection,
  type TemplateSettings,
} from "./template-builder-data";
import {
  createTemplateInitialValues,
  createTemplateSchema,
} from "./create-template-schema";
import { toInspectionTemplatePayload } from "./to-template-payload";

const TEMPLATES_ROUTE = "/dashboard/inspections/template";
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
      <h3 className="text-ehs-muted-text text-sm font-bold tracking-wider uppercase">
        Preview
      </h3>

      <div className="flex flex-col gap-2 rounded-xl border border-slate-900/10 bg-white p-4">
        <span
          className={
            name ? "text-ehs-dark-bg font-semibold" : "text-ehs-muted-text"
          }
        >
          {name || "Template name…"}
        </span>

        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-ehs-normal-blue/10 text-ehs-dark-blue rounded-md px-2 py-0.5 text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </IncidentGlassCard>
  );
}

export function CreateTemplateContent() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  // Mirrors the form so the preview can react as the user types.
  const [values, setValues] = useState<FormValues>(createTemplateInitialValues);
  const [sections, setSections] = useState<TemplateSection[]>(
    createInitialSections,
  );
  const [scoring, setScoring] = useState<ScoringConfig>(createScoringConfig);
  const [rules, setRules] = useState<TemplateRule[]>([]);
  const [settings, setSettings] = useState<TemplateSettings>(createSettings);
  const [showUnfilledItems, setShowUnfilledItems] = useState(false);

  const createTemplate = useCreateInspectionTemplateMutation();

  /** POST the wizard state as a draft or a published template. */
  const submitTemplate = (publish: boolean) => {
    // The backend rejects the whole template if any rule is half-filled.
    if (rules.some((rule) => !isRuleComplete(rule))) {
      toast.error(
        "Every rule needs a question, a condition and an action — complete or remove it.",
      );
      setStep(3);
      return;
    }

    const draft = { values, sections, scoring, rules, settings };
    const payload = toInspectionTemplatePayload(draft, { publish });

    console.log("Template wizard data", draft);
    console.log("Inspection template payload", payload);

    createTemplate.mutate(payload, {
      // Prefer the backend's own wording; fall back to ours when it sends none.
      onSuccess: (response) => {
        toast.success(
          response.message || (publish ? "Template published" : "Draft saved"),
        );
        if (publish) router.push(TEMPLATES_ROUTE);
      },
      onError: (error) => {
        toast.error(
          getMutationErrorMessage(
            error,
            publish
              ? "Could not publish the template. Please try again."
              : "Could not save the draft. Please try again.",
          ),
        );
      },
    });
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

    const hasUnfilled = sections.some((section) =>
      section.items.some((item) => !isItemValueFilled(item)),
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
    else if (step === 4) setStep(5);
  };

  const NEXT_LABEL: Record<number, string> = {
    1: "Next: Build Sections",
    2: "Next: Scoring & Logic",
    3: "Next: Settings",
    4: "Next: Review & Publish",
  };

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      {/* Header */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white px-6 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)]">
        <div className="flex min-w-0 flex-col gap-1.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1">
            <Link
              href={TEMPLATES_ROUTE}
              className="text-ehs-gray hover:text-ehs-dark-bg text-sm font-medium transition-colors"
            >
              Templates
            </Link>
            <Icon
              icon="mdi:chevron-right"
              className="text-ehs-muted-text size-4"
              aria-hidden="true"
            />
            <span className="text-ehs-muted-text text-sm font-medium">
              Create Template
            </span>
          </nav>

          <Text
            as="h1"
            className="text-ehs-dark-bg text-2xl font-semibold tracking-[-0.2px]"
          >
            Create Inspection Template
          </Text>

          <Text as="p" className="text-ehs-muted-text text-sm">
            5-step wizard — build, configure, and publish your template
          </Text>
        </div>

        <button
          type="button"
          onClick={handleSaveDraft}
          className="text-ehs-dark-bg inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-slate-900/12 bg-white px-4 py-2.5 font-medium transition-colors"
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
            <h2 className="text-ehs-dark-bg text-lg font-bold">
              Basic Information
            </h2>

            {/* Seed from the persisted `values` so re-entering step 1
                restores what was typed rather than the blank defaults. */}
            <FormBuilder
              schema={createTemplateSchema}
              initialValues={values}
              onSubmit={handleBasicInfoSubmit}
              onChange={setValues}
              formId={BASIC_INFO_FORM_ID}
              className="fields-white"
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
      ) : step === 4 ? (
        <SettingsStep settings={settings} onSettingsChange={setSettings} />
      ) : (
        <ReviewPublishStep
          values={values}
          sections={sections}
          scoring={scoring}
          rules={rules}
          settings={settings}
          isSubmitting={createTemplate.isPending}
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
            className="text-ehs-dark-bg cursor-pointer rounded-[10px] border border-slate-900/12 bg-white px-5 py-2.5 font-medium transition-colors"
          >
            Cancel
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="text-ehs-dark-bg inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-slate-900/12 bg-white px-5 py-2.5 font-medium transition-colors"
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
        {step < 5 ? (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="text-ehs-dark-bg inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-900/12 bg-white px-4 py-2.5 font-medium transition-colors"
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
              className="bg-ehs-normal-blue hover:bg-ehs-normal-blue-hover active:bg-ehs-normal-blue-active inline-flex cursor-pointer items-center gap-2 rounded-[10px] px-5 py-2.5 text-sm font-semibold text-white shadow-[0px_6px_18px_-6px_#0891a6] transition-colors"
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
