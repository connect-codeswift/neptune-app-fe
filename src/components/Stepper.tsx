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
    return "text-[0.936cqw] font-medium text-ehs-green";
  }
  if (isActive) {
    return "text-[0.936cqw] font-semibold text-ehs-darker";
  }
  return "text-[0.936cqw] text-ehs-muted-text";
}

export function Stepper(props: Readonly<StepperProps>) {
  const { steps, currentStep, ariaLabel = "Progress", className = "" } = props;

  return (
    <nav
      aria-label={ariaLabel}
      className={["w-full max-w-2xl", className].filter(Boolean).join(" ")}
    >
      <ol className="flex items-center gap-[0.4cqw] rounded-xl border border-white/60 bg-white/40 p-[0.4cqw] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_8px_24px_-12px_rgba(15,76,92,0.25)] backdrop-blur-xl backdrop-saturate-150">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <li
              key={`${stepNumber}-${step.label}`}
              aria-current={isActive ? "step" : undefined}
              className={[
                "flex flex-1 items-center gap-[0.4cqw] rounded-lg px-[0.664cqw] py-[0.4cqw] transition-colors",
                isActive ? "bg-white shadow-sm" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span
                aria-hidden="true"
                className={[
                  "flex h-[1.6cqw] w-[1.6cqw] shrink-0 items-center justify-center rounded-full text-[0.8cqw] font-semibold",
                  getStepBadgeClass(isCompleted, isActive),
                ].join(" ")}
              >
                {isCompleted ? (
                  <Icon icon="mdi:check" className="text-[0.936cqw]" />
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
