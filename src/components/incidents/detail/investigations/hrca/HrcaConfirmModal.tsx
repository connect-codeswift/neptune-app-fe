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
      maxWidthClassName="max-w-120"
      footerHint="This cannot be undone."
      footerActions={
        <>
          <IncidentModalCancelButton onClick={onClose} label="Keep" />
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              // onConfirm toasts its own failure and re-throws to keep this
              // modal open; swallow it so it isn't an unhandled rejection.
              // Promise.resolve because the prop may be sync or async.
              void Promise.resolve(onConfirm()).catch(() => undefined);
            }}
            className={[
              "inline-flex h-[39.5px] min-w-30 flex-1 items-center justify-center rounded-xl px-5 text4 leading-[19.5px] font-medium text-ehs-light-text transition-colors sm:flex-initial",
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
      <Text as="p" className="text4 leading-[19.5px] text-ehs-slate">
        {state.message}
      </Text>
    </IncidentModalShell>
  );
}
