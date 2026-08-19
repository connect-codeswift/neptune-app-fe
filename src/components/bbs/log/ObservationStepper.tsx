const OBSERVATION_STEPS = [1, 2, 3] as const;

export type ObservationStepperProps = Readonly<{
  /** 1-based index of the step being shown. */
  currentStep: number;
}>;

/** Numbered circles joined by rules; the current and completed steps fill teal. */
export function ObservationStepper(props: ObservationStepperProps) {
  const { currentStep } = props;

  return (
    <ol className="flex items-center" aria-label="Progress">
      {OBSERVATION_STEPS.map((step, index) => {
        const isReached = step <= currentStep;

        return (
          <li
            key={step}
            className={
              index === 0 ? "flex items-center" : "flex flex-1 items-center"
            }
          >
            {index === 0 ? null : (
              <span className="bg-ehs-border h-px flex-1" aria-hidden="true" />
            )}

            <span
              aria-current={step === currentStep ? "step" : undefined}
              className={[
                "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                isReached
                  ? "bg-ehs-normal-blue text-ehs-on-accent"
                  : "bg-ehs-border/70 text-ehs-muted-text",
              ].join(" ")}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
