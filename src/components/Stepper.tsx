import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

export type Step = Readonly<{
  label: string;
}>;

export type StepperProps = Readonly<{
  steps: readonly Step[];
  /** 1-based step index */
  currentStep: number;
  showLogo?: boolean;
  ariaLabel?: string;
  className?: string;
}>;

export function Stepper(props: Readonly<StepperProps>) {
  const {
    steps,
    currentStep,
    showLogo = true,
    ariaLabel = "Progress",
    className = "",
  } = props;

  return (
    <header
      className={["flex w-full flex-col items-center gap-6", className]
        .filter(Boolean)
        .join(" ")}
    >
      {showLogo ? (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ehs-normal-blue">
            <Icon icon="mdi:waves" className="text-lg text-ehs-light-text" aria-hidden="true" />
          </div>
          <Text as="span" className="text-base font-semibold tracking-tight text-ehs-darker">
            Neptune
          </Text>
        </div>
      ) : null}

      <nav aria-label={ariaLabel} className="w-full max-w-xl">
        <ol className="flex items-center rounded-xl bg-ehs-light-bg p-1">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;

            return (
              <li
                key={`${stepNumber}-${step.label}`}
                aria-current={isActive ? "step" : undefined}
                className={[
                  "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 transition-colors",
                  isActive ? "bg-white shadow-sm" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                    isActive
                      ? "bg-ehs-normal-blue text-ehs-light-text"
                      : "bg-ehs-border text-ehs-muted-text",
                  ].join(" ")}
                >
                  {stepNumber}
                </span>
                <Text
                  as="span"
                  className={
                    isActive
                      ? "text-sm font-semibold text-ehs-darker"
                      : "text-sm text-ehs-muted-text"
                  }
                >
                  {step.label}
                </Text>
              </li>
            );
          })}
        </ol>
      </nav>
    </header>
  );
}
