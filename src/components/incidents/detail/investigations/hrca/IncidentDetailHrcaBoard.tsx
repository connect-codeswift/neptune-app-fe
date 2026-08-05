"use client";

import { useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  useCreateContributingFactorMutation,
  useCreateRcaCorrectiveActionMutation,
  useCreateRcaWhysMutation,
  useDropRcaCorrectiveActionMutation,
  useDropRcaWhyMutation,
  useUpdateContributingFactorMutation,
  useUpdateRcaWhyMutation,
} from "@/hooks/use-rca-mutations";
import { useRcaByIncidentQuery } from "@/hooks/use-rca-queries";
import { toast } from "@/lib/toast";
import { mapRcaHrcaLanesToHrcaRows } from "@/services/mappers/rca.mapper";
import { HrcaHeaderCard } from "@/components/incidents/detail/investigations/hrca/HrcaHeaderCard";
import { HrcaTable } from "@/components/incidents/detail/investigations/hrca/HrcaTable";
import type {
  HrcaMeta,
  HrcaRow,
} from "@/components/incidents/detail/investigations/hrca/hrca-data";
import { HRCA_META } from "@/components/incidents/detail/investigations/hrca/hrca-data";

export type { HrcaRow, HrcaWhyStep } from "@/components/incidents/detail/investigations/hrca/hrca-data";

export type IncidentDetailHrcaBoardProps = Readonly<{
  incidentId: number;
  queryEnabled?: boolean;
  onClose?: () => void;
  meta?: HrcaMeta;
  incidentLabel?: string;
  className?: string;
}>;

function findRow(rows: readonly HrcaRow[], rowId: string): HrcaRow | undefined {
  return rows.find((row) => row.id === rowId);
}

