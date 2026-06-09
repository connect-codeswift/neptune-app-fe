import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";

export type Step = Readonly<{
  label: string;
  description?: string;
}>;

export type StepperProps = Readonly<{
  steps: readonly Step[];
  /** 1-based step index */
  currentStep: number;
  onStepChange?: (step: number) => void;
  ariaLabel?: string;
  className?: string;
}>;

function getBadgeClass(isCompleted: boolean, isActive: boolean) {
  if (isCompleted) {
    return "border-ehs-normal-blue/30 bg-ehs-light-blue text-ehs-dark-blue";
  }
  if (isActive) {
    return "bg-ehs-normal-blue text-ehs-light-text shadow-md shadow-ehs-normal-blue/30";
  }
  return "border-ehs-border bg-white/70 text-ehs-muted-text";
}

function getTextClass(isActive: boolean) {
  if (isActive) {
    return "text-ehs-darker";
  }
  return "text-ehs-muted-text";
}

export function Stepper(props: Readonly<StepperProps>) {
  const {
    steps,
    currentStep,
    onStepChange,
    ariaLabel = "Progress",
    className = "",
  } = props;
  const activeIndex = Math.max(0, Math.min(currentStep - 1, steps.length - 1));
  const totalSteps = steps.length;
  const percentComplete = Math.round((currentStep / totalSteps) * 100);

  return (
    <nav
      aria-label={ariaLabel}
      className={["hidden flex-col gap-3 lg:flex", className]
        .filter(Boolean)
        .join(" ")}
    >
      <ol className="shadow-ehs-normal-blue/15 relative grid grid-cols-3 gap-1 overflow-hidden rounded-full border border-white/70 bg-white/60 p-1.5 shadow-lg backdrop-blur-xl">
        <li
          aria-hidden="true"
          className="shadow-ehs-normal-blue/20 pointer-events-none absolute top-1.5 bottom-1.5 rounded-full border border-white bg-white shadow-md transition-all duration-500 ease-out"
          style={{
            left: `calc(${(activeIndex * 100) / steps.length}% + 0.375rem)`,
            width: `calc(${100 / steps.length}% - 0.5rem)`,
          }}
        />
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <li
              key={`${stepNumber}-${step.label}`}
              className="relative z-10 min-w-0"
            >
              <button
                type="button"
                aria-current={isActive ? "step" : undefined}
                onClick={() => onStepChange?.(stepNumber)}
                className={[
                  "group focus-visible:ring-ehs-normal-blue/30 flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-2xl px-4 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  isActive ? "" : "hover:bg-white/45",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-colors",
                    getBadgeClass(isCompleted, isActive),
                  ].join(" ")}
                >
                  {isCompleted ? (
                    <Icon icon="mdi:check" className="text-base" />
                  ) : (
                    stepNumber
                  )}
                </span>
                <span className="min-w-0">
                  <Text
                    as="span"
                    className={[
                      "block truncate text-sm font-semibold transition-colors",
                      getTextClass(isActive),
                    ].join(" ")}
                  >
                    {step.label}
                  </Text>
                  {step.description ? (
                    <Text
                      as="span"
                      className={[
                        "block truncate text-xs font-medium transition-colors",
                        isActive
                          ? "text-ehs-normal-blue"
                          : "text-ehs-muted-text",
                      ].join(" ")}
                    >
                      {step.description}
                    </Text>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mx-auto mt-1 flex w-full max-w-xs items-center gap-3">
        <span className="text-ehs-muted-text shrink-0 text-sm">
          Step{" "}
          <span className="text-ehs-darker font-semibold">{currentStep}</span>{" "}
          of {totalSteps}
        </span>

        <div className="bg-ehs-border relative h-1 min-w-0 flex-1 overflow-hidden rounded-full">
          <progress value={percentComplete} max={100} className="sr-only">
            {`${percentComplete}% complete`}
          </progress>
          <div
            className="bg-ehs-normal-blue absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${percentComplete}%` }}
            aria-hidden="true"
          />
          {totalSteps > 1
            ? Array.from({ length: totalSteps - 1 }, (_, index) => {
                const markPercent = ((index + 1) / totalSteps) * 100;

                return (
                  <span
                    key={markPercent}
                    aria-hidden="true"
                    className="bg-ehs-muted-text/25 absolute top-0 bottom-0 w-px"
                    style={{ left: `${markPercent}%` }}
                  />
                );
              })
            : null}
        </div>

        <span className="text-ehs-muted-text shrink-0 text-sm">
          <span className="text-ehs-normal-blue font-semibold">
            {percentComplete}
          </span>{" "}
          % complete
        </span>
      </div>
    </nav>
  );
}
