import type { ReactNode } from "react";
import { HazcomModuleTabs } from "@/components/hazcom/shared/HazcomModuleTabs";

export type HazcomFormLayoutProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

/**
 * Page frame for the single-column HazCom data-entry pages (add/edit chemical,
 * upload SDS, log a training session).
 *
 * The module tabs stay full width — they're navigation, and they line up with
 * the tabs on every list page. Everything else shares one measure. Left
 * unconstrained these pages stretched their text inputs across the whole
 * viewport, and where a form card carried its own narrower max-width it sat
 * off-centre under a full-width header. Both come from putting the width on the
 * page, once, rather than on the header and the card separately.
 *
 * Two-column pages (the risk-assessment builder with its live scoring rail, the
 * label generator with its preview) genuinely want the room and don't use this.
 */
export function HazcomFormLayout(props: Readonly<HazcomFormLayoutProps>) {
  const { children, className = "" } = props;

  return (
    <div
      className={["flex min-w-0 flex-col gap-5 px-3 pb-8 sm:px-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      <HazcomModuleTabs />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
        {children}
      </div>
    </div>
  );
}
