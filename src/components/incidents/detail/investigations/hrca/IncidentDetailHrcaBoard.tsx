"use client";

import { useCallback, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  useCreateContributingFactorMutation,
  useCreateRcaCorrectiveActionMutation,
  useCreateRcaWhysMutation,
  useDropRcaCorrectiveActionMutation,
  useDropRcaWhyMutation,
  useUpdateContributingFactorMutation,
  useUpdateRcaCorrectiveActionMutation,
  useUpdateRcaWhyMutation,
} from "@/hooks/use-rca-mutations";
import { useRcaByIncidentQuery } from "@/hooks/use-rca-queries";
import { toast } from "@/lib/toast";
import { mapRcaHrcaLanesToHrcaRows } from "@/services/mappers/rca.mapper";
import { HrcaCellModal } from "@/components/incidents/detail/investigations/hrca/HrcaCellModal";
import { HrcaConfirmModal } from "@/components/incidents/detail/investigations/hrca/HrcaConfirmModal";
import { HrcaHeaderCard } from "@/components/incidents/detail/investigations/hrca/HrcaHeaderCard";
import { HrcaTable } from "@/components/incidents/detail/investigations/hrca/HrcaTable";
import type {
  HrcaCellModalState,
  HrcaConfirmModalState,
} from "@/components/incidents/detail/investigations/hrca/hrca-modal-types";
import type {
  HrcaMeta,
  HrcaRow,
} from "@/components/incidents/detail/investigations/hrca/hrca-data";
import { EMPTY_HRCA_META } from "@/components/incidents/detail/investigations/hrca/hrca-data";

export type {
  HrcaRow,
  HrcaWhyStep,
} from "@/components/incidents/detail/investigations/hrca/hrca-data";

