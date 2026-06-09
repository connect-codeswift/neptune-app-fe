import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { Step } from "@/components/onboarding/Stepper";

export type MobileStepperProps = Readonly<{
  steps: readonly Step[];
  /** 1-based step index */
  currentStep: number;
  onStepChange?: (step: number) => void;
  onBack?: () => void;
  ariaLabel?: string;
  className?: string;
}>;

function getMobileStepButtonClass(isActive: boolean, isCompleted: boolean) {
  if (isActive) {
    return "border-ehs-normal-blue/25 bg-white text-ehs-darker shadow-sm shadow-ehs-normal-blue/15";
  }

  if (isCompleted) {
    return "border-ehs-normal-blue/20 bg-ehs-light-blue/80 text-ehs-dark-blue";
  }

  return "border-white/60 bg-white/45 text-ehs-muted-text";
}

export function MobileStepper(props: Readonly<MobileStepperProps>) {
  const {
    steps,
    currentStep,
    onStepChange,
    onBack,
    ariaLabel = "Onboarding progress",
    className = "",
  } = props;
  const totalSteps = steps.length;
  const activeStep = steps[currentStep - 1];

  return (
    <nav
      aria-label={ariaLabel}
      className={["flex w-full flex-col gap-3", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center justify-between px-1">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-ehs-gray hover:text-ehs-darker inline-flex cursor-pointer items-center gap-1 text-sm font-medium transition-colors"
          >
            <Icon icon="mdi:chevron-left" className="text-lg" aria-hidden="true" />
            Back
          </button>
        ) : (
          <span aria-hidden="true" />
        )}

        <Text as="span" className="text-ehs-muted-text text-xs font-semibold">
          {`${currentStep} of ${totalSteps}`}
        </Text>
      </div>

      <div className="shadow-ehs-normal-blue/15 rounded-3xl border border-white/70 bg-white/60 p-2 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3 rounded-2xl bg-white/75 p-3 shadow-sm">
          <span
            aria-hidden="true"
            className="bg-ehs-normal-blue text-ehs-light-text shadow-ehs-normal-blue/30 flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-md"
          >
            {currentStep}
          </span>
          <span className="min-w-0">
            <Text as="span" className="text-ehs-darker block truncate text-sm font-bold">
              {activeStep.label}
            </Text>
            {activeStep.description ? (
              <Text
                as="span"
                className="text-ehs-normal-blue block truncate text-xs font-medium"
              >
                {activeStep.description}
              </Text>
            ) : null}
          </span>
        </div>

        <ol className="mt-2 grid grid-cols-3 gap-1.5">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <li key={`${stepNumber}-${step.label}`} className="min-w-0">
                <button
                  type="button"
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Go to step ${stepNumber}: ${step.label}`}
                  onClick={() => onStepChange?.(stepNumber)}
                  className={[
                    "flex h-10 w-full cursor-pointer items-center justify-center rounded-2xl border text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ehs-normal-blue/30",
                    getMobileStepButtonClass(isActive, isCompleted),
                  ].join(" ")}
                >
                  {isCompleted ? (
                    <Icon
                      icon="mdi:check"
                      className="text-base"
                      aria-hidden="true"
                    />
                  ) : (
                    stepNumber
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
