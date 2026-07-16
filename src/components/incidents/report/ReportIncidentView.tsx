"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createInitialReportFormState,
  REPORT_STEPS,
  SEVERITY_OPTIONS,
  type ReportIncidentFormState,
  type ReportStepId,
} from "@/components/incidents/report/report-incident-data";
import { ReportIncidentAside } from "@/components/incidents/report/ReportIncidentAside";
import { ReportIncidentPageHeader } from "@/components/incidents/report/ReportIncidentPageHeader";
import { ReportIncidentStepOne } from "@/components/incidents/report/ReportIncidentStepOne";
import { ReportIncidentStepTwo } from "@/components/incidents/report/ReportIncidentStepTwo";
import { ReportIncidentSteps } from "@/components/incidents/report/ReportIncidentSteps";
import { ReportIncidentToolbar } from "@/components/incidents/report/ReportIncidentToolbar";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";

function ComingSoonStep(
  props: Readonly<{
    step: ReportStepId;
    onBack: () => void;
    onContinue: () => void;
  }>,
) {
  const { step, onBack, onContinue } = props;
  const stepMeta = REPORT_STEPS.find((item) => item.id === step);

  return (
    <IncidentGlassCard paddingClassName="p-[29px]" className="min-w-0 flex-1">
      <div className="flex min-h-[420px] flex-col gap-7">
        <div>
          <Text
            as="p"
            className="text-ehs-dark-blue text-[10px] font-bold tracking-[1.4px] uppercase"
          >
            {`Step ${String(step)}`}
          </Text>
          <Text
            as="h2"
            className="text-ehs-dark-bg mt-1.5 text-[21.3px] font-bold tracking-[-0.44px]"
          >
            {stepMeta?.title ?? "Next step"}
          </Text>
          <Text as="p" className="text-ehs-gray mt-1.5 text-[12px]">
            {stepMeta?.description ??
              "This step will be available in a following iteration."}
          </Text>
        </div>

        <div className="mt-auto border-t border-[rgba(15,23,42,0.08)] pt-[21px]">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="tertiary"
              onClick={onBack}
              className="rounded-[10px] px-[15px] py-2.5 text-[13px] font-bold"
            >
              <Icon
                icon="mdi:chevron-left"
                className="size-[13px]"
                aria-hidden="true"
              />
              Back
            </Button>
            <div className="min-w-0 flex-1" />
            {step < 5 ? (
              <Button
                type="button"
                variant="primary"
                onClick={onContinue}
                className="rounded-[10px] px-[15px] py-2.5 text-[13px] font-bold shadow-[0px_6px_18px_-6px_#0891a6]"
              >
                Continue
                <Icon
                  icon="mdi:chevron-right"
                  className="size-[13px]"
                  aria-hidden="true"
                />
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </IncidentGlassCard>
  );
}

function renderStepForm(
  currentStep: ReportStepId,
  form: ReportIncidentFormState,
  updateForm: (next: Partial<ReportIncidentFormState>) => void,
  handleBack: () => void,
  handleContinue: () => void,
) {
  if (currentStep === 1) {
    return (
      <ReportIncidentStepOne
        form={form}
        onChange={updateForm}
        onBack={handleBack}
        onContinue={handleContinue}
      />
    );
  }

  if (currentStep === 2) {
    return (
      <ReportIncidentStepTwo
        form={form}
        onChange={updateForm}
        onBack={handleBack}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <ComingSoonStep
      step={currentStep}
      onBack={handleBack}
      onContinue={handleContinue}
    />
  );
}

export function ReportIncidentView() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<ReportStepId>(1);
  const [form, setForm] = useState<ReportIncidentFormState>(
    createInitialReportFormState,
  );

  // Fast Refresh can keep older form state that predates step-2 fields.
  const formDefaults = createInitialReportFormState();
  const normalizedForm: ReportIncidentFormState = {
    ...formDefaults,
    ...form,
    photos: form.photos ?? formDefaults.photos,
  };

  const severityOption =
    SEVERITY_OPTIONS.find((option) => option.id === normalizedForm.severity) ??
    SEVERITY_OPTIONS[1];

  const updateForm = (next: Partial<ReportIncidentFormState>) => {
    setForm((prev) => ({
      ...createInitialReportFormState(),
      ...prev,
      ...next,
    }));
  };

  const goToStep = (step: ReportStepId) => {
    setCurrentStep(step);
  };

  const handleContinue = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as ReportStepId);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as ReportStepId);
      return;
    }
    router.push("/incidents/list");
  };

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <ReportIncidentToolbar className="px-3 sm:px-4" />

      <div className="flex min-w-0 flex-1 flex-col gap-0 px-3 pb-8 sm:px-4">
        <ReportIncidentPageHeader
          onSaveExit={() => router.push("/incidents/list")}
        />

        <div className="mt-3.5 grid grid-cols-1 gap-3.5 py-3.5 xl:grid-cols-[220px_minmax(0,1fr)_320px] xl:items-start">
          <ReportIncidentSteps
            currentStep={currentStep}
            onStepChange={goToStep}
          />

          {renderStepForm(
            currentStep,
            normalizedForm,
            updateForm,
            handleBack,
            handleContinue,
          )}

          <ReportIncidentAside
            severityBadge={severityOption.previewBadge}
            location={normalizedForm.location}
            title={currentStep >= 2 ? normalizedForm.title : ""}
            description={currentStep >= 2 ? normalizedForm.description : ""}
            currentStep={currentStep}
          />
        </div>
      </div>
    </div>
  );
}
