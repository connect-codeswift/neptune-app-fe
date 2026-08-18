"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { FormBuilder } from "@/components/form-builder";
import { DashboardHeader } from "@/components/DashboardHeader";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IhModuleTabs } from "@/components/industrial-hygiene/IhModuleTabs";
import { IhPageHeader } from "@/components/industrial-hygiene/IhPageHeader";
import { IH_BASE_PATH } from "@/components/industrial-hygiene/ih-dashboard-data";
import {
  addHazardAgentSchema,
  getIhAgentById,
  getIhAgentEditValues,
  IH_EDIT_AGENT_FORM_ID,
} from "@/components/industrial-hygiene/ih-add-agent-data";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { toast } from "@/lib/toast";

/** Edit Hazard Agent — Figma 5313:31882. */
export function IhEditAgentView() {
  const router = useRouter();
  const params = useParams<{ agentId: string }>();
  const agentId = typeof params.agentId === "string" ? params.agentId : "";

  const agent = useMemo(() => getIhAgentById(agentId), [agentId]);
  const initialValues = useMemo(
    () => (agent ? getIhAgentEditValues(agent) : null),
    [agent],
  );

  const goBack = () => {
    router.push(`${IH_BASE_PATH}/agent-library`);
  };

  const handleSubmit = () => {
    toast.success(agent ? `Saved changes: ${agent.name}` : "Changes saved");
    goBack();
  };

  if (!agent || !initialValues) {
    return (
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <DashboardHeader title="Industrial Hygiene Dashboard" showSiteSwitcher />
        <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-4 pb-8">
          <IhModuleTabs />
          <IncidentGlassCard
            paddingClassName="p-8"
            className="min-w-0 rounded-2xl"
            incidentGlassCardClassName="items-center gap-3 text-center"
          >
            <Text as="h1" className="text-lg font-bold text-[#0b1320]">
              Agent not found
            </Text>
            <Text as="p" className="text-sm text-[#8892a3]">
              This hazard agent could not be loaded.
            </Text>
            <Button
              type="button"
              variant="primary"
              onClick={goBack}
              className="mt-2 rounded-lg px-3.5 py-2 text-sm font-semibold"
            >
              Back to Agent Library
            </Button>
          </IncidentGlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <DashboardHeader title="Industrial Hygiene Dashboard" showSiteSwitcher />

      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-4 pb-8">
        <IhModuleTabs />

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3.5">
          <IhPageHeader
            breadcrumb={["Safety", "Industrial Hygiene", "Agents", "Edit"]}
            title={`Edit Agent — ${agent.name}`}
            subtitle="Define agent identity, type, and all occupational exposure limits"
          />

          <IncidentGlassCard
            paddingClassName="p-7"
            className="min-w-0 rounded-2xl"
            incidentGlassCardClassName="gap-0"
          >
            <FormBuilder
              formId={IH_EDIT_AGENT_FORM_ID}
              schema={addHazardAgentSchema}
              initialValues={initialValues}
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
                form={IH_EDIT_AGENT_FORM_ID}
                variant="primary"
                className="rounded-lg px-3.5 py-2 text-sm font-semibold shadow-[0px_6px_18px_-6px_#0891a6]"
              >
                Save Changes
              </Button>
            </div>
          </IncidentGlassCard>
        </div>
      </div>
    </div>
  );
}
