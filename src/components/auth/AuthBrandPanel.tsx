import type { ReactNode } from "react";
import { LogoIcon } from "@/components/LogoIcon";
import { LogoMark } from "@/components/LogoMark";
import { ShadeBall } from "@/components/ShadeBall";

export type AuthBrandPanelProps = Readonly<{
  /** Two lines read best — break them yourself with <br />. */
  headline: ReactNode;
  sub: string;
  /** Small line under the sub, e.g. the signup trial note. */
  note?: string;
  eyebrow?: string;
}>;

/**
 * The dark brand panel shared by every auth page — login and its siblings on
 * one side, signup on the other — so the two halves of the flow can't drift
 * apart visually. Only the words change per page.
 *
 * Deliberately minimal: the mark, one statement, room to breathe. Its
 * predecessors imitated a live dashboard with invented records; fabricated
 * data is off-limits in this product, decorative or not.
 *
 * Server component — no hooks, no motion. The focus of an auth page is the
 * form beside it.
 */
export function AuthBrandPanel(props: AuthBrandPanelProps) {
  const { headline, sub, note, eyebrow = "EHS Command Center" } = props;

  return (
    <div className="bg-ehs-canvas-dark relative hidden h-full flex-col overflow-hidden px-12 py-10 lg:flex">
      <ShadeBall positionAsClassName="-top-37.5 -left-37.5" blur={40} />
      <ShadeBall positionAsClassName="-bottom-37.5 -right-37.5" blur={40} />

      {/* over the top gradient */}
      <div className="from-ehs-normal-blue/10 pointer-events-none absolute inset-0 bg-linear-to-b via-transparent to-black/20" />

      {/* Oversized monogram bleeding off the bottom-right corner. A watermark,
          not an illustration: low opacity keeps it behind the copy in
          hierarchy, and the crop keeps it from reading as a badge. */}
      <LogoMark
        decorative
        className="text-ehs-canvas-dark-text opacity-0.06 pointer-events-none absolute -right-44 -bottom-44 size-160"
      />

      <div className="relative z-10 flex h-full flex-col justify-between">
        {/* Quiet on purpose — the headline carries the panel, the wordmark
            only signs it. */}
        <LogoIcon variant="light" className="h-5 w-auto" />

        <div className="flex max-w-xl flex-col items-start gap-10">
          <div className="relative">
            {/* Soft teal halo so the mark sits in light, not on a hard edge */}
            <div
              className="bg-ehs-normal-blue/25 absolute -inset-7 rounded-full blur-3xl"
              aria-hidden="true"
            />
            <LogoMark
              decorative
              className="text-ehs-canvas-dark-text relative size-24 xl:size-28"
            />
          </div>

          <div className="flex flex-col gap-5">
            <p className="text-ehs-normal-blue text-xs font-semibold tracking-[0.24em] uppercase">
              {eyebrow}
            </p>
            <h1 className="text-ehs-canvas-dark-text leading-1.08 text-5xl font-semibold tracking-tight xl:text-6xl">
              {headline}
            </h1>
            <p className="text-ehs-muted-text max-w-md text-base leading-relaxed xl:text-lg">
              {sub}
            </p>
            {note ? (
              <p className="text-ehs-canvas-dark-text/80 text-sm font-medium">
                {note}
              </p>
            ) : null}
          </div>
        </div>

        <p className="text-ehs-muted-text/70 text-2.75 font-medium tracking-[0.18em] uppercase">
          Incidents&ensp;·&ensp;Hazards&ensp;·&ensp;Audits&ensp;·&ensp;CAPAs&ensp;·&ensp;Compliance
        </p>
      </div>
    </div>
  );
}
