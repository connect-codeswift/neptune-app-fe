"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents";
import type {
  WalkTalkActionStatus,
  WalkTalkFollowUp,
  WalkTalkParticipant,
  WalkTalkSessionDetail,
} from "@/app/dashboard/walk-talk/walk-talk-data";

const WALK_TALK_ROUTE = "/dashboard/walk-talk";

const crumbClass =
  "text-ehs-muted-text hover:text-ehs-gray text-sm font-medium transition-colors";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="text-ehs-muted-text size-4"
      aria-hidden="true"
    />
  );
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Uppercase micro-label above its value. */
function Field(props: Readonly<{ label: string; children: React.ReactNode }>) {
  const { label, children } = props;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-sm font-semibold tracking-[0.24px] text-[#566072] uppercase">
        {label}
      </span>
      <div className="text-ehs-dark-bg font-medium">{children}</div>
    </div>
  );
}

function SectionTitle(props: Readonly<{ children: React.ReactNode }>) {
  const { children } = props;
  return (
    <h2 className="text-ehs-dark-bg text-lg font-bold tracking-[-0.14px]">
      {children}
    </h2>
  );
}

function ParticipantRow(props: Readonly<{ participant: WalkTalkParticipant }>) {
  const { participant } = props;

  return (
    <li className="flex items-center gap-3">
      <span
        className="bg-ehs-normal-blue/14 text-ehs-dark-blue flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
        aria-hidden="true"
      >
        {initialsOf(participant.name)}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-ehs-dark-bg text-base font-bold">
          {participant.name}
        </span>
        <span className="text-ehs-muted-text text-base">
          {participant.role}
        </span>
      </div>
    </li>
  );
}

const statusClass: Record<WalkTalkActionStatus, string> = {
  Open: "bg-[rgba(217,119,6,0.14)] text-[#d97706]",
  Closed: "bg-ehs-green/14 text-ehs-green",
  "In Progress": "bg-[rgba(86,96,114,0.14)] text-[#566072]",
};

function StatusBadge(props: Readonly<{ status: WalkTalkActionStatus }>) {
  const { status } = props;
  const showChevron = status === "In Progress";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-bold uppercase",
        statusClass[status],
      ].join(" ")}
    >
      {status === "In Progress" ? "State" : status}
      {showChevron ? (
        <Icon
          icon="mdi:chevron-down"
          className="size-4 shrink-0"
          aria-hidden="true"
        />
      ) : null}
    </span>
  );
}

function FollowUpTable(props: Readonly<{ rows: readonly WalkTalkFollowUp[] }>) {
  const { rows } = props;

  if (rows.length === 0) {
    return (
      <p className="text-ehs-muted-text px-5 pb-5 text-sm">
        No follow-up actions recorded.
      </p>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-160 border-collapse text-left">
        <thead>
          <tr className="bg-[rgba(11,19,32,0.06)]">
            {["Action", "Assigned To", "Due Date", "Status"].map((heading) => (
              <th
                key={heading}
                className="px-5 py-3 text-sm font-bold tracking-[0.8px] text-[#8892a3] uppercase"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.action}-${row.assignedTo}`}
              className="border-ehs-border border-b last:border-b-0"
            >
              <td className="text-ehs-dark-bg px-5 py-4 text-base">
                {row.action}
              </td>
              <td className="w-50 px-5 py-4 text-base text-[#566072]">
                {row.assignedTo}
              </td>
              <td className="w-35 px-5 py-4 text-base text-[#566072]">
                {row.dueDate}
              </td>
              <td className="w-25 px-5 py-4">
                <StatusBadge status={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type WalkTalkDetailContentProps = Readonly<{
  detail: WalkTalkSessionDetail;
}>;

export function WalkTalkDetailContent(props: WalkTalkDetailContentProps) {
  const { detail } = props;

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      {/* Header */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white px-6 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
        <div className="relative z-1 flex min-w-0 flex-col gap-1.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1">
            <span className="text-ehs-muted-text text-sm font-medium">
              Safety
            </span>
            <Chevron />
            <Link href={WALK_TALK_ROUTE} className={crumbClass}>
              Pro-Active Safety
            </Link>
            <Chevron />
            <span className="text-ehs-muted-text text-sm font-medium">
              Walk-and-Talks
            </span>
          </nav>

          <Text
            as="h1"
            className="text-ehs-dark-bg text-[22px] font-semibold tracking-[-0.2px]"
          >
            Walk-and-Talks
          </Text>
        </div>
      </div>

      {/* Session info + notes + follow-ups, with participants rail. */}
      <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3.5">
          <IncidentGlassCard
            paddingClassName="p-5"
            className="min-w-0"
            incidentGlassCardClassName="gap-1.5"
          >
            <SectionTitle>Session Information</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-x-6">
              <Field label="Observer">{detail.observer}</Field>
              <Field label="Date">{detail.date}</Field>
              <Field label="Time">{detail.time}</Field>
              <Field label="Location">{detail.location}</Field>
              <Field label="Topic / Focus Area">{detail.topic}</Field>
              <Field label="Site">{detail.site}</Field>
            </div>
          </IncidentGlassCard>

          <IncidentGlassCard
            paddingClassName="p-5"
            className="min-w-0"
            incidentGlassCardClassName="gap-1.5"
          >
            <SectionTitle>Discussion Notes</SectionTitle>
            <p className="text-base leading-5.5 text-[#566072]">
              {detail.notes}
            </p>
          </IncidentGlassCard>

          <IncidentGlassCard
            paddingClassName="p-0"
            className="min-w-0 overflow-hidden"
            incidentGlassCardClassName="gap-0"
          >
            <div className="px-5 pt-5 pb-2">
              <SectionTitle>Follow-Up Actions</SectionTitle>
            </div>
            <FollowUpTable rows={detail.followUps} />
          </IncidentGlassCard>
        </div>

        <IncidentGlassCard
          paddingClassName="p-5"
          className="min-w-0"
          incidentGlassCardClassName="gap-4"
        >
          <SectionTitle>Participants</SectionTitle>
          {detail.participants.length === 0 ? (
            <p className="text-ehs-muted-text text-sm">
              No participants listed.
            </p>
          ) : (
            <ul className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-12 xl:gap-4">
              {detail.participants.map((participant) => (
                <ParticipantRow
                  key={participant.name}
                  participant={participant}
                />
              ))}
            </ul>
          )}
        </IncidentGlassCard>
      </div>
    </div>
  );
}
