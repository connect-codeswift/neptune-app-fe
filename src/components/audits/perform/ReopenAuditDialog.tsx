"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { useReopenAuditMutation } from "@/hooks/use-audit-mutations";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { getCurrentUser } from "@/lib/current-user";
import { toast } from "@/lib/toast";

export type ReopenAuditDialogProps = Readonly<{
  auditId: string;
  onClose: () => void;
  onReopened: () => void;
}>;

/**
 * Submitting is one-way, so a run submitted by mistake would otherwise be
 * locked for good. The backend records who reopened it and why, which is why
 * this asks for a reason instead of reusing the plain confirm dialog.
 *
 * The caller mounts this only while it is open, so the reason starts empty on
 * every open without an effect resetting it.
 */
export function ReopenAuditDialog(props: ReopenAuditDialogProps) {
  const { auditId, onClose, onReopened } = props;
  const [reason, setReason] = useState("");
  const reopenAudit = useReopenAuditMutation();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  if (globalThis.document === undefined) return null;

  const trimmed = reason.trim();

  const handleConfirm = () => {
    const { userId, siteId } = getCurrentUser();

    reopenAudit.mutate(
      { auditId, payload: { userId, siteId, reason: trimmed } },
      {
        onSuccess: () => {
          toast.success("Audit reopened");
          onReopened();
        },
        onError: (error) => {
          toast.error(
            getMutationErrorMessage(
              error,
              "Could not reopen this audit. Reopening is limited to leads.",
            ),
          );
        },
      },
    );
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reopen-audit-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <div className="bg-ehs-surface rounded-2.5 flex w-full max-w-md flex-col gap-4 p-6 shadow-lg">
        <div className="flex flex-col gap-1">
          <Text
            as="h2"
            id="reopen-audit-title"
            className="text3 text-ehs-darker"
          >
            Reopen this audit?
          </Text>
          <Text as="p" className="text8 text-ehs-gray">
            The answers become editable again. Findings already raised stay as
            they are.
          </Text>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="reopen-audit-reason" className="text8 text-ehs-gray">
            Reason
          </label>
          <textarea
            id="reopen-audit-reason"
            rows={3}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
            }}
            placeholder="Why does this audit need to be reopened?"
            className="text8 text-ehs-darker bg-ehs-surface border-ehs-border-ink/15 rounded-2.5 focus:border-ehs-green w-full resize-y border px-3 py-2 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={reopenAudit.isPending}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={trimmed === ""}
            isLoading={reopenAudit.isPending}
            onClick={handleConfirm}
          >
            Reopen
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
