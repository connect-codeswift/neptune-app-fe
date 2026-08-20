import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@iconify/react";

export type LotoQueryStatusProps = Readonly<{
  state: "loading" | "error" | "empty";
  /** Shown for `error` and `empty`. */
  message?: string;
  /** Empty state only — overrides the generic icon/title. */
  icon?: string;
  title?: string;
}>;

/** Loading / error / empty placeholder shared by the LOTO tab sections. */
export function LotoQueryStatus(props: Readonly<LotoQueryStatusProps>) {
  const { state, message, icon, title } = props;

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

  // Empty and error used to render identically — a muted line in a card — which
  // told the reader something had broken when a quiet section is often the
  // correct answer (no equipment locked out is good news). They are now
  // visually distinct: empty is muted and named, error keeps the red alert.
  if (state === "empty") {
    return (
      <EmptyState
        icon={icon ?? "mdi:tray-remove"}
        title={title ?? "Nothing to show"}
        message={message}
      />
    );
  }

  return (
    <IncidentGlassCard paddingClassName="p-6" className="min-w-0">
      <div className="flex items-start gap-2">
        <Icon
          icon="mdi:alert-circle-outline"
          className="text-ehs-red mt-0.5 size-4 shrink-0"
          aria-hidden="true"
        />
        <Text as="p" className="text4 text-ehs-red">
          {message ?? "Something went wrong."}
        </Text>
      </div>
    </IncidentGlassCard>
  );
}
