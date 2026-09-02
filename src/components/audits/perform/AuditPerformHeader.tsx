"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { TextButton } from "@/components/ui/TextButton";

/** Mirrors the save states the perform page tracks. */
export type AuditSaveState = "idle" | "saving" | "saved" | "error";

const SAVE_LABEL: Record<AuditSaveState, string> = {
  idle: "",
  saving: "Saving…",
  saved: "All answers saved",
  error: "Not saved",
};

const SAVE_ICON: Record<AuditSaveState, string> = {
  idle: "",
  saving: "mdi:loading",
  saved: "mdi:cloud-check-outline",
  error: "mdi:cloud-alert-outline",
};

function SaveIndicator(props: Readonly<{ state: AuditSaveState }>) {
  const { state } = props;
  if (state === "idle") return null;

  return (
    <span
      // Answers save on their own, so the auditor is told without being
      // interrupted; a toast per tap would be unusable on a 24-item checklist.
      aria-live="polite"
      className={[
        "text8 flex items-center gap-1.5",
        state === "error" ? "text-ehs-red" : "text-ehs-gray",
      ].join(" ")}
    >
      <Icon
        icon={SAVE_ICON[state]}
        className={
          state === "saving"
            ? "size-4 shrink-0 animate-spin"
            : "size-4 shrink-0"
        }
        aria-hidden
      />
      {SAVE_LABEL[state]}
    </span>
  );
}

export type AuditPerformHeaderProps = Readonly<{
  auditId: string;
  subtitle: string;
  saveState: AuditSaveState;
  isLocked: boolean;
  onViewFindings: () => void;
  onReopen: () => void;
}>;

export function AuditPerformHeader(props: AuditPerformHeaderProps) {
  const { auditId, subtitle, saveState, isLocked, onViewFindings, onReopen } =
    props;

  return (
    <header className="flex flex-wrap items-start justify-between gap-3 px-1">
      <div className="flex min-w-0 flex-col gap-0.5">
        <Text as="span" className="text8 text-ehs-gray">
          {auditId}
        </Text>
        <Text as="h1" className="text2 text-ehs-darker">
          Perform Audit
        </Text>
        {subtitle ? (
          <Text as="p" className="text4 text-ehs-gray">
            {subtitle}
          </Text>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-4">
        <SaveIndicator state={saveState} />

        {isLocked ? (
          <TextButton type="button" onClick={onReopen}>
            Reopen
          </TextButton>
        ) : null}

        <TextButton type="button" onClick={onViewFindings}>
          View findings
        </TextButton>
      </div>
    </header>
  );
}
