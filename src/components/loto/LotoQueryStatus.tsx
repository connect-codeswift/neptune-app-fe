import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { Skeleton } from "@/components/ui/Skeleton";

export type LotoQueryStatusProps = Readonly<{
  state: "loading" | "error" | "empty";
  /** Shown for `error` and `empty`. */
  message?: string;
}>;

/** Loading / error / empty placeholder shared by the LOTO tab sections. */
export function LotoQueryStatus(props: Readonly<LotoQueryStatusProps>) {
  const { state, message } = props;

  if (state === "loading") {
    return (
      <IncidentGlassCard paddingClassName="p-4" className="min-w-0">
        <div className="flex flex-col gap-2.5">
          {[0, 1, 2].map((row) => (
            <Skeleton
              key={`loto-loading-${String(row)}`}
              className="h-10 w-full"
            />
          ))}
        </div>
      </IncidentGlassCard>
    );
  }

  return (
    <IncidentGlassCard paddingClassName="p-6" className="min-w-0">
      <Text as="p" className="text4 text-ehs-muted-text">
        {message ?? ""}
      </Text>
    </IncidentGlassCard>
  );
}
