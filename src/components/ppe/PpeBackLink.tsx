"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

const PPE_ROUTE = "/dashboard/ppe-management";

export type PpeBackLinkProps = Readonly<{
  /**
   * Used only when there is no in-app history to go back to
   * (e.g. the page was opened directly). Defaults to PPE Management.
   */
  fallbackHref?: string;
  /** Accessible label for the control. */
  label?: string;
  className?: string;
}>;

/**
 * Chevron back control shared by PPE subpage headers.
 * Prefers browser history (`router.back`); falls back to {@link fallbackHref}
 * when the user landed here with nowhere to return to.
 */
export function PpeBackLink(props: Readonly<PpeBackLinkProps>) {
  const { fallbackHref = PPE_ROUTE, label = "Go back", className = "" } = props;
  const router = useRouter();

  const handleBack = () => {
    if (globalThis.window !== undefined && globalThis.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      aria-label={label}
      onClick={handleBack}
      className={[
        "border-ehs-border text-ehs-dark-bg rounded-2.5 flex size-8 shrink-0 cursor-pointer items-center justify-center border bg-white transition-colors hover:bg-slate-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon icon="mdi:chevron-left" className="size-5" aria-hidden="true" />
    </button>
  );
}

export { PPE_ROUTE };
