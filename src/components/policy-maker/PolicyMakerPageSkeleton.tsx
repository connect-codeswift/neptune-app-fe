/**
 * Pixel-matched loading skeleton for Policy Maker / Document Control.
 * Source: Figma `document-library-skeleton` (4818:18832).
 *
 * AppShell already renders the real sidebar — this covers MainWorkspace only
 * (header → KPIs → library + table), matching near-miss’s content-skeleton pattern.
 */

function Bar(props: Readonly<{ className?: string }>) {
  const { className = "" } = props;
  return (
    <div
      aria-hidden="true"
      className={["animate-pulse rounded-[4px]", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

function KpiCardSkeleton() {
  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-[19.45px] border-[0.97px] border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.62)] p-4 backdrop-blur-[9.7px]">
      <div className="flex items-center justify-between">
        <Bar className="h-2 w-[100px] bg-[#8892a3]/45" />
        <Bar className="size-3.5 rounded-full bg-[#d1d5db]" />
      </div>
      <Bar className="h-[22px] w-[50px] bg-[#d1d5db]" />
    </div>
  );
}

function LibraryItemSkeleton(props: Readonly<{ active?: boolean }>) {
  const { active = false } = props;

  return (
    <div
      className={[
        "flex h-[30px] w-full items-center gap-2.5 rounded-lg p-2",
        active ? "bg-[rgba(8,145,166,0.1)]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Bar
        className={[
          "size-3.5 shrink-0",
          active ? "bg-[rgba(8,145,166,0.5)]" : "bg-[#e5e7eb]",
        ].join(" ")}
      />
      <Bar
        className={[
          "h-2.5 w-20",
          active ? "bg-[#056e7e]/70" : "bg-[#e5e7eb]",
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
        "flex h-12 w-full shrink-0 items-center gap-3 border-b border-[rgba(15,23,42,0.08)] px-4",
        selected ? "bg-[rgba(8,145,166,0.08)]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex w-40 shrink-0 items-center gap-2">
        <Bar className="size-6 shrink-0 bg-[#e5e7eb]" />
        <div className="flex flex-col gap-1">
          <Bar className="h-2.5 w-[100px] bg-[#d1d5db]" />
          <Bar className="h-2 w-[60px] bg-[#8892a3]/45" />
        </div>
      </div>
      <Bar className="h-2.5 w-10 shrink-0 bg-[#e5e7eb]" />
      <Bar className="h-2.5 w-20 shrink-0 bg-[#e5e7eb]" />
      <Bar className="h-5 w-20 shrink-0 rounded-[10px] bg-[#e5e7eb]" />
    </div>
  );
}

/**
 * Full-page loading placeholder for Document Control.
 * Mirrors Figma MainWorkspace: skeleton header, 4 KPIs, library + table.
 */
export function PolicyMakerPageSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-[14px] px-4 pb-8">
      {/* Header — Figma 4818:18878 (h-52) */}
      <div className="flex h-[52px] w-full items-center justify-between">
        <Bar className="h-5 w-[180px] bg-[#d1d5db]" />
        <div className="flex items-center gap-3">
          <div className="flex h-[35px] w-[280px] items-center rounded-[9.7px] border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.62)] px-3">
            <Bar className="size-3.5 shrink-0 bg-[#e5e7eb]" />
            <span className="w-3 shrink-0" aria-hidden="true" />
            <Bar className="h-2 w-[140px] bg-[#8892a3]/45" />
          </div>
          <Bar className="h-[35px] w-[140px] rounded-[10px] bg-[#e5e7eb]" />
        </div>
      </div>

      {/* StatsGrid — Figma 4818:18886, gap 13.6px */}
      <div className="grid grid-cols-1 gap-[13.6px] sm:grid-cols-2 xl:grid-cols-4">
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
      </div>

      {/* DocumentGrid — library 206px + table (details pane is ~0px in Figma) */}
      <div className="grid min-w-0 items-start gap-[13.6px] xl:grid-cols-[206px_minmax(0,1fr)]">
        {/* LibraryPane — Figma 4818:18912: w-206 h-411, folder y-step 106 (76px gap) */}
        <div className="flex h-[411px] w-full flex-col gap-[76px] overflow-hidden rounded-[19.4px] border border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.62)] p-4 backdrop-blur-[9.7px]">
          <Bar className="h-2 w-[60px] shrink-0 bg-[#8892a3]/45" />
          <LibraryItemSkeleton />
          <LibraryItemSkeleton active />
          <LibraryItemSkeleton />
          <LibraryItemSkeleton />
          <LibraryItemSkeleton />
          <LibraryItemSkeleton />
        </div>

        {/* TablePane — Figma 4818:18932: gap 48px between header / columns / rows */}
        <div className="flex min-h-[604px] w-full flex-col gap-12 overflow-hidden rounded-[19.4px] border-[0.97px] border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.62)] backdrop-blur-[9.7px]">
          <div className="flex h-12 items-center justify-between border-b border-[rgba(15,23,42,0.08)] px-4">
            <Bar className="h-3 w-[100px] bg-[#d1d5db]" />
            <Bar className="h-6 w-[120px] rounded-lg bg-[#e5e7eb]" />
          </div>

          <div className="flex items-start gap-3 px-4 py-2">
            <Bar className="h-2.5 w-40 bg-[#e5e7eb]" />
            <Bar className="h-2.5 w-10 bg-[#e5e7eb]" />
            <Bar className="h-2.5 w-20 bg-[#e5e7eb]" />
            <Bar className="h-2.5 w-[100px] bg-[#e5e7eb]" />
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
