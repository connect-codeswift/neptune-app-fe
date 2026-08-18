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
              "text4 text-ehs-light-text inline-flex h-[40px] min-w-30 flex-1 items-center justify-center rounded-xl px-5 leading-[19.5px] font-medium transition-colors sm:flex-initial",
              isSubmitting
                ? "bg-ehs-red/50 cursor-not-allowed"
                : "bg-ehs-red hover:bg-ehs-red/90",
            ].join(" ")}
          >
            {isSubmitting ? "Removing…" : "Remove"}
          </button>
        </>
      }
    >
      <Text as="p" className="text4 text-ehs-slate leading-[19.5px]">
        {state.message}
      </Text>
    </IncidentModalShell>
  );
}
