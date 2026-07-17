"use client";

import { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";
import { toast } from "@/lib/toast";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export type HrcaWhyStep = Readonly<{
  num: number;
  text: string;
  isRootCause?: boolean;
}>;

export type HrcaRow = Readonly<{
  id: string;
  category: string;
  contributingFactor: string;
  whys: readonly HrcaWhyStep[];
  correctiveActions: readonly string[];
}>;

export type IncidentDetailHrcaBoardProps = Readonly<{
  onClose?: () => void;
  className?: string;
}>;

const INITIAL_ROWS: readonly HrcaRow[] = [
  {
    id: "process",
    category: "Process / Procedures",
    contributingFactor:
      "The process was in place, but there was a lack of training because the employee was a new hire.",
    whys: [
      {
        num: 1,
        text: "New-hire onboarding did not include a hands-on coil band-cutting walkthrough.",
      },
      {
        num: 2,
        text: "The JHA / JSA for the task had not been reviewed in onboarding.",
        isRootCause: true,
      },
    ],
    correctiveActions: [
      "Review and update the JHA & JSA for coil band-cutting tasks.",
      "Create a standardized coil band-cutting procedure.",
    ],
  },
  {
    id: "behaviors",
    category: "Behaviors",
    contributingFactor:
      "Employee did not choose to use the pneumatic band cutter.",
    whys: [
      {
        num: 1,
        text: "Additional snubber work was not lined up; using the cutter ergonomically was not possible.",
      },
      {
        num: 2,
        text: "The faster manual method was the accepted norm on the line.",
        isRootCause: true,
      },
    ],
    correctiveActions: [
      "Conduct a safety stand-down focused on stored-energy hazards.",
      "Provide refresher training on safe coil handling.",
    ],
  },
  {
    id: "competency",
    category: "Competency / Skills",
    contributingFactor:
      "Training did not emphasize previous serious-injury events and did not cover the JSA.",
    whys: [
      {
        num: 1,
        text: "Previous training focused more on production than coil energy release.",
      },
      {
        num: 2,
        text: "Real incident examples had not been reviewed with the team.",
      },
      { num: 3, text: "Training materials were outdated." },
      {
        num: 4,
        text: "JHA / JSA training did not connect hazards to consequences.",
      },
      {
        num: 5,
        text: "Training effectiveness had not been recently evaluated.",
        isRootCause: true,
      },
    ],
    correctiveActions: [
      "Review previous SI injuries on the Zee Line with new hires during onboarding.",
    ],
  },
  {
    id: "equipment",
    category: "Equipment",
    contributingFactor:
      "The available pneumatic cutter was not used during coil band-cutting.",
    whys: [
      {
        num: 1,
        text: "The employee used a manual cutting method instead of the pneumatic cutter.",
      },
      {
        num: 2,
        text: "The pneumatic cutter was not easy to use — snubber wheel not aligned or accessible.",
      },
      {
        num: 3,
        text: "Standard work did not specify mandatory use of the pneumatic cutter.",
      },
      {
        num: 4,
        text: "Change management for safer equipment was not consistently reinforced.",
        isRootCause: true,
      },
    ],
    correctiveActions: [
      "Update the JHA & JSA to require the pneumatic cutter for coil band-cutting, machine-specific.",
    ],
  },
  {
    id: "ppe",
    category: "PPE",
    contributingFactor:
      "Eye / face protection was not enforced for the band-cutting task.",
    whys: [
      {
        num: 1,
        text: "A face shield was not part of the required PPE for this task.",
      },
      {
        num: 2,
        text: "The PPE assessment for coil handling had not been refreshed.",
        isRootCause: true,
      },
    ],
    correctiveActions: [
      "Add face shield / impact eye protection to the PPE requirements for coil band-cutting.",
    ],
  },
];

const columnHelper = createColumnHelper<HrcaRow>();

export function IncidentDetailHrcaBoard(
  props: Readonly<IncidentDetailHrcaBoardProps>,
) {
  const { onClose, className = "" } = props;
  const [rows, setRows] = useState<readonly HrcaRow[]>(INITIAL_ROWS);

  // Dynamic board stats
  const totalCategories = rows.length;
  const totalWhySteps = rows.reduce((sum, r) => sum + r.whys.length, 0);
  const totalActions = rows.reduce(
    (sum, r) => sum + r.correctiveActions.length,
    0,
  );

  // Action: Add new Why step to a category row
  const handleAddWhy = (rowId: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const currentCount = row.whys.length;
        if (currentCount >= 5) {
          toast.error(
            "Limit Reached",
            "A maximum of 5 Whys can be defined per category row.",
          );
          return row;
        }

        // Remove isRootCause from previous steps, set it for the new step
        const updatedWhys = row.whys.map((w) => ({ ...w, isRootCause: false }));
        const nextNum = currentCount + 1;

        toast.success(
          "Why Step Added",
          `Added Why ${nextNum} to ${row.category}`,
        );

        return {
          ...row,
          whys: [
            ...updatedWhys,
            {
              num: nextNum,
              text: `Click to define Why ${nextNum} analysis detail...`,
              isRootCause: true,
            },
          ],
        };
      }),
    );
  };

  // Action: Add new Corrective Action to a category row
  const handleAddAction = (rowId: string) => {
    const actionText = prompt("Enter new Corrective Action description:");
    if (!actionText?.trim()) return;

    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        toast.success("Action Added", `Added action to ${row.category}`);
        return {
          ...row,
          correctiveActions: [...row.correctiveActions, actionText.trim()],
        };
      }),
    );
  };

  // Action: Edit Contributing Factor text inline
  const handleEditContributingFactor = (rowId: string, currentText: string) => {
    const nextText = prompt("Edit Contributing Factor:", currentText);
    if (nextText === null) return;

    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        return { ...row, contributingFactor: nextText.trim() || "N/A" };
      }),
    );
  };

  // Action: Edit Why step text inline
  const handleEditWhyText = (
    rowId: string,
    whyIndex: number,
    currentText: string,
  ) => {
    const nextText = prompt(
      `Edit Why ${whyIndex + 1} description:`,
      currentText,
    );
    if (nextText === null) return;

    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const nextWhys = row.whys.map((w, idx) =>
          idx === whyIndex ? { ...w, text: nextText.trim() || "N/A" } : w,
        );
        return { ...row, whys: nextWhys };
      }),
    );
  };

  // Define table columns using useMemo to reference current state handlers cleanly
  const columns = useMemo(
    () => [
      columnHelper.accessor("category", {
        header: "Category",
        cell: (info) => (
          <div className="text-ehs-dark-bg flex min-h-[120px] items-center justify-center rounded-[10px] border border-slate-200/50 bg-slate-100/70 p-3 text-[12px] font-bold shadow-sm">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("contributingFactor", {
        header: "Contributing factor",
        cell: (info) => {
          const row = info.row.original;
          const text = info.getValue();
          return (
            <div
              onClick={() => handleEditContributingFactor(row.id, text)}
              className="flex min-h-[120px] cursor-pointer flex-col gap-1.5 rounded-[10px] border border-[rgba(15,23,42,0.06)] bg-white p-3 text-left shadow-sm transition-all hover:border-slate-300 hover:shadow"
            >
              <span className="text-[8px] font-bold tracking-[0.5px] text-[#e11d48]/90 uppercase">
                Contributing factor
              </span>
              <p className="text-ehs-dark-bg text-[11.5px] leading-relaxed font-semibold">
                {text}
              </p>
            </div>
          );
        },
      }),
      // Generate 5 dynamic Why? columns matching step indexes
      ...[0, 1, 2, 3, 4].map((stepIdx) => {
        const stepNum = stepIdx + 1;
        return columnHelper.display({
          id: `why${stepNum}`,
          header: `${stepNum} Why?`,
          cell: (info) => {
            const row = info.row.original;
            const why = row.whys[stepIdx];
            const canAdd = row.whys.length === stepIdx;

            if (why) {
              return (
                <div
                  onClick={() => handleEditWhyText(row.id, stepIdx, why.text)}
                  className={[
                    "flex min-h-[120px] cursor-pointer flex-col gap-1.5 rounded-[10px] border p-3 text-left shadow-sm transition-all hover:shadow",
                    why.isRootCause
                      ? "border-[#eab308]/40 bg-[#eab308]/6 hover:border-[#eab308]/80"
                      : "border-[rgba(15,23,42,0.06)] bg-white hover:border-slate-300",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-flex items-center gap-0.5 self-start rounded-[6px] px-2 py-0.5 text-[8.5px] leading-none font-bold tracking-[0.4px]",
                      why.isRootCause
                        ? "border border-[#eab308]/20 bg-[#eab308]/12 text-[#ca8a04]"
                        : "text-ehs-gray bg-[rgba(15,23,42,0.06)]",
                    ].join(" ")}
                  >
                    {why.isRootCause ? (
                      <>
                        <Icon icon="mdi:alert-circle" className="size-3" />
                        <span>{why.num} Root cause</span>
                      </>
                    ) : (
                      <span>{why.num} Why?</span>
                    )}
                  </span>
                  <p className="text-ehs-dark-bg text-[11.5px] leading-relaxed font-semibold">
                    {why.text}
                  </p>
                </div>
              );
            } else if (canAdd && stepNum <= 5) {
              return (
                <div
                  onClick={() => handleAddWhy(row.id)}
                  className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[10px] border-2 border-dashed border-slate-200/80 bg-white/30 p-3.5 text-slate-400 shadow-sm transition-all hover:border-[#0891a6]/40 hover:bg-slate-50/50 hover:text-[#0891a6]"
                >
                  <div className="flex size-[28px] items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200">
                    <Icon icon="mdi:plus" className="size-4" />
                  </div>
                  <span className="text-[10px] font-bold">Add why</span>
                </div>
              );
            } else {
              return (
                <div className="flex min-h-[120px] items-center justify-center text-[14px] font-bold text-slate-300">
                  —
                </div>
              );
            }
          },
        });
      }),
      columnHelper.accessor("correctiveActions", {
        header: "Corrective actions",
        cell: (info) => {
          const row = info.row.original;
          const actions = info.getValue();
          return (
            <div className="flex min-h-[120px] flex-col gap-2 rounded-[10px] border border-[#10b981]/14 bg-[#10b981]/5 p-3 text-left shadow-sm">
              <span className="text-[8px] font-bold tracking-[0.5px] text-[#10b981] uppercase">
                Corrective actions
              </span>
              <div className="flex flex-col gap-1.5">
                {actions.map((action, actionIdx) => (
                  <div
                    key={actionIdx}
                    className="flex gap-1.5 text-[11px] leading-relaxed font-semibold text-slate-700"
                  >
                    <Icon
                      icon="mdi:check"
                      className="mt-0.5 size-3.5 shrink-0 text-[#10b981]"
                    />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleAddAction(row.id)}
                className="mt-auto inline-flex items-center gap-0.5 self-start text-[10.5px] font-bold text-[#056e7e] transition-colors hover:text-[#0f766e]"
              >
                <Icon icon="mdi:plus" className="size-3.5" />
                <span>Add action</span>
              </button>
            </div>
          );
        },
      }),
    ],
    [rows],
  );

  // Initialize TanStack Table Hook
  const table = useReactTable({
    data: rows as HrcaRow[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div
      className={["flex flex-col gap-[18px]", className]
        .filter(Boolean)
        .join(" ")}
    >
      {/* 1. HRCA Board Top Header Card */}
      <IncidentGlassCard paddingClassName="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {/* Close / Return Back button */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="text-ehs-gray hover:text-ehs-dark-bg mr-1 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200/60 bg-slate-100 transition-colors hover:bg-slate-200"
                title="Back to Investigation Details"
              >
                <Icon icon="mdi:arrow-left" className="size-4.5" />
              </button>
            )}
            <div className="bg-ehs-normal-blue/10 text-ehs-normal-blue flex size-[38px] shrink-0 items-center justify-center rounded-lg">
              <Icon icon="mdi:sitemap" className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-ehs-muted-text/80 text-[10px] font-bold tracking-[0.5px] uppercase">
                Horizontal Root Cause Analysis
              </span>
              <Text
                as="h3"
                className="text-ehs-dark-bg text-[15px] leading-tight font-bold"
              >
                5 Whys across causal categories → root cause → corrective
                actions
              </Text>
            </div>
          </div>

          {/* Quick Metrics display */}
          <div className="flex shrink-0 items-center gap-5 self-end border-l border-slate-200/80 pl-5 sm:self-center">
            <div className="text-center">
              <div className="text-ehs-dark-bg text-[18px] leading-none font-extrabold">
                {totalCategories}
              </div>
              <span className="text-ehs-muted-text/70 text-[9px] font-bold tracking-[0.3px] uppercase">
                Categories
              </span>
            </div>
            <div className="text-center">
              <div className="text-ehs-dark-bg text-[18px] leading-none font-extrabold">
                {totalWhySteps}
              </div>
              <span className="text-ehs-muted-text/70 text-[9px] font-bold tracking-[0.3px] uppercase">
                Why Steps
              </span>
            </div>
            <div className="text-center">
              <div className="text-ehs-dark-bg text-[18px] leading-none font-extrabold">
                {totalActions}
              </div>
              <span className="text-ehs-muted-text/70 text-[9px] font-bold tracking-[0.3px] uppercase">
                Actions
              </span>
            </div>
          </div>
        </div>
      </IncidentGlassCard>

      {/* 2. Metadata Field Card (Type, Date, Injury details) */}
      <IncidentGlassCard paddingClassName="p-4 sm:p-5">
        <div className="mb-4 grid grid-cols-1 gap-4 border-b border-[rgba(15,23,42,0.06)] pb-4 md:grid-cols-[160px_130px_1fr]">
          <div className="flex flex-col">
            <span className="text-ehs-muted-text text-[9.5px] font-bold tracking-wide uppercase">
              Type of Report
            </span>
            <div className="text-ehs-dark-bg mt-1 flex items-center justify-between rounded-lg border border-slate-200/80 bg-slate-50/50 px-3 py-1.5 text-[12px] font-bold">
              <span>Injury</span>
              <Icon icon="mdi:chevron-down" className="text-ehs-gray size-4" />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-ehs-muted-text text-[9.5px] font-bold tracking-wide uppercase">
              Date
            </span>
            <div className="text-ehs-dark-bg mt-1.5 text-[13px] leading-normal font-bold">
              Apr 1, 2026
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-ehs-muted-text text-[9.5px] font-bold tracking-wide uppercase">
              Injury
            </span>
            <div className="text-ehs-dark-bg mt-1.5 text-[13px] leading-normal font-bold">
              Facial laceration — forehead and nose (9 stitches)
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-left">
          <span className="text-ehs-muted-text text-[9.5px] font-bold tracking-wide uppercase">
            Incident Description
          </span>
          <p className="text-ehs-dark-bg text-[12px] leading-relaxed font-medium">
            Employee was cutting coil banding on the Zee Line. The band did not
            fully cut, and when additional force was applied, the coil suddenly
            unwrapped and struck the employee in the forehead and nose.
          </p>
        </div>
      </IncidentGlassCard>

      {/* ℹ️ Instructions banner bar */}
      <div className="text-ehs-muted-text flex items-center gap-2 rounded-xl border border-slate-200/50 bg-slate-50/60 px-4 py-2.5 text-[11px] shadow-sm">
        <Icon
          icon="mdi:information-outline"
          className="text-ehs-gray size-4 shrink-0"
        />
        <span className="font-medium">
          This is an interactive worksheet — click any cell to edit, add or
          remove Why steps, and edit corrective actions. The last step in each
          lane is the root cause.
        </span>
      </div>

      {/* 3. The wide HRCA Interactive Grid (Backed by TanStack Table) */}
      <IncidentGlassCard paddingClassName="p-0 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1300px] border-collapse text-left text-[12px]">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-[rgba(15,23,42,0.06)] bg-slate-50/50"
                >
                  {headerGroup.headers.map((header) => {
                    const isCategory = header.column.id === "category";
                    return (
                      <th
                        key={header.id}
                        className={[
                          "text-ehs-muted-text px-3.5 py-3 text-[10px] font-bold tracking-wider uppercase",
                          isCategory ? "w-[140px] text-center" : "",
                          header.column.id === "contributingFactor"
                            ? "w-[200px]"
                            : "",
                          header.column.id.startsWith("why") ? "w-[180px]" : "",
                          header.column.id === "correctiveActions"
                            ? "w-[220px]"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[rgba(15,23,42,0.04)] transition-colors hover:bg-slate-50/20"
                >
                  {row.getVisibleCells().map((cell) => {
                    const isCategory = cell.column.id === "category";
                    return (
                      <td
                        key={cell.id}
                        className={[
                          "p-3.5 align-middle",
                          isCategory ? "text-center" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </IncidentGlassCard>

      {/* Footer metadata description */}
      <span className="text-ehs-muted-text py-1 text-center text-[10.5px] font-semibold">
        Read each lane left → right: the contributing factor, then ask
        &quot;Why?&quot; until you reach the root cause (yellow). Edits persist
        on this device. Sample bound to INC-2025.
      </span>
    </div>
  );
}
