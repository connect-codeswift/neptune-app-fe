import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import type { Step } from "@/components/onboarding/Stepper";

export type MobileStepperProps = Readonly<{
  steps: readonly Step[];
  /** 1-based step index */
  currentStep: number;
  onStepChange?: (step: number) => void;
  ariaLabel?: string;
  className?: string;
}>;

type MobileStepSlotProps = Readonly<{
  step: Step;
  stepNumber: number;
  isActive: boolean;
  isCompleted: boolean;
  onStepChange?: (step: number) => void;
}>;

function MobileStepSlot(props: Readonly<MobileStepSlotProps>) {
  const { step, stepNumber, isActive, isCompleted, onStepChange } = props;

  if (isActive) {
    return (
      <button
        type="button"
        aria-current="step"
        onClick={() => onStepChange?.(stepNumber)}
        className="border-ehs-light-blue-active/70 py-3 shadow-ehs-normal-blue/15 focus-visible:ring-ehs-normal-blue/30 inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border bg-white px-6 shadow-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <span
          aria-hidden="true"
          className="bg-ehs-normal-blue text-ehs-light-text shadow-ehs-normal-blue/35 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-md"
        >
          {stepNumber}
        </span>
        <Text as="span" className="text-ehs-darker whitespace-nowrap text-sm font-bold">
          {step.label}
        </Text>
      </button>
    );
  }

  if (isCompleted) {
    return (
      <button
        type="button"
        aria-label={`Go to step ${stepNumber}: ${step.label}`}
        onClick={() => onStepChange?.(stepNumber)}
        className="focus-visible:ring-ehs-normal-blue/30 px-2 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <span
          aria-hidden="true"
          className="bg-ehs-green shadow-ehs-green/40 flex size-8 items-center justify-center rounded-full text-white shadow-md"
        >
          <Icon icon="mdi:check" className="text-base" />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={`Go to step ${stepNumber}: ${step.label}`}
      onClick={() => onStepChange?.(stepNumber)}
      className="focus-visible:ring-ehs-normal-blue/30 shrink-0 cursor-pointer rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <span
        aria-hidden="true"
        className="bg-gray-200 text-ehs-muted-text flex size-8 items-center justify-center rounded-full text-sm font-semibold"
      >
        {stepNumber}
      </span>
    </button>
  );
}

export function MobileStepper(props: Readonly<MobileStepperProps>) {
  const {
    steps,
    currentStep,
    onStepChange,
    ariaLabel = "Onboarding progress",
    className = "",
  } = props;

  return (
    <nav
      aria-label={ariaLabel}
      className={["w-full", className].filter(Boolean).join(" ")}
    >
      <ol className="shadow-ehs-normal-blue/15 flex items-center justify-between rounded-full border border-white/70 bg-white/60 px-5 py-2 shadow-lg backdrop-blur-xl">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <li
              key={`${stepNumber}-${step.label}`}
              className="flex shrink-0 items-center px-2 justify-center"
            >
              <MobileStepSlot
                step={step}
                stepNumber={stepNumber}
                isActive={isActive}
                isCompleted={isCompleted}
                onStepChange={onStepChange}
              />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
