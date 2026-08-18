"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { FormBuilder } from "@/components/form-builder";
import { DashboardHeader } from "@/components/DashboardHeader";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IhModuleTabs } from "@/components/industrial-hygiene/IhModuleTabs";
import { IhPageHeader } from "@/components/industrial-hygiene/IhPageHeader";
import { IH_BASE_PATH } from "@/components/industrial-hygiene/ih-dashboard-data";
import {
  addHazardAgentSchema,
  IH_ADD_AGENT_FORM_ID,
  IH_ADD_AGENT_INITIAL_VALUES,
} from "@/components/industrial-hygiene/ih-add-agent-data";
import { Button } from "@/components/ui/Button";
import { toast } from "@/lib/toast";

/** Add Hazard Agent — Figma 5305:31312. */
export function IhAddAgentView() {
  const router = useRouter();

  const goBack = () => {
    router.push(`${IH_BASE_PATH}/agent-library`);
  };

  const handleSubmit = () => {
    toast.success("Hazard agent added");
    goBack();
  };

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <DashboardHeader title="Industrial Hygiene Dashboard" showSiteSwitcher />

      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-4 pb-8">
        <IhModuleTabs />

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3.5">
          <IhPageHeader
            breadcrumb={["Safety", "Industrial Hygiene", "Agents", "Add"]}
            title="Add Hazard Agent"
            subtitle="Define agent identity, type, and all occupational exposure limits"
          />

          <IncidentGlassCard
            paddingClassName="p-7"
            className="min-w-0 rounded-2xl"
            incidentGlassCardClassName="gap-0"
          >
            <FormBuilder
              formId={IH_ADD_AGENT_FORM_ID}
              schema={addHazardAgentSchema}
              initialValues={IH_ADD_AGENT_INITIAL_VALUES}
              onSubmit={handleSubmit}
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

              <Button
                type="submit"
                form={IH_ADD_AGENT_FORM_ID}
                variant="primary"
                className="rounded-lg px-3.5 py-2 text-sm font-semibold shadow-[0px_6px_18px_-6px_#0891a6]"
              >
                Add Agent
              </Button>
            </div>
          </IncidentGlassCard>
        </div>
      </div>
    </div>
  );
}
