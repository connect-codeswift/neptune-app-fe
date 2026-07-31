import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { HazcomGlassCard } from "@/components/hazcom/shared/HazcomGlassCard";

/** The two cards every HazCom view shows while a query is pending or failed. */

export type HazcomLoadingCardProps = Readonly<{
  message: string;
  className?: string;
}>;

export function HazcomLoadingCard(props: Readonly<HazcomLoadingCardProps>) {
  const { message, className = "" } = props;

  return (
    <HazcomGlassCard
      className={["min-h-[240px] items-center justify-center gap-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon
        icon="mdi:loading"
        className="text-ehs-dark-blue size-7 animate-spin"
        aria-hidden="true"
      />
      <Text as="p" className="text-ehs-muted-text text-sm">
        {message}
      </Text>
    </HazcomGlassCard>
  );
}

export type HazcomErrorCardProps = Readonly<{
  title: string;
  message: string;
  /** Omit to hide the retry button — nothing to retry when signed out. */
  onRetry?: () => void;
  className?: string;
}>;

export function HazcomErrorCard(props: Readonly<HazcomErrorCardProps>) {
  const { title, message, onRetry, className = "" } = props;

  return (
    <HazcomGlassCard
      className={[
        "min-h-[180px] items-center justify-center gap-2 text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon
        icon="mdi:alert-circle-outline"
        className="text-ehs-red size-8"
        aria-hidden="true"
      />
      <Text as="p" className="text-ehs-darker text-sm font-semibold">
        {title}
      </Text>
      <Text as="p" className="text-ehs-muted-text max-w-md text-sm">
        {message}
      </Text>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="border-ehs-border text-ehs-gray hover:bg-ehs-light-bg mt-1 inline-flex cursor-pointer items-center gap-1 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium transition-colors"
        >
          <Icon icon="mdi:refresh" className="size-4" aria-hidden="true" />
          Retry
        </button>
      ) : null}
    </HazcomGlassCard>
  );
}
