"use client";

import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export type ClosureStepId = 1 | 2 | 3 | 4;

export type IncidentClosureStepsSidebarProps = Readonly<{
  currentStep: ClosureStepId;
  onSelectStep: (step: ClosureStepId) => void;
}>;

const STEPS = [
  {
    id: 1 as const,
    title: "Closure Classification",
    subtitle: "Type, severity & recordability",
  },
  {
    id: 2 as const,
    title: "Root Cause Summary",
    subtitle: "RCA, equipment & procedures",
  },
  {
    id: 3 as const,
    title: "Preventive Measures",
    subtitle: "Action plans & linked CAPAs",
  },
  {
    id: 4 as const,
    title: "Review & Sign-off",
    subtitle: "MFA signature & submission",
  },
];

export function IncidentClosureStepsSidebar(
  props: Readonly<IncidentClosureStepsSidebarProps>,
) {
  const { currentStep, onSelectStep } = props;
  const progressPercent = (currentStep / 4) * 100;

  return (
    <IncidentGlassCard
      paddingClassName="p-6"
      incidentGlassCardClassName="gap-5"
      className="h-fit rounded-[24px] border border-[rgba(15,23,42,0.06)] shadow-[0px_4px_24px_rgba(0,0,0,0.03)]"
    >
      <Text
        as="h4"
        className="text-[12px] font-bold tracking-[0.08em] text-[#94a3b8] uppercase"
      >
        STEPS
      </Text>

      <div className="flex flex-col gap-3.5">
        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelectStep(step.id)}
              className={[
                "flex items-start gap-3.5 rounded-[20px] text-left transition-all duration-200",
                isActive
                  ? "bg-[#d2eff4] px-4 py-3.5 shadow-xs"
                  : "px-3 py-3 hover:bg-white/60",
              ].join(" ")}
            >
              <div
                className={[
                  "mt-0.5 flex size-[30px] shrink-0 items-center justify-center rounded-full text-[13px] transition-colors",
                  isActive
                    ? "bg-[#008ba3] font-bold text-white shadow-xs"
                    : "border border-[#e2e8f0] bg-white font-semibold text-[#64748b]",
                ].join(" ")}
              >
                {step.id}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <Text
                  as="span"
                  className={[
                    "text-[14px] leading-snug font-bold",
                    isActive ? "text-[#008ba3]" : "text-[#1e293b]",
                  ].join(" ")}
                >
                  {step.title}
                </Text>
                <Text
                  as="span"
                  className={[
                    "text-[12px] leading-snug font-normal",
                    isActive ? "text-[#5b8793]" : "text-[#94a3b8]",
                  ].join(" ")}
                >
                  {step.subtitle}
                </Text>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-2 border-t border-[#f1f5f9] pt-5">
        <div className="flex items-center justify-between">
          <Text as="span" className="text-[12px] font-medium text-[#94a3b8]">
            Progress
          </Text>
          <Text as="span" className="text-[13px] font-bold text-[#0f172a]">
            {`${String(currentStep)} / 4`}
          </Text>
        </div>
        <div className="mt-2.5 h-[6px] w-full overflow-hidden rounded-full bg-[#e2e8f0]">
          <div
            className="h-full rounded-full bg-[#008ba3] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </IncidentGlassCard>
  );
}
