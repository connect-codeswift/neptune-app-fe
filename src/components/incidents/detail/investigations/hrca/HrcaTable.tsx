"use client";

import { useMemo } from "react";
import { Icon } from "@iconify/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  HrcaCategoryCell,
  HrcaContributingFactorCell,
  HrcaCorrectiveActionsCell,
  HrcaWhyCell,
} from "@/components/incidents/detail/investigations/hrca/HrcaCells";
import type { HrcaRow } from "@/components/incidents/detail/investigations/hrca/hrca-data";

export type HrcaTableHandlers = Readonly<{
  onEditFactor: (rowId: string, current: string) => void;
  onEditWhy: (rowId: string, whyIndex: number, current: string) => void;
  onRemoveWhy: (rowId: string, whyIndex: number) => void;
  onAddWhy: (rowId: string) => void;
  onAddAction: (rowId: string) => void;
  onRemoveAction: (rowId: string, actionIndex: number) => void;
}>;

export type HrcaTableProps = Readonly<{
  rows: readonly HrcaRow[];
  handlers: HrcaTableHandlers;
  className?: string;
}>;

const columnHelper = createColumnHelper<HrcaRow>();

/** Matches Figma grid: 136px | 1.2fr | 5×1fr | 1.35fr */
const gridColsClass =
  "grid grid-cols-[136px_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.35fr)] gap-x-2.5";

function WhyHeader(props: Readonly<{ step: number }>) {
  const { step } = props;
  return (
    <div className="flex h-[35px] w-full items-center justify-center gap-1.5 rounded-[9px] border border-[rgba(15,23,42,0.08)] bg-white/62 px-[11px] py-[9px]">
      <span className="inline-flex size-[17px] shrink-0 items-center justify-center rounded-[8.5px] bg-[#2a3446] text-[10px] font-bold tracking-[0.23px] text-[#f3f5f8]">
        {String(step)}
      </span>
      <Text
        as="span"
        className="text-[11.5px] font-bold tracking-[0.23px] text-[#566072]"
      >
        Why?
      </Text>
    </div>
  );
}

export function HrcaTable(props: Readonly<HrcaTableProps>) {
  const { rows, handlers, className = "" } = props;

  const columns = useMemo(
    () => [
      columnHelper.accessor("category", {
        id: "category",
        header: () => (
          <Text
            as="span"
            className="text-ehs-muted-text pl-1 text-[10.5px] font-bold tracking-[0.84px] uppercase"
          >
            Category
          </Text>
        ),
        cell: (info) => <HrcaCategoryCell category={info.getValue()} />,
      }),
      columnHelper.accessor("contributingFactor", {
        id: "contributingFactor",
        header: () => (
          <div className="flex h-[31px] w-full items-center justify-center rounded-[9px] border border-[rgba(15,23,42,0.08)] bg-[rgba(8,145,166,0.13)] px-[11px] py-[9px]">
            <Text
              as="span"
              className="text-center text-[11.5px] font-bold tracking-[0.23px] text-[#056e7e]"
            >
              Contributing factor
            </Text>
          </div>
        ),
        cell: (info) => (
          <HrcaContributingFactorCell
            text={info.getValue()}
            accent={info.row.original.accent}
            onEdit={() =>
              handlers.onEditFactor(info.row.original.id, info.getValue())
            }
          />
        ),
      }),
      ...[0, 1, 2, 3, 4].map((stepIdx) => {
        const stepNum = stepIdx + 1;
        return columnHelper.display({
          id: `why${stepNum}`,
          header: () => <WhyHeader step={stepNum} />,
          cell: (info) => {
            const row = info.row.original;
            const why = row.whys[stepIdx];
            const canAdd = row.whys.length === stepIdx;
            return (
              <HrcaWhyCell
                why={why}
                accent={row.accent}
                canAdd={canAdd}
                showConnector={stepIdx > 0}
                onEdit={() =>
                  handlers.onEditWhy(row.id, stepIdx, why?.text ?? "")
                }
                onRemove={() => handlers.onRemoveWhy(row.id, stepIdx)}
                onAdd={() => handlers.onAddWhy(row.id)}
              />
            );
          },
        });
      }),
      columnHelper.accessor("correctiveActions", {
        id: "correctiveActions",
        header: () => (
          <div className="flex h-[31px] w-full items-center justify-center gap-1.5 rounded-[9px] border border-[rgba(15,23,42,0.08)] bg-[rgba(16,185,129,0.14)] px-[11px] py-[9px]">
            <Icon
              icon="mdi:check"
              className="size-3 text-[#10b981]"
              aria-hidden="true"
            />
            <Text
              as="span"
              className="text-center text-[11.5px] font-bold tracking-[0.23px] text-[#10b981]"
            >
              Corrective actions
            </Text>
          </div>
        ),
        cell: (info) => (
          <HrcaCorrectiveActionsCell
            actions={info.getValue()}
            onAdd={() => handlers.onAddAction(info.row.original.id)}
            onRemove={(actionIndex) =>
              handlers.onRemoveAction(info.row.original.id, actionIndex)
            }
          />
        ),
      }),
    ],
    [handlers],
  );

  const table = useReactTable({
    data: rows as HrcaRow[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <IncidentGlassCard
      paddingClassName="overflow-hidden p-[17px]"
      className={className}
    >
      <div className="w-full overflow-x-auto">
        <div className="flex min-w-[1500px] flex-col gap-2.5">
          {table.getHeaderGroups().map((headerGroup) => (
            <div
              key={headerGroup.id}
              className={[gridColsClass, "h-[35px] items-center"].join(" ")}
            >
              {headerGroup.headers.map((header) => (
                <div
                  key={header.id}
                  className={[
                    "flex items-center",
                    header.column.id === "category"
                      ? "justify-start"
                      : "justify-center",
                  ].join(" ")}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </div>
              ))}
            </div>
          ))}

          <div className="flex flex-col gap-3">
            {table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                className={[gridColsClass, "min-h-[128px] items-stretch"].join(
                  " ",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <div key={cell.id} className="min-w-0">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </IncidentGlassCard>
  );
}
