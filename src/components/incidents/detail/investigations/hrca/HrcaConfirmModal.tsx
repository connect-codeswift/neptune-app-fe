"use client";

import { Text } from "@/components/Text";
import {
  IncidentModalCancelButton,
  IncidentModalShell,
} from "@/components/incidents/shared/capa/IncidentModalShell";
import type { HrcaConfirmModalState } from "@/components/incidents/detail/investigations/hrca/hrca-modal-types";

export type HrcaConfirmModalProps = Readonly<{
  state: HrcaConfirmModalState;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}>;

export function HrcaConfirmModal(props: Readonly<HrcaConfirmModalProps>) {
  const { state, isSubmitting = false, onClose, onConfirm } = props;

  return (
    <IncidentModalShell
      title={state.title}
      subtitle={state.category}
      onClose={onClose}
      maxWidthClassName="max-w-[480px]"
      footerHint="This cannot be undone."
      footerActions={
        <>
          <IncidentModalCancelButton onClick={onClose} label="Keep" />
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              void onConfirm();
            }}
            className={[
              "inline-flex h-[39.5px] min-w-[120px] flex-1 items-center justify-center rounded-xl px-5 text-sm leading-[19.5px] font-medium text-ehs-light-text transition-colors sm:flex-initial",
              isSubmitting
                ? "cursor-not-allowed bg-ehs-red/50"
                : "bg-ehs-red hover:bg-ehs-red/90",
            ].join(" ")}
          >
            {isSubmitting ? "Removing…" : "Remove"}
          </button>
        </>
      }
    >
      <Text as="p" className="text-sm leading-[19.5px] text-ehs-slate">
        {state.message}
      </Text>
    </IncidentModalShell>
  );
}
