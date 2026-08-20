import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";

export const TEMPLATE_WIZARD_STEPS = [
  "Basic Info",
  "Build Sections",
  "Review & Publish",
] as const;

/** Horizontal tracker across the top of the wizard. */
export function TemplateWizardProgress(
  props: Readonly<{ currentStep: number }>,
) {
  const { currentStep } = props;

  return (
    <IncidentGlassCard paddingClassName="px-6 py-5" className="min-w-0">
      <ol className="flex items-start">
        {TEMPLATE_WIZARD_STEPS.map((label, index) => {
          const stepNumber = index + 1;
          const isCurrent = stepNumber === currentStep;
          const isDone = stepNumber < currentStep;

          return (
            <li
              key={label}
              className="flex min-w-0 flex-1 items-start last:flex-none"
            >
              <div className="flex w-fit shrink-0 flex-col items-center gap-2">
                <span
                  aria-hidden="true"
                  className={[
                    "flex size-7 items-center justify-center rounded-full text-sm font-bold",
                    isDone
                      ? "bg-ehs-green text-ehs-on-accent"
                      : isCurrent
                        ? "bg-ehs-normal-blue text-ehs-on-accent"
                        : "text-ehs-muted-text border-ehs-border-ink/12 bg-ehs-form-classes-bg border",
                  ].join(" ")}
                >
                  {isDone ? (
                    <Icon icon="mdi:check" className="size-4" />
                  ) : (
                    stepNumber
                  )}
                </span>
                <span
                  className={[
                    "text-sm whitespace-nowrap",
                    isDone
                      ? "text-ehs-green"
                      : isCurrent
                        ? "text-ehs-normal-blue font-semibold"
                        : "text-ehs-muted-text",
                  ].join(" ")}
                >
                  {label}
                </span>
              </div>

              {/* Connector to the next step; the last item has none. */}
              {stepNumber < TEMPLATE_WIZARD_STEPS.length ? (
                <span
                  aria-hidden="true"
                  className={[
                    "mt-3.5 h-px min-w-4 flex-1",
                    isDone ? "bg-ehs-green" : "bg-ehs-surface-inverse/10",
                  ].join(" ")}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </IncidentGlassCard>
  );
}

/** Side rail listing the same steps vertically. */
export function TemplateWizardStepList(
  props: Readonly<{ currentStep: number }>,
) {
  const { currentStep } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      incidentGlassCardClassName="gap-3"
    >
      <h3 className="text-ehs-dark-bg font-bold">Wizard steps</h3>

      <ol className="flex flex-col gap-3">
        {TEMPLATE_WIZARD_STEPS.map((label, index) => {
          const stepNumber = index + 1;
          const isCurrent = stepNumber === currentStep;

          return (
            <li key={label} className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className={[
                  "flex size-5 items-center justify-center rounded-full text-sm font-bold",
                  isCurrent
                    ? "bg-ehs-normal-blue text-ehs-on-accent"
                    : "text-ehs-muted-text bg-ehs-form-classes-bg",
                ].join(" ")}
              >
                {stepNumber}
              </span>
              <span
                className={[
                  "",
                  isCurrent
                    ? "text-ehs-normal-blue font-semibold"
                    : "text-ehs-muted-text",
                ].join(" ")}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </IncidentGlassCard>
  );
}
