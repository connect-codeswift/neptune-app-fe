import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { HazcomGlassCard } from "@/components/hazcom/shared/HazcomGlassCard";
import {
  SkeletonDetailPage,
  SkeletonFormPage,
  SkeletonTable,
} from "@/components/ui/skeletons";

/** The two cards every HazCom view shows while a query is pending or failed. */

export type HazcomLoadingCardProps = Readonly<{
  /** Announced to screen readers; no longer drawn on screen. */
  message: string;
  /** Shape to hold while loading. Most HazCom views are tables. */
  variant?: "table" | "detail" | "form";
  className?: string;
}>;

/**
 * Placeholder shown while a HazCom query is pending.
 *
 * Renders the shape of the content rather than a centred spinner, so the view
 * doesn't collapse to a small box and snap back to full width when data lands.
 * `message` stays as a polite live-region announcement for screen readers.
 */
export function HazcomLoadingCard(props: Readonly<HazcomLoadingCardProps>) {
  const { message, variant = "table", className = "" } = props;

  return (
    <div
      className={["min-w-0", className].filter(Boolean).join(" ")}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{message}</span>
      {variant === "detail" ? (
        <SkeletonDetailPage />
      ) : variant === "form" ? (
        <SkeletonFormPage fields={8} />
      ) : (
        <SkeletonTable rows={8} columns={6} />
      )}
    </div>
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
      className={["min-h-45 text-center", className]
        .filter(Boolean)
        .join(" ")}
      hazcomGlassCardClassName="items-center justify-center gap-2"
    >
      <Icon
        icon="mdi:alert-circle-outline"
        className="text-ehs-red size-8"
        aria-hidden="true"
      />
      <Text as="p" className="text4 text-ehs-darker font-semibold">
        {title}
      </Text>
      <Text as="p" className="text4 text-ehs-muted-text max-w-md">
        {message}
      </Text>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="text8 border-ehs-border text-ehs-gray hover:bg-ehs-light-bg mt-1 inline-flex cursor-pointer items-center gap-1 rounded-lg border bg-white px-3 py-1.5 font-medium transition-colors"
        >
          <Icon icon="mdi:refresh" className="size-4" aria-hidden="true" />
          Retry
        </button>
      ) : null}
    </HazcomGlassCard>
  );
}
