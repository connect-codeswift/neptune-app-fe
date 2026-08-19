"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Button } from "@/components/ui/Button";
import { CompliancePill } from "@/components/regulatory-compliance/compliance-ui";
import type {
  WalkTalkSession,
  WalkTalkSessionDetail,
} from "@/app/dashboard/walk-talk/walk-talk-data";

const SESSION_ROUTE = "/dashboard/walk-talk/session";

export type WalkTalkDetailPanelProps = Readonly<{
  /** List-row fields always available while the panel is open. */
  session: WalkTalkSession | null;
  /** Mapped GET /api/walkandtalk/{id} payload when loaded. */
  detail?: WalkTalkSessionDetail | null;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  className?: string;
}>;

function MetaField(props: Readonly<{ label: string; value: string }>) {
  const { label, value } = props;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Text as="p" className="text9 text-ehs-muted-text">
        {label}
      </Text>
      <Text as="p" className="text4 text-ehs-darker">
        {value}
      </Text>
    </div>
  );
}

export function WalkTalkDetailPanel(props: Readonly<WalkTalkDetailPanelProps>) {
  const {
    session,
    detail = null,
    isLoading = false,
    errorMessage = null,
    onRetry,
    className = "",
  } = props;

  if (!session) {
    return (
      <IncidentGlassCard
        paddingClassName="p-4.5"
        className={["min-h-60 min-w-0", className].filter(Boolean).join(" ")}
        incidentGlassCardClassName="items-center justify-center"
      >
        <Text as="p" className="text4 text-ehs-muted-text">
          Select a session to view details.
        </Text>
      </IncidentGlassCard>
    );
  }

  if (isLoading && !detail) {
    return (
      <IncidentGlassCard
        paddingClassName="p-4.5"
        className={["min-h-60 min-w-0", className].filter(Boolean).join(" ")}
        incidentGlassCardClassName="items-center justify-center gap-2"
      >
        <Icon
          icon="mdi:loading"
          className="text-ehs-normal-blue size-7 animate-spin"
          aria-hidden="true"
        />
        <Text as="p" className="text4 text-ehs-muted-text">
          Loading session details…
        </Text>
      </IncidentGlassCard>
    );
  }

  if (errorMessage && !detail) {
    return (
      <IncidentGlassCard
        paddingClassName="p-4.5"
        className={["min-h-60 min-w-0", className].filter(Boolean).join(" ")}
        incidentGlassCardClassName="items-center justify-center gap-2"
      >
        <Icon
          icon="mdi:alert-circle-outline"
          className="text-ehs-red size-8"
          aria-hidden="true"
        />
        <Text as="p" className="text4 text-ehs-darker">
          Could not load details
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text text-center">
          {errorMessage}
        </Text>
        {onRetry ? (
          <Button
            type="button"
            variant="secondary"
            onClick={onRetry}
            className="mt-1"
          >
            Retry
          </Button>
        ) : null}
      </IncidentGlassCard>
    );
  }

  const observer = detail?.observer ?? session.observer;
  const site = detail?.site ?? session.site;
  const focusArea = detail?.topic ?? session.focusArea;
  const when = detail
    ? [detail.date, detail.time].filter(Boolean).join(" · ")
    : session.when;
  const location = detail?.location ?? session.site;
  const notes = detail?.notes ?? null;
  const followUpCount = detail?.followUps.length ?? 0;
  const participantCount = detail?.participants.length ?? 0;

  return (
    <IncidentGlassCard
      paddingClassName="p-0 overflow-hidden"
      className={["flex min-w-0 flex-col", className].filter(Boolean).join(" ")}
    >
      <div className="border-ehs-border border-b px-5 pt-4.5 pb-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <Text as="span" className="text7 text-ehs-muted-text">
            {session.id}
          </Text>

          <Link
            href={`${SESSION_ROUTE}?id=${encodeURIComponent(session.id)}`}
            className="border-ehs-border text-ehs-normal-blue hover:bg-ehs-light-blue/40 text5 bg-ehs-surface inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors"
          >
            Open details
            <Icon
              icon="mdi:arrow-right"
              className="size-3.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <Text as="h2" className="text3 text-ehs-darker">
          {focusArea}
        </Text>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <CompliancePill label={session.type} />
          <Text as="p" className="text8 text-ehs-muted-text">
            {when}
          </Text>
        </div>
      </div>

      <div className="border-ehs-border grid grid-cols-2 gap-x-4 gap-y-4 border-b px-5 py-3.5">
        <MetaField label="Observer" value={observer} />
        <MetaField label="Site" value={site} />
        <MetaField label="Location" value={location} />
        <MetaField
          label="Participants"
          value={
            detail
              ? participantCount === 0
                ? "None listed"
                : `${String(participantCount)} listed`
              : "—"
          }
        />
      </div>

      {notes ? (
        <div className="border-ehs-border border-b px-5 py-3.5">
          <Text as="p" className="text9 text-ehs-muted-text mb-2">
            Notes
          </Text>
          <Text as="p" className="text4 text-ehs-darker line-clamp-4">
            {notes}
          </Text>
        </div>
      ) : null}

      <div className="px-5 py-3.5">
        <Text as="p" className="text9 text-ehs-muted-text mb-1">
          Follow-ups
        </Text>
        <Text as="p" className="text4 text-ehs-darker">
          {detail
            ? followUpCount === 0
              ? "No follow-up actions"
              : `${String(followUpCount)} action${followUpCount === 1 ? "" : "s"}`
            : "—"}
        </Text>
      </div>
    </IncidentGlassCard>
  );
}
