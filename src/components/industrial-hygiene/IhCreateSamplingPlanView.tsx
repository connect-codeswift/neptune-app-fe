"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IhModuleTabs } from "@/components/industrial-hygiene/IhModuleTabs";
import { IhPageHeader } from "@/components/industrial-hygiene/IhPageHeader";
import { IH_BASE_PATH } from "@/components/industrial-hygiene/ih-dashboard-data";
import {
  createSamplingPlanSchema,
  IH_CREATE_PLAN_FORM_ID,
  IH_CREATE_PLAN_INITIAL_VALUES,
} from "@/components/industrial-hygiene/ih-create-sampling-plan-data";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/toast";

/** Create Sampling Plan — Figma 5298:29449. */
export function IhCreateSamplingPlanView() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(
    IH_CREATE_PLAN_INITIAL_VALUES,
  );

  const goBack = () => {
    router.push(`${IH_BASE_PATH}/sampling-plans`);
  };

  const handleSaveDraft = () => {
    const name =
      typeof values.planName === "string" ? values.planName.trim() : "";
    toast.success(name ? `Draft saved: ${name}` : "Draft saved");
    goBack();
  };

  const handleCreate = () => {
    toast.success("Sampling plan created");
    goBack();
  };

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <DashboardHeader title="Industrial Hygiene Dashboard" showSiteSwitcher />

      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-4 pb-8">
        <IhModuleTabs />

        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3.5">
          <IhPageHeader
            breadcrumb={[
              "Safety",
              "Industrial Hygiene",
              "Sampling Plans",
              "New",
            ]}
            title="Create Sampling Plan"
            subtitle="Define a monitoring campaign: target agents, areas, schedule, and responsible person"
          />

          <IncidentGlassCard
            paddingClassName="p-7"
            className="min-w-0 rounded-2xl"
            incidentGlassCardClassName="gap-0"
          >
            <FormBuilder
              formId={IH_CREATE_PLAN_FORM_ID}
              schema={createSamplingPlanSchema}
              initialValues={IH_CREATE_PLAN_INITIAL_VALUES}
              onSubmit={handleCreate}
              onChange={setValues}
              hideActions
              className="gap-4.5"
            />

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(15,23,42,0.08)] pt-5">
              <Button
                type="button"
                variant="secondary"
                onClick={goBack}
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-[#2a3446]"
              >
                <Icon icon="mdi:arrow-left" className="size-3.5" aria-hidden />
                Cancel
              </Button>

              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  type="button"
                  variant="tertiary"
                  onClick={handleSaveDraft}
                  className="rounded-lg px-3.5 py-2 text-sm font-semibold text-[#2a3446]"
                >
                  Save as Draft
                </Button>
                <Button
                  type="submit"
                  form={IH_CREATE_PLAN_FORM_ID}
                  variant="primary"
                  className="rounded-lg px-3.5 py-2 text-sm font-semibold"
                >
                  Create Plan
                </Button>
              </div>
            </div>
          </IncidentGlassCard>
        </div>
      </div>
    </div>
  );
}
