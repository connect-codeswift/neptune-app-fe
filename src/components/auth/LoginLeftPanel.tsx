import { LogoIcon } from "@/components/LogoIcon";
import { LogoMark } from "@/components/LogoMark";
import { ShadeBall } from "@/components/ShadeBall";

/**
 * Brand panel for the auth pages (login, forgot/reset password, invitation).
 *
 * Deliberately minimal. The previous version imitated a live dashboard —
 * invented incidents with named plants, pending CAPAs assigned to people who
 * don't exist, a fictional OSHA inspection. Fabricated records are the wrong
 * first impression for a compliance product, and the clutter competed with
 * the sign-in form. What sells the product here is composure: the mark, one
 * clear statement, and room to breathe.
 *
 * Stays a server component — no hooks, no motion. The focus of an auth page
 * is the form on the right.
 */
export default function LoginLeftPanel() {
  return (
    <div className="bg-ehs-dark-bg relative hidden h-full flex-col overflow-hidden px-12 py-10 lg:flex">
      <ShadeBall positionAsClassName="top-[-150px] left-[-150px]" blur={40} />
      <ShadeBall
        positionAsClassName="bottom-[-150px] right-[-150px]"
        blur={40}
      />

      {/* over the top gradient */}
      <div className="from-ehs-normal-blue/10 pointer-events-none absolute inset-0 bg-linear-to-b via-transparent to-black/20" />

      {/* Oversized monogram bleeding off the bottom-right corner. A watermark,
          not an illustration: low opacity keeps it behind the copy in
          hierarchy, and the crop keeps it from reading as a badge. */}
      <LogoMark
        decorative
        className="text-ehs-light-text pointer-events-none absolute -right-44 -bottom-44 size-[40rem] opacity-[0.06]"
      />

      <div className="relative z-10 flex h-full flex-col justify-between">
        {/* LogoIcon directly rather than <Logo>, which pins the wordmark to
            h-6 for the app chrome — at this panel's scale it read as tiny. */}
        <LogoIcon variant="light" className="h-8 w-auto xl:h-9" />

        <div className="flex max-w-xl flex-col items-start gap-10">
          <div className="relative">
            {/* Soft teal halo so the mark sits in light, not on a hard edge */}
            <div
              className="bg-ehs-normal-blue/25 absolute -inset-7 rounded-full blur-3xl"
              aria-hidden="true"
            />
            <LogoMark
              decorative
              className="text-ehs-light-text relative size-24 xl:size-28"
            />
          </div>

          <div className="flex flex-col gap-5">
            <p className="text-ehs-normal-blue text-xs font-semibold tracking-[0.24em] uppercase">
              EHS Command Center
            </p>
            <h1 className="text-ehs-light-text text-5xl leading-[1.08] font-semibold tracking-tight xl:text-6xl">
              Safety work,
              <br />
              seen clearly.
            </h1>
            <p className="text-ehs-muted-text max-w-md text-base leading-relaxed xl:text-lg">
              Incidents, hazards, audits and actions — one calm place for all
              of it.
            </p>
          </div>
        </div>

        <p className="text-ehs-muted-text/70 text-xs font-medium tracking-[0.18em] uppercase">
          Incidents&ensp;·&ensp;Hazards&ensp;·&ensp;Audits&ensp;·&ensp;CAPAs&ensp;·&ensp;Compliance
        </p>
      </div>
    </div>
  );
}
