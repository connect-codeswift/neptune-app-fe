import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

export type MobileStepperProps = Readonly<{
  /** 1-based step index */
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  ariaLabel?: string;
  className?: string;
}>;

export function MobileStepper(props: Readonly<MobileStepperProps>) {
  const {
    currentStep,
    totalSteps,
    onBack,
    ariaLabel = "Onboarding progress",
    className = "",
  } = props;

  return (
    <nav
      aria-label={ariaLabel}
      className={["flex w-full flex-col gap-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center justify-between">
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

        <Text as="span" className="text-ehs-muted-text text-sm font-medium">
          {`${currentStep} of ${totalSteps}`}
        </Text>
      </div>

      <ol className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isFilled = stepNumber <= currentStep;

          return (
            <li
              key={stepNumber}
              className={[
                "h-1.5 flex-1 rounded-full transition-colors",
                isFilled ? "bg-ehs-normal-blue" : "bg-ehs-border",
              ].join(" ")}
            />
          );
        })}
      </ol>
    </nav>
  );
}
