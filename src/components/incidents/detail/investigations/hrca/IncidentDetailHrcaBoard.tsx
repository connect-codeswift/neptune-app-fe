"use client";

import { useCallback, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "@/lib/toast";
import { HrcaHeaderCard } from "@/components/incidents/detail/investigations/hrca/HrcaHeaderCard";
import { HrcaTable } from "@/components/incidents/detail/investigations/hrca/HrcaTable";
import {
  HRCA_META,
  markRootCauses,
  type HrcaMeta,
  type HrcaRow,
} from "@/components/incidents/detail/investigations/hrca/hrca-data";

export type { HrcaRow, HrcaWhyStep } from "@/components/incidents/detail/investigations/hrca/hrca-data";

export type IncidentDetailHrcaBoardProps = Readonly<{
  onClose?: () => void;
  meta?: HrcaMeta;
  initialRows?: readonly HrcaRow[];
  incidentLabel?: string;
  className?: string;
}>;

export function IncidentDetailHrcaBoard(
  props: Readonly<IncidentDetailHrcaBoardProps>,
) {
  const {
    onClose,
    meta = HRCA_META,
    initialRows = [],
    incidentLabel,
    className = "",
  } = props;
  const [rows, setRows] = useState<readonly HrcaRow[]>(initialRows);

  const totalCategories = rows.length;
  const totalWhySteps = rows.reduce((sum, row) => sum + row.whys.length, 0);
  const totalActions = rows.reduce(
    (sum, row) => sum + row.correctiveActions.length,
    0,
  );

  const onAddWhy = useCallback((rowId: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        if (row.whys.length >= 5) {
          toast.error(
            "Limit Reached",
            "A maximum of 5 Whys can be defined per category row.",
          );
          return row;
        }
        const nextNum = row.whys.length + 1;
        toast.success("Why Step Added", `Added Why ${nextNum} to ${row.category}`);
        return {
          ...row,
          whys: markRootCauses([
            ...row.whys,
            {
              num: nextNum,
              text: `Click to define Why ${nextNum} analysis detail...`,
            },
          ]),
        };
      }),
    );
  }, []);

  const onRemoveWhy = useCallback((rowId: string, whyIndex: number) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const nextWhys = row.whys.filter((_, index) => index !== whyIndex);
        return { ...row, whys: markRootCauses(nextWhys) };
      }),
    );
  }, []);

  const onEditWhy = useCallback(
    (rowId: string, whyIndex: number, currentText: string) => {
      const nextText = prompt(
        `Edit Why ${whyIndex + 1} description:`,
        currentText,
      );
      if (nextText === null) return;
      setRows((prev) =>
        prev.map((row) => {
          if (row.id !== rowId) return row;
          const nextWhys = row.whys.map((why, index) =>
            index === whyIndex
              ? { ...why, text: nextText.trim() || "N/A" }
              : why,
          );
          return { ...row, whys: nextWhys };
        }),
      );
    },
    [],
  );

  const onEditFactor = useCallback((rowId: string, currentText: string) => {
    const nextText = prompt("Edit Contributing Factor:", currentText);
    if (nextText === null) return;
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? { ...row, contributingFactor: nextText.trim() || "N/A" }
          : row,
      ),
    );
  }, []);

  const onAddAction = useCallback((rowId: string) => {
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
  }, []);

  const onRemoveAction = useCallback((rowId: string, actionIndex: number) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        return {
          ...row,
          correctiveActions: row.correctiveActions.filter(
            (_, index) => index !== actionIndex,
          ),
        };
      }),
    );
  }, []);

  const handlers = useMemo(
    () => ({
      onEditFactor,
      onEditWhy,
      onRemoveWhy,
      onAddWhy,
      onAddAction,
      onRemoveAction,
    }),
    [
      onEditFactor,
      onEditWhy,
      onRemoveWhy,
      onAddWhy,
      onAddAction,
      onRemoveAction,
    ],
  );

  return (
    <div
      className={["flex flex-col gap-[18px]", className]
        .filter(Boolean)
        .join(" ")}
    >
      <HrcaHeaderCard
        meta={meta}
        categories={totalCategories}
        whySteps={totalWhySteps}
        actions={totalActions}
        onClose={onClose}
      />

      <div className="text-ehs-muted-text flex items-start gap-2.5 px-1 text-sm leading-[17px]">
        <Icon
          icon="mdi:information-outline"
          className="text-ehs-gray mt-0.5 size-[13px] shrink-0"
          aria-hidden="true"
        />
        <span>
          This is an interactive worksheet — click any cell to edit, add or
          remove Why steps, and edit corrective actions. The last step in each
          lane is the root cause.
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="text-ehs-muted-text rounded-[12px] border border-[rgba(15,23,42,0.08)] bg-white/50 px-4 py-10 text-center text-sm">
          No HRCA factors recorded for this incident yet. Open findings will
          appear here once investigation fields are captured.
        </div>
      ) : (
        <HrcaTable rows={rows} handlers={handlers} />
      )}

      <p className="text-ehs-muted-text px-1 pb-1 text-center text-sm leading-relaxed font-medium">
        Read each lane left → right: the contributing factor, then ask
        &quot;Why?&quot; until you reach the root cause (yellow). Edits persist
        on this device
        {incidentLabel ? ` · Bound to ${incidentLabel}` : ""}.
      </p>
    </div>
  );
}
