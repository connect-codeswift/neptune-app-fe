import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

export type Step = Readonly<{
  label: string;
}>;

export type StepperProps = Readonly<{
  steps: readonly Step[];
  /** 1-based step index */
  currentStep: number;
  ariaLabel?: string;
  className?: string;
}>;

function getStepBadgeClass(isCompleted: boolean, isActive: boolean) {
  if (isCompleted) {
    return "bg-ehs-green text-ehs-light-text";
  }
  if (isActive) {
    return "bg-ehs-normal-blue text-ehs-light-text";
  }
  return "bg-ehs-border text-ehs-muted-text";
}

function getStepLabelClass(isCompleted: boolean, isActive: boolean) {
  if (isCompleted) {
    return "text-sm font-medium text-ehs-green";
  }
  if (isActive) {
    return "text-sm font-semibold text-ehs-darker";
  }
  return "text-sm text-ehs-muted-text";
}

export function Stepper(props: Readonly<StepperProps>) {
  const { steps, currentStep, ariaLabel = "Progress", className = "" } = props;

  return (
    <nav
      aria-label={ariaLabel}
      className={["hidden w-full max-w-2xl lg:block", className]
        .filter(Boolean)
        .join(" ")}
    >
      <ol className="flex items-center gap-1 rounded-xl border border-white/60 bg-white/40 p-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_8px_24px_-12px_rgba(15,76,92,0.25)] backdrop-blur-xl backdrop-saturate-150">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <li
              key={`${stepNumber}-${step.label}`}
              aria-current={isActive ? "step" : undefined}
              className={[
                "flex flex-1 items-center gap-1 rounded-lg px-2 py-1 transition-colors",
                isActive ? "bg-white shadow-sm" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span
                aria-hidden="true"
                className={[
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  getStepBadgeClass(isCompleted, isActive),
                ].join(" ")}
              >
                {isCompleted ? (
                  <Icon icon="mdi:check" className="text-sm" />
                ) : (
                  stepNumber
                )}
              </span>
              <Text
                as="span"
                className={getStepLabelClass(isCompleted, isActive)}
              >
                {step.label}
              </Text>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