export function IncidentDetailHrcaBoard(
  props: Readonly<IncidentDetailHrcaBoardProps>,
) {
  const {
    incidentId,
    queryEnabled = true,
    onClose,
    meta = HRCA_META,
    incidentLabel,
    className = "",
  } = props;

  const rcaQuery = useRcaByIncidentQuery({
    incidentId,
    enabled: queryEnabled && incidentId > 0,
  });

  const createFactorMutation = useCreateContributingFactorMutation();
  const updateFactorMutation = useUpdateContributingFactorMutation();
  const createWhysMutation = useCreateRcaWhysMutation();
  const updateWhyMutation = useUpdateRcaWhyMutation();
  const dropWhyMutation = useDropRcaWhyMutation();
  const createActionMutation = useCreateRcaCorrectiveActionMutation();
  const dropActionMutation = useDropRcaCorrectiveActionMutation();

  const isSaving =
    createFactorMutation.isPending ||
    updateFactorMutation.isPending ||
    createWhysMutation.isPending ||
    updateWhyMutation.isPending ||
    dropWhyMutation.isPending ||
    createActionMutation.isPending ||
    dropActionMutation.isPending;

  const rows = useMemo(
    () => mapRcaHrcaLanesToHrcaRows(rcaQuery.data?.lanes ?? []),
    [rcaQuery.data?.lanes],
  );

  const totalCategories = rows.length;
  const totalWhySteps = rows.reduce((sum, row) => sum + row.whys.length, 0);
  const totalActions = rows.reduce(
    (sum, row) => sum + row.correctiveActions.length,
    0,
  );

  const requireContributingFactor = useCallback((row: HrcaRow): number | null => {
    if (row.contributingFactorId == null || row.contributingFactorId <= 0) {
      toast.error(
        "Contributing factor required",
        `Define the contributing factor for ${row.category} before continuing.`,
      );
      return null;
    }
    return row.contributingFactorId;
  }, []);

  const onEditFactor = useCallback(
    async (rowId: string, currentText: string) => {
      const row = findRow(rows, rowId);
      if (!row) return;

      const nextText = prompt("Edit Contributing Factor:", currentText);
      if (nextText === null) return;

      const description = nextText.trim();
      if (!description) {
        toast.error("Description required", "Enter a contributing factor.");
        return;
      }

      try {
        if (row.contributingFactorId == null) {
          await createFactorMutation.mutateAsync({
            incidentId,
            rcaCategoryId: row.categoryId,
            description,
          });
          toast.success("Saved", `Contributing factor added to ${row.category}.`);
        } else {
          await updateFactorMutation.mutateAsync({
            incidentId,
            contributingFactorId: row.contributingFactorId,
            rcaCategoryId: row.categoryId,
            description,
          });
          toast.success("Saved", "Contributing factor updated.");
        }
      } catch (error) {
        toast.error(
          "Save failed",
          getMutationErrorMessage(error, "Could not save contributing factor."),
        );
      }
    },
    [createFactorMutation, incidentId, rows, updateFactorMutation],
  );

  const onAddWhy = useCallback(
    async (rowId: string) => {
      const row = findRow(rows, rowId);
      if (!row) return;

      const contributingFactorId = requireContributingFactor(row);
      if (contributingFactorId == null) return;

      if (row.whys.length >= 5) {
        toast.error(
          "Limit Reached",
          "A maximum of 5 Whys can be defined per category row.",
        );
        return;
      }

      const nextNum = row.whys.length + 1;
      const nextText = prompt(`Enter Why ${String(nextNum)} description:`);
      if (nextText === null) return;

      const description = nextText.trim();
      if (!description) {
        toast.error("Description required", "Enter a why step description.");
        return;
      }

      try {
        await createWhysMutation.mutateAsync({
          incidentId,
          contributingFactorId,
          whys: [{ stepNumber: nextNum, description }],
        });
        toast.success("Why Step Added", `Added Why ${String(nextNum)} to ${row.category}.`);
      } catch (error) {
        toast.error(
          "Save failed",
          getMutationErrorMessage(error, "Could not add why step."),
        );
      }
    },
    [createWhysMutation, incidentId, requireContributingFactor, rows],
  );

  const onRemoveWhy = useCallback(
    async (rowId: string, whyIndex: number) => {
      const row = findRow(rows, rowId);
      if (!row) return;

      const why = row.whys[whyIndex];
      if (!why?.id) {
        toast.error("Cannot remove", "This why step is not saved yet.");
        return;
      }

      if (!window.confirm(`Remove Why ${String(why.num)} from ${row.category}?`)) {
        return;
      }

      try {
        await dropWhyMutation.mutateAsync({
          whyId: why.id,
          incidentId,
        });
        toast.success("Removed", `Why ${String(why.num)} removed.`);
      } catch (error) {
        toast.error(
          "Remove failed",
          getMutationErrorMessage(error, "Could not remove why step."),
        );
      }
    },
    [dropWhyMutation, incidentId, rows],
  );

  const onEditWhy = useCallback(
    async (rowId: string, whyIndex: number, currentText: string) => {
      const row = findRow(rows, rowId);
      if (!row) return;

      const why = row.whys[whyIndex];
      if (!why) return;

      const contributingFactorId = requireContributingFactor(row);
      if (contributingFactorId == null) return;

      const nextText = prompt(
        `Edit Why ${String(whyIndex + 1)} description:`,
        currentText,
      );
      if (nextText === null) return;

      const description = nextText.trim();
      if (!description) {
        toast.error("Description required", "Enter a why step description.");
        return;
      }

      const isRootCause = whyIndex === row.whys.length - 1;

      try {
        if (why.id) {
          await updateWhyMutation.mutateAsync({
            incidentId,
            whyId: why.id,
            stepNumber: why.num,
            description,
            isRootCause,
          });
        } else {
          await createWhysMutation.mutateAsync({
            incidentId,
            contributingFactorId,
            whys: [{ stepNumber: why.num, description, isRootCause }],
          });
        }
        toast.success("Saved", "Why step updated.");
      } catch (error) {
        toast.error(
          "Save failed",
          getMutationErrorMessage(error, "Could not save why step."),
        );
      }
    },
    [
      createWhysMutation,
      incidentId,
      requireContributingFactor,
      rows,
      updateWhyMutation,
    ],
  );

  const onAddAction = useCallback(
    async (rowId: string) => {
      const row = findRow(rows, rowId);
      if (!row) return;

      const contributingFactorId = requireContributingFactor(row);
      if (contributingFactorId == null) return;

      const actionText = prompt("Enter new Corrective Action description:");
      if (actionText === null) return;

      const description = actionText.trim();
      if (!description) {
        toast.error("Description required", "Enter a corrective action.");
        return;
      }

      try {
        await createActionMutation.mutateAsync({
          incidentId,
          contributingFactorId,
          description,
        });
        toast.success("Action Added", `Added action to ${row.category}.`);
      } catch (error) {
        toast.error(
          "Save failed",
          getMutationErrorMessage(error, "Could not add corrective action."),
        );
      }
    },
    [createActionMutation, incidentId, requireContributingFactor, rows],
  );

  const onRemoveAction = useCallback(
    async (rowId: string, actionIndex: number) => {
      const row = findRow(rows, rowId);
      if (!row) return;

      const action = row.correctiveActions[actionIndex];
      if (!action?.id) {
        toast.error("Cannot remove", "This corrective action is not saved yet.");
        return;
      }

      if (!window.confirm(`Remove this corrective action from ${row.category}?`)) {
        return;
      }

      try {
        await dropActionMutation.mutateAsync({
          correctiveActionId: action.id,
          incidentId,
        });
        toast.success("Removed", "Corrective action removed.");
      } catch (error) {
        toast.error(
          "Remove failed",
          getMutationErrorMessage(error, "Could not remove corrective action."),
        );
      }
    },
    [dropActionMutation, incidentId, rows],
  );

  const handlers = useMemo(
    () => ({
      onEditFactor: (rowId: string, current: string) => {
        void onEditFactor(rowId, current);
      },
      onEditWhy: (rowId: string, whyIndex: number, current: string) => {
        void onEditWhy(rowId, whyIndex, current);
      },
      onRemoveWhy: (rowId: string, whyIndex: number) => {
        void onRemoveWhy(rowId, whyIndex);
      },
      onAddWhy: (rowId: string) => {
        void onAddWhy(rowId);
      },
      onAddAction: (rowId: string) => {
        void onAddAction(rowId);
      },
      onRemoveAction: (rowId: string, actionIndex: number) => {
        void onRemoveAction(rowId, actionIndex);
      },
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

  const errorMessage =
    rcaQuery.isError
      ? getMutationErrorMessage(rcaQuery.error, "Failed to load HRCA data.")
      : null;

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
          Click any cell to edit, add or remove Why steps, and manage corrective
          actions. The last step in each lane is the root cause.
          {isSaving ? " Saving changes…" : ""}
        </span>
      </div>

      {rcaQuery.isLoading ? (
        <div className="text-ehs-muted-text rounded-[12px] border border-[rgba(15,23,42,0.08)] bg-white/50 px-4 py-10 text-center text-sm">
          Loading HRCA worksheet…
        </div>
      ) : errorMessage ? (
        <div className="flex flex-col items-center gap-3 rounded-[12px] border border-[rgba(15,23,42,0.08)] bg-white/50 px-4 py-10 text-center text-sm">
          <p className="text-ehs-red">{errorMessage}</p>
          <button
            type="button"
            onClick={() => {
              void rcaQuery.refetch();
            }}
            className="text-ehs-normal-blue text-sm font-semibold hover:underline"
          >
            Retry
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="text-ehs-muted-text rounded-[12px] border border-[rgba(15,23,42,0.08)] bg-white/50 px-4 py-10 text-center text-sm">
          No HRCA lanes are configured. Seeded RCA categories (ids 1–5) are
          required to render the worksheet.
        </div>
      ) : (
        <HrcaTable rows={rows} handlers={handlers} />
      )}

      <p className="text-ehs-muted-text px-1 pb-1 text-center text-sm leading-relaxed font-medium">
        Read each lane left → right: the contributing factor, then ask
        &quot;Why?&quot; until you reach the root cause (yellow). Changes are
        saved to the server
        {incidentLabel ? ` · ${incidentLabel}` : ""}.
      </p>
    </div>
  );
}
