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
  /** Renders the worksheet as a record: no add, edit or remove affordances. */
  readOnly?: boolean;
  className?: string;
}>;

const columnHelper = createColumnHelper<HrcaRow>();

function WhyHeader(props: Readonly<{ step: number }>) {
  const { step } = props;
  return (
    <div className="rounded-2.25 border-ehs-border-ink/8 bg-ehs-surface/62 flex h-8.75 w-full items-center justify-center gap-1.5 border px-2.75 py-2.25">
      <span className="bg-ehs-slate text8 text-ehs-light-bg inline-flex size-4.25 shrink-0 items-center justify-center rounded-[9px] font-bold tracking-[0.23px]">
        {String(step)}
      </span>
      <Text
        as="span"
        className="text8 text-ehs-gray leading-none font-bold tracking-[0.23px]"
      >
        Why?
      </Text>
    </div>
  );
}

export function HrcaTable(props: Readonly<HrcaTableProps>) {
  const { rows, handlers, readOnly = false, className = "" } = props;

  const columns = useMemo(
    () => [
      columnHelper.accessor("category", {
        id: "category",
        header: () => (
          <Text
            as="span"
            className="text-ehs-muted-text text8 pl-1 leading-none font-bold tracking-[0.84px] uppercase"
          >
            Category
          </Text>
        ),
        cell: (info) => <HrcaCategoryCell category={info.getValue()} />,
      }),
      columnHelper.accessor("contributingFactor", {
        id: "contributingFactor",
        header: () => (
          <div className="bg-ehs-normal-blue/13 rounded-2.25 border-ehs-border-ink/8 my-0.5 flex h-7.75 w-full items-center justify-center border px-2.75 py-2.25">
            <Text
              as="span"
              className="text8 text-ehs-dark-blue text-center leading-none font-bold tracking-[0.23px]"
            >
              Contributing factor
            </Text>
          </div>
        ),
        cell: (info) => (
          <HrcaContributingFactorCell
            text={info.getValue()}
            accent={info.row.original.accent}
            readOnly={readOnly}
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
                readOnly={readOnly}
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
          <div className="rounded-2.25 border-ehs-border-ink/8 bg-ehs-green/14 my-0.5 flex h-7.75 w-full items-center justify-center gap-1.5 border px-2.75 py-2.25">
            <Icon
              icon="mdi:check"
              className="text-ehs-green size-3"
              aria-hidden="true"
            />
            <Text
              as="span"
              className="text8 text-ehs-green text-center leading-none font-bold tracking-[0.23px]"
            >
              Corrective actions
            </Text>
          </div>
        ),
        cell: (info) => (
          <HrcaCorrectiveActionsCell
            actions={info.getValue()}
            readOnly={readOnly}
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
    [handlers, readOnly],
  );

  const table = useReactTable({
    data: rows as HrcaRow[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <article
      className={[
        "rounded-5 backdrop-blur-2.5 before:rounded-5 border-ehs-hairline/90 bg-ehs-surface/62 relative overflow-hidden border p-4.25 shadow-(--ehs-shadow-card) before:pointer-events-none before:absolute before:inset-0",
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
                        ? "bg-ehs-surface/95 sticky left-0 z-10 backdrop-blur-sm"
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
