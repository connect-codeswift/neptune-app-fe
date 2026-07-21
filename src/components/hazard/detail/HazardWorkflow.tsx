import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";
import {
  HAZARD_WORKFLOW_STAGES,
  type HazardStage,
} from "@/app/dashboard/hazard/hazard-data";

/** Horizontal 5-step tracker: done stages are green, the current one teal,
 * everything ahead stays muted. */
export function HazardWorkflow(props: Readonly<{ stage: HazardStage }>) {
  const { stage } = props;
  const currentIndex = HAZARD_WORKFLOW_STAGES.indexOf(stage);

  return (
    <IncidentGlassCard incidentGlassCardClassName="gap-4">
      <Text as="h3" className="text-ehs-gray font-medium">
        Hazard Workflow
      </Text>

      <ol className="flex items-start">
        {HAZARD_WORKFLOW_STAGES.map((label, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li
              key={label}
              className="flex min-w-0 flex-1 items-start last:flex-none"
            >
              <div className="flex w-fit shrink-0 flex-col items-center gap-1">
                <span
                  aria-hidden="true"
                  className={[
                    "flex size-7 items-center justify-center rounded-full text-sm font-bold",
                    isDone
                      ? "bg-ehs-green text-white"
                      : isCurrent
                        ? "bg-ehs-normal-blue text-white"
                        : "text-ehs-muted-text border border-slate-900/12 bg-[#eef1f6]",
                  ].join(" ")}
                >
                  {isDone ? "✓" : index + 1}
                </span>
                <Text
                  as="span"
                  className={[
                    "text-sm whitespace-nowrap",
                    isDone
                      ? "text-ehs-green"
                      : isCurrent
                        ? "text-ehs-normal-blue font-medium"
                        : "text-ehs-muted-text",
                  ].join(" ")}
                >
                  {label}
                </Text>
              </div>

              {/* Connector to the next stage; the last item has none. */}
              {index < HAZARD_WORKFLOW_STAGES.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={[
                    "mt-3.5 h-0.5 min-w-4 flex-1",
                    isDone ? "bg-ehs-green" : "bg-[#eef1f6]",
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