export type IncidentDetailHrcaBoardProps = Readonly<{
  incidentId: number;
  queryEnabled?: boolean;
  onClose?: () => void;
  meta?: HrcaMeta;
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
    meta = EMPTY_HRCA_META,
    className = "",
  } = props;

  const [cellModal, setCellModal] = useState<HrcaCellModalState | null>(null);
  const [confirmModal, setConfirmModal] =
    useState<HrcaConfirmModalState | null>(null);

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
  const updateActionMutation = useUpdateRcaCorrectiveActionMutation();
  const dropActionMutation = useDropRcaCorrectiveActionMutation();

  const isSaving =
    createFactorMutation.isPending ||
    updateFactorMutation.isPending ||
    createWhysMutation.isPending ||
    updateWhyMutation.isPending ||
    dropWhyMutation.isPending ||
    createActionMutation.isPending ||
    updateActionMutation.isPending ||
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

  const requireContributingFactor = useCallback(
    (row: HrcaRow): number | null => {
      if (row.contributingFactorId == null || row.contributingFactorId <= 0) {
        toast.error(
          "Contributing factor required",
          `Define the contributing factor for ${row.category} before continuing.`,
        );
        return null;
      }
      return row.contributingFactorId;
    },
    [],
  );

  const openEditFactor = useCallback(
    (rowId: string, currentText: string) => {
      const row = findRow(rows, rowId);
      if (!row) return;

      setCellModal({
        kind: "contributingFactor",
        mode: row.contributingFactorId == null ? "add" : "edit",
        rowId,
        category: row.category,
        initialText: currentText,
      });
    },
    [rows],
  );

  const openAddWhy = useCallback(
    (rowId: string) => {
      const row = findRow(rows, rowId);
      if (!row) return;

      if (requireContributingFactor(row) == null) return;

      if (row.whys.length >= 5) {
        toast.error(
          "Limit reached",
          "A maximum of 5 Whys can be defined per category row.",
        );
        return;
      }

      const nextNum = row.whys.length + 1;
      setCellModal({
        kind: "why",
        mode: "add",
        rowId,
        category: row.category,
        initialText: "",
        stepNum: nextNum,
        isRootCause: true,
      });
    },
    [requireContributingFactor, rows],
  );

  const openEditWhy = useCallback(
    (rowId: string, whyIndex: number, currentText: string) => {
      const row = findRow(rows, rowId);
      if (!row) return;

      const why = row.whys[whyIndex];
      if (!why) return;

      setCellModal({
        kind: "why",
        mode: "edit",
        rowId,
        category: row.category,
        initialText: currentText,
        stepNum: why.num,
        whyIndex,
        isRootCause: whyIndex === row.whys.length - 1,
      });
    },
    [rows],
  );

  const openAddAction = useCallback(
    (rowId: string) => {
      const row = findRow(rows, rowId);
      if (!row) return;

      if (requireContributingFactor(row) == null) return;

      setCellModal({
        kind: "correctiveAction",
        mode: "add",
        rowId,
        category: row.category,
        initialText: "",
      });
    },
    [requireContributingFactor, rows],
  );

  const openEditAction = useCallback(
    (rowId: string, actionIndex: number, currentText: string) => {
      const row = findRow(rows, rowId);
      if (!row) return;

      const action = row.correctiveActions[actionIndex];
      if (!action) return;

      setCellModal({
        kind: "correctiveAction",
        mode: "edit",
        rowId,
        category: row.category,
        initialText: currentText,
        actionId: action.id,
      });
    },
    [rows],
  );

  const openRemoveWhy = useCallback(
    (rowId: string, whyIndex: number) => {
      const row = findRow(rows, rowId);
      if (!row) return;

      const why = row.whys[whyIndex];
      if (!why?.id) {
        toast.error("Cannot remove", "This why step is not saved yet.");
        return;
      }

      setConfirmModal({
        kind: "why",
        rowId,
        category: row.category,
        whyIndex,
        title: `Remove Why ${String(why.num)}?`,
        message: `Remove Why ${String(why.num)} from ${row.category}? This step will be deleted from the worksheet.`,
      });
    },
    [rows],
  );

  const openRemoveAction = useCallback(
    (rowId: string, actionIndex: number) => {
      const row = findRow(rows, rowId);
      if (!row) return;

      const action = row.correctiveActions[actionIndex];
      if (!action?.id) {
        toast.error(
          "Cannot remove",
          "This corrective action is not saved yet.",
        );
        return;
      }

      setConfirmModal({
        kind: "correctiveAction",
        rowId,
        category: row.category,
        actionIndex,
        title: "Remove corrective action?",
        message: `Remove this corrective action from ${row.category}?`,
      });
    },
    [rows],
  );

  const handleCellSubmit = useCallback(
    async (description: string) => {
      if (!cellModal) return;

      const row = findRow(rows, cellModal.rowId);
      if (!row) return;

      try {
        if (cellModal.kind === "contributingFactor") {
          if (row.contributingFactorId == null) {
            await createFactorMutation.mutateAsync({
              incidentId,
              rcaCategoryId: row.categoryId,
              description,
            });
            toast.success(
              "Saved",
              `Contributing factor added to ${row.category}.`,
            );
          } else {
            await updateFactorMutation.mutateAsync({
              incidentId,
              contributingFactorId: row.contributingFactorId,
              rcaCategoryId: row.categoryId,
              description,
            });
            toast.success("Saved", "Contributing factor updated.");
          }
          return;
        }

        if (cellModal.kind === "why") {
          const contributingFactorId = requireContributingFactor(row);
          if (contributingFactorId == null) {
            throw new Error("Contributing factor required");
          }

          if (cellModal.mode === "add") {
            const stepNumber = cellModal.stepNum ?? row.whys.length + 1;
            await createWhysMutation.mutateAsync({
              incidentId,
              contributingFactorId,
              whys: [{ stepNumber, description }],
            });
            toast.success(
              "Why step added",
              `Added Why ${String(stepNumber)} to ${row.category}.`,
            );
            return;
          }

          const whyIndex = cellModal.whyIndex;
          if (whyIndex == null) return;

          const why = row.whys[whyIndex];
          if (!why) return;

          const isRootCause = whyIndex === row.whys.length - 1;

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
          return;
        }

        if (cellModal.kind === "correctiveAction") {
          const contributingFactorId = requireContributingFactor(row);
          if (contributingFactorId == null) {
            throw new Error("Contributing factor required");
          }

          if (cellModal.mode === "edit" && cellModal.actionId != null) {
            await updateActionMutation.mutateAsync({
              incidentId,
              correctiveActionId: cellModal.actionId,
              description,
            });
            toast.success("Saved", "Corrective action updated.");
          } else {
            await createActionMutation.mutateAsync({
              incidentId,
              contributingFactorId,
              description,
            });
            toast.success("Action added", `Added action to ${row.category}.`);
          }
        }
      } catch (error) {
        toast.error(
          "Save failed",
          getMutationErrorMessage(error, "Could not save changes."),
        );
        throw error;
      }
    },
    [
      cellModal,
      createActionMutation,
      createFactorMutation,
      createWhysMutation,
      incidentId,
      requireContributingFactor,
      rows,
      updateActionMutation,
      updateFactorMutation,
      updateWhyMutation,
    ],
  );

  const handleConfirmRemove = useCallback(async () => {
    if (!confirmModal) return;

    const row = findRow(rows, confirmModal.rowId);
    if (!row) return;

    try {
      if (confirmModal.kind === "why") {
        const whyIndex = confirmModal.whyIndex;
        if (whyIndex == null) return;

        const why = row.whys[whyIndex];
        if (!why?.id) return;

        await dropWhyMutation.mutateAsync({
          whyId: why.id,
          incidentId,
        });
        toast.success("Removed", `Why ${String(why.num)} removed.`);
      } else {
        const actionIndex = confirmModal.actionIndex;
        if (actionIndex == null) return;

        const action = row.correctiveActions[actionIndex];
        if (!action?.id) return;

        await dropActionMutation.mutateAsync({
          correctiveActionId: action.id,
          incidentId,
        });
        toast.success("Removed", "Corrective action removed.");
      }

      setConfirmModal(null);
    } catch (error) {
      toast.error(
        "Remove failed",
        getMutationErrorMessage(error, "Could not remove item."),
      );
      throw error;
    }
  }, [confirmModal, dropActionMutation, dropWhyMutation, incidentId, rows]);

  const handlers = useMemo(
    () => ({
      onEditFactor: openEditFactor,
      onEditWhy: openEditWhy,
      onRemoveWhy: openRemoveWhy,
      onAddWhy: openAddWhy,
      onAddAction: openAddAction,
      onEditAction: openEditAction,
      onRemoveAction: openRemoveAction,
    }),
    [
      openAddAction,
      openAddWhy,
      openEditAction,
      openEditFactor,
      openEditWhy,
      openRemoveAction,
      openRemoveWhy,
    ],
  );

  const errorMessage = rcaQuery.isError
    ? getMutationErrorMessage(rcaQuery.error, "Failed to load HRCA data.")
    : null;

  return (
    <>
      <div
        className={["relative flex flex-col gap-4.5", className]
          .filter(Boolean)
          .join(" ")}
      >
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="text-ehs-gray hover:text-ehs-dark-bg text4 inline-flex w-fit items-center gap-1.5 font-semibold transition-colors"
          >
            <Icon icon="mdi:arrow-left" className="size-4" aria-hidden="true" />
            Back to investigation
          </button>
        ) : null}

        <HrcaHeaderCard
          meta={meta}
          categories={totalCategories}
          whySteps={totalWhySteps}
          actions={totalActions}
        />

        <div className="text-ehs-muted-text text4 flex items-start gap-2.75 leading-3.75">
          <Icon
            icon="mdi:information-outline"
            className="text-ehs-gray mt-px size-3.25 shrink-0"
            aria-hidden="true"
          />
          <span>
            This is an interactive worksheet — click any cell to edit, add or
            remove Why steps, and edit corrective actions. The last step in each
            lane is the root cause.
            {isSaving ? " Saving changes…" : ""}
          </span>
        </div>

        {rcaQuery.isLoading ? (
          <div className="text-ehs-muted-text rounded-5 text4 backdrop-blur-2.5 border border-white/90 bg-white/62 px-4 py-10 text-center">
            Loading HRCA worksheet…
          </div>
        ) : errorMessage ? (
          <div className="rounded-5 text4 backdrop-blur-2.5 flex flex-col items-center gap-3 border border-white/90 bg-white/62 px-4 py-10 text-center">
            <p className="text-ehs-red">{errorMessage}</p>
            <button
              type="button"
              onClick={() => {
                void rcaQuery.refetch();
              }}
              className="text-ehs-normal-blue text4 font-semibold hover:underline"
            >
              Retry
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-ehs-muted-text rounded-5 text4 backdrop-blur-2.5 border border-white/90 bg-white/62 px-4 py-10 text-center">
            No HRCA lanes are configured. Seeded RCA categories (ids 1–5) are
            required to render the worksheet.
          </div>
        ) : (
          <HrcaTable rows={rows} handlers={handlers} />
        )}

        <p className="text-ehs-muted-text text4 leading-4.25 font-medium">
          Read each lane left → right: the contributing factor, then ask
          &quot;Why?&quot; until you reach the root cause (ringed). Edits
          persist on this device.
        </p>
      </div>

      {cellModal ? (
        <HrcaCellModal
          key={`${cellModal.rowId}-${cellModal.kind}-${cellModal.mode}-${String(cellModal.stepNum ?? "")}-${String(cellModal.actionId ?? "")}`}
          state={cellModal}
          isSubmitting={isSaving}
          onClose={() => setCellModal(null)}
          onSubmit={handleCellSubmit}
        />
      ) : null}

      {confirmModal ? (
        <HrcaConfirmModal
          state={confirmModal}
          isSubmitting={isSaving}
          onClose={() => setConfirmModal(null)}
          onConfirm={handleConfirmRemove}
        />
      ) : null}
    </>
  );
}
