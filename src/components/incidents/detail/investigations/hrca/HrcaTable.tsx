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
import {
  HrcaCategoryCell,
  HrcaContributingFactorCell,
  HrcaCorrectiveActionsCell,
  HrcaWhyCell,
} from "@/components/incidents/detail/investigations/hrca/HrcaCells";
import type { HrcaRow } from "@/components/incidents/detail/investigations/hrca/hrca-data";
import {
  HRCA_TABLE_MIN_WIDTH_PX,
  hrcaDesktopGridClass,
} from "@/components/incidents/detail/investigations/hrca/hrca-layout";

export type HrcaTableHandlers = Readonly<{
  onEditFactor: (rowId: string, current: string) => void;
  onEditWhy: (rowId: string, whyIndex: number, current: string) => void;
  onRemoveWhy: (rowId: string, whyIndex: number) => void;
  onAddWhy: (rowId: string) => void;
  onAddAction: (rowId: string) => void;
  onEditAction: (rowId: string, actionIndex: number, current: string) => void;
  onRemoveAction: (rowId: string, actionIndex: number) => void;
}>;

export type HrcaTableProps = Readonly<{
  rows: readonly HrcaRow[];
  handlers: HrcaTableHandlers;
  className?: string;
}>;

const columnHelper = createColumnHelper<HrcaRow>();

function WhyHeader(props: Readonly<{ step: number }>) {
  const { step } = props;
  return (
    <div className="flex h-8.75 w-full items-center justify-center gap-1.5 rounded-2.25 border border-[rgba(15,23,42,0.08)] bg-white/62 px-2.75 py-2.25">
      <span className="bg-ehs-slate inline-flex size-4.25 shrink-0 items-center justify-center rounded-[8.5px] text8 font-bold tracking-[0.23px] text-[#f3f5f8]">
        {String(step)}
      </span>
      <Text
        as="span"
        className="text8 leading-none font-bold tracking-[0.23px] text-[#566072]"
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
            className="text-ehs-muted-text pl-1 text8 leading-none font-bold tracking-[0.84px] uppercase"
          >
            Category
          </Text>
        ),
        cell: (info) => <HrcaCategoryCell category={info.getValue()} />,
      }),
      columnHelper.accessor("contributingFactor", {
        id: "contributingFactor",
        header: () => (
          <div className="bg-ehs-normal-blue/13 my-0.5 flex h-7.75 w-full items-center justify-center rounded-2.25 border border-[rgba(15,23,42,0.08)] px-2.75 py-2.25">
            <Text
              as="span"
              className="text-center text8 leading-none font-bold tracking-[0.23px] text-[#056e7e]"
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
          <div className="my-0.5 flex h-7.75 w-full items-center justify-center gap-1.5 rounded-2.25 border border-[rgba(15,23,42,0.08)] bg-[rgba(16,185,129,0.14)] px-2.75 py-2.25">
            <Icon
              icon="mdi:check"
              className="size-3 text-[#10b981]"
              aria-hidden="true"
            />
            <Text
              as="span"
              className="text-center text8 leading-none font-bold tracking-[0.23px] text-[#10b981]"
            >
              Corrective actions
            </Text>
          </div>
        ),
        cell: (info) => (
          <HrcaCorrectiveActionsCell
            actions={info.getValue()}
            onAdd={() => handlers.onAddAction(info.row.original.id)}
            onEdit={(actionIndex, current) =>
              handlers.onEditAction(info.row.original.id, actionIndex, current)
            }
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
    <article
      className={[
        "relative overflow-hidden rounded-5 border border-white/90 bg-white/62 p-4.25 shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_-12px_rgba(15,23,42,0.14)] backdrop-blur-2.5 before:pointer-events-none before:absolute before:inset-0 before:rounded-5 before:shadow-[inset_0px_1px_0px_1px_rgba(255,255,255,0.9)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative z-1 w-full overflow-x-auto overscroll-x-contain">
        <div
          className="flex flex-col gap-2.5"
          style={{ minWidth: `${String(HRCA_TABLE_MIN_WIDTH_PX)}px` }}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <div
              key={headerGroup.id}
              className={[hrcaDesktopGridClass, "h-8.75 items-center"].join(
                " ",
              )}
            >
              {headerGroup.headers.map((header) => (
                <div
                  key={header.id}
                  className={[
                    "flex items-center",
                    header.column.id === "category"
                      ? "sticky left-0 z-20 justify-start pr-1"
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
                className={[hrcaDesktopGridClass, "items-stretch"].join(" ")}
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    className={[
                      "min-w-0",
                      cell.column.id === "category"
                        ? "sticky left-0 z-10 bg-[rgba(255,255,255,0.95)] backdrop-blur-sm"
                        : "",
                    ].join(" ")}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
