/**
 * Pixel-matched loading skeleton for Policy Maker / Document Control.
 * Source: Figma `document-library-skeleton` (4818:18832).
 *
 * AppShell already renders the real sidebar — this covers MainWorkspace only
 * (header → KPIs → library + table), matching near-miss’s content-skeleton pattern.
 */

import { MetricCardsRowSkeleton } from "@/components/ui/MetricCard";

/* The title bars are pinned to #d1d5db, one step darker than the #e5e7eb body
   bars (`--ehs-border`). Flattening the two removes the title/body hierarchy
   the skeleton is drawing. */

function Bar(props: Readonly<{ className?: string }>) {
  const { className = "" } = props;
  return (
    <div
      aria-hidden="true"
      className={["rounded-1 animate-pulse", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

function LibraryItemSkeleton(props: Readonly<{ active?: boolean }>) {
  const { active = false } = props;

  return (
    <div
      className={[
        "flex h-7.5 w-full items-center gap-2.5 rounded-lg p-2",
        active ? "bg-ehs-normal-blue/10" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Bar
        className={[
          "size-3.5 shrink-0",
          active ? "bg-ehs-normal-blue/50" : "bg-ehs-border",
        ].join(" ")}
      />
      <Bar
        className={[
          "h-2.5 w-20",
          active ? "bg-ehs-dark-blue/70" : "bg-ehs-border",
        ].join(" ")}
      />
    </div>
  );
}

function DocumentRowSkeleton(props: Readonly<{ selected?: boolean }>) {
  const { selected = false } = props;

  return (
    <div
      className={[
        "border-ehs-border-ink/8 flex h-12 w-full shrink-0 items-center gap-3 border-b px-4",
        selected ? "bg-ehs-normal-blue/8" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex w-40 shrink-0 items-center gap-2">
        <Bar className="bg-ehs-border size-6 shrink-0" />
        <div className="flex flex-col gap-1">
          <Bar className="bg-ehs-skeleton-strong h-2.5 w-25" />
          <Bar className="bg-ehs-muted-text/45 h-2 w-15" />
        </div>
      </div>
      <Bar className="bg-ehs-border h-2.5 w-10 shrink-0" />
      <Bar className="bg-ehs-border h-2.5 w-20 shrink-0" />
      <Bar className="rounded-2.5 bg-ehs-border h-5 w-20 shrink-0" />
    </div>
  );
}

/**
 * Full-page loading placeholder for Document Control.
 * Mirrors Figma MainWorkspace: skeleton header, 4 KPIs, library + table.
 */
export function PolicyMakerPageSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      {/* Header — Figma 4818:18878 (h-52) */}
      <div className="flex h-13 w-full items-center justify-between">
        <Bar className="bg-ehs-skeleton-strong h-5 w-45" />
        <div className="flex items-center gap-3">
          <div className="rounded-2.5 border-ehs-border-ink/8 bg-ehs-surface/62 flex h-8.75 w-70 items-center border px-3">
            <Bar className="bg-ehs-border size-3.5 shrink-0" />
            <span className="w-3 shrink-0" aria-hidden="true" />
            <Bar className="bg-ehs-muted-text/45 h-2 w-35" />
          </div>
          <Bar className="rounded-2.5 bg-ehs-border h-8.75 w-35" />
        </div>
      </div>

      {/* StatsGrid — Figma 4818:18886 */}
      <MetricCardsRowSkeleton />

      {/* DocumentGrid — library 206px + table (details pane is ~0px in Figma) */}
      <div className="grid min-w-0 items-start gap-[14px] xl:grid-cols-[206px_minmax(0,1fr)]">
        {/* LibraryPane — Figma 4818:18912: w-206 h-411, folder y-step 106 (76px gap) */}
        <div className="border-ehs-hairline/90 bg-ehs-surface/62 flex h-102.75 w-full flex-col gap-19 overflow-hidden rounded-[19px] border p-4 backdrop-blur-[10px]">
          <Bar className="bg-ehs-muted-text/45 h-2 w-15 shrink-0" />
          <LibraryItemSkeleton />
          <LibraryItemSkeleton active />
          <LibraryItemSkeleton />
          <LibraryItemSkeleton />
          <LibraryItemSkeleton />
          <LibraryItemSkeleton />
        </div>

        {/* TablePane — Figma 4818:18932: gap 48px between header / columns / rows */}
        <div className="border-ehs-hairline/90 bg-ehs-surface/62 flex min-h-151 w-full flex-col gap-12 overflow-hidden rounded-[19px] border backdrop-blur-[10px]">
          <div className="border-ehs-border-ink/8 flex h-12 items-center justify-between border-b px-4">
            <Bar className="bg-ehs-skeleton-strong h-3 w-25" />
            <Bar className="bg-ehs-border h-6 w-30 rounded-lg" />
          </div>

          <div className="flex items-start gap-3 px-4 py-2">
            <Bar className="bg-ehs-border h-2.5 w-40" />
            <Bar className="bg-ehs-border h-2.5 w-10" />
            <Bar className="bg-ehs-border h-2.5 w-20" />
            <Bar className="bg-ehs-border h-2.5 w-25" />
          </div>

          <DocumentRowSkeleton />
          <DocumentRowSkeleton />
          <DocumentRowSkeleton selected />
          <DocumentRowSkeleton />
          <DocumentRowSkeleton />
        </div>
      </div>
    </div>
  );
}
