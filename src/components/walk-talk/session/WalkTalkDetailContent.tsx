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

/** Desktop: label above value. */
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

/** Mobile: label left / value right — matches Figma 6415:35096. */
function InfoRow(
  props: Readonly<{
    label: string;
    value: string;
    showDivider?: boolean;
  }>,
) {
  const { label, value, showDivider = true } = props;

  return (
    <div
      className={[
        "flex items-center justify-between gap-3 py-2",
        showDivider ? "border-ehs-border border-b" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="w-30 shrink-0 text-[13px] font-medium text-[#566072]">
        {label}
      </span>
      <span className="text-ehs-dark-bg min-w-0 truncate text-right text-[13px] font-semibold">
        {value}
      </span>
    </div>
  );
}

function SectionTitle(props: Readonly<{ children: React.ReactNode }>) {
  const { children } = props;
  return (
    <h2 className="text-ehs-dark-bg text-base font-bold tracking-[-0.14px] md:text-lg">
      {children}
    </h2>
  );
}

function ParticipantRow(
  props: Readonly<{
    participant: WalkTalkParticipant;
    showDivider?: boolean;
  }>,
) {
  const { participant, showDivider = false } = props;

  return (
    <li
      className={[
        "flex items-center gap-3 py-2 md:py-0",
        showDivider ? "border-ehs-border border-b md:border-b-0" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className="bg-ehs-normal-blue/14 text-ehs-dark-blue flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold md:size-9 md:text-sm"
        aria-hidden="true"
      >
        {initialsOf(participant.name)}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-ehs-dark-bg text-[13px] font-bold md:text-base">
          {participant.name}
        </span>
        <span className="text-ehs-muted-text text-[11px] md:text-base">
          {participant.role}
        </span>
      </div>
    </li>
  );
}

const statusClass: Record<WalkTalkActionStatus, string> = {
  Open: "bg-[rgba(8,145,166,0.1)] text-[#0891a6]",
  Closed: "bg-ehs-green/14 text-ehs-green",
  "In Progress": "bg-[rgba(86,96,114,0.14)] text-[#566072]",
};

function StatusBadge(props: Readonly<{ status: WalkTalkActionStatus }>) {
  const { status } = props;
  const showChevron = status === "In Progress";
  const label =
    status === "Closed" ? "Done" : status === "In Progress" ? "State" : status;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase md:rounded-full md:px-2.5 md:py-1 md:text-sm",
        statusClass[status],
      ].join(" ")}
    >
      {label}
      {showChevron ? (
        <Icon
          icon="mdi:chevron-down"
          className="size-3.5 shrink-0 md:size-4"
          aria-hidden="true"
        />
      ) : null}
    </span>
  );
}

/** Mobile follow-up cards — matches Figma 6415:35142. */
function FollowUpCards(props: Readonly<{ rows: readonly WalkTalkFollowUp[] }>) {
  const { rows } = props;

  if (rows.length === 0) {
    return (
      <p className="text-ehs-muted-text text-sm">No follow-up actions recorded.</p>
    );
  }

  return (
    <ul className="flex flex-col">
      {rows.map((row, index) => (
        <li
          key={`${row.action}-${row.assignedTo}`}
          className={[
            "flex flex-col gap-2.5 py-2.5",
            index < rows.length - 1 ? "border-ehs-border border-b" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <p className="text-ehs-dark-bg text-[13px] font-semibold">
            {row.action}
          </p>
          <div className="flex items-center justify-between gap-3">
            <div className="text-ehs-muted-text flex min-w-0 items-center gap-2 text-[11px] font-medium">
              <span className="truncate">{row.assignedTo}</span>
              <span
                className="bg-ehs-muted-text size-1 shrink-0 rounded-full"
                aria-hidden="true"
              />
              <span className="text-[#8892a3] shrink-0">{row.dueDate}</span>
            </div>
            <StatusBadge status={row.status} />
          </div>
        </li>
      ))}
    </ul>
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

  const infoFields = [
    { label: "Observer", value: detail.observer },
    { label: "Date", value: detail.date },
    { label: "Time", value: detail.time },
    { label: "Location", value: detail.location },
    { label: "Topic / Focus Area", value: detail.topic },
    { label: "Site", value: detail.site },
  ] as const;

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      {/* Header — compact on mobile */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white px-4 py-3 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] md:px-6 md:py-4">
        <div className="relative z-1 flex min-w-0 flex-col gap-1.5">
          <nav
            aria-label="Breadcrumb"
            className="hidden items-center gap-1 overflow-x-auto md:flex"
          >
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

          <div className="flex items-center gap-2 md:block">
            <Link
              href={WALK_TALK_ROUTE}
              aria-label="Back to Walk & Talk"
              className="border-ehs-border text-ehs-dark-bg hover:bg-slate-50 flex size-8 shrink-0 items-center justify-center rounded-[10px] border bg-white transition-colors md:hidden"
            >
              <Icon icon="mdi:chevron-left" className="size-3.5" />
            </Link>
            <Text
              as="h1"
              className="text-ehs-dark-bg text-base font-bold tracking-[-0.2px] md:text-[22px] md:font-semibold"
            >
              <span className="md:hidden">Walk-and-Talk Detail</span>
              <span className="hidden md:inline">Walk-and-Talks</span>
            </Text>
          </div>
        </div>
      </div>

      {/* Stack until lg; participants below on mobile (Figma order). */}
      <div className="grid min-w-0 items-start gap-3.5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3.5">
          <IncidentGlassCard
            paddingClassName="p-4 md:p-5"
            className="min-w-0"
            incidentGlassCardClassName="gap-3"
          >
            <SectionTitle>Session Information</SectionTitle>

            {/* Mobile rows */}
            <div className="flex flex-col md:hidden">
              {infoFields.map((field, index) => (
                <InfoRow
                  key={field.label}
                  label={field.label}
                  value={field.value}
                  showDivider={index < infoFields.length - 1}
                />
              ))}
            </div>

            {/* Desktop grid */}
            <div className="hidden gap-3 sm:gap-x-6 md:grid md:grid-cols-2">
              {infoFields.map((field) => (
                <Field key={field.label} label={field.label}>
                  {field.value}
                </Field>
              ))}
            </div>
          </IncidentGlassCard>

          {/* Participants — mobile order before notes (Figma) */}
          <IncidentGlassCard
            paddingClassName="p-4 md:p-5"
            className="min-w-0 lg:hidden"
            incidentGlassCardClassName="gap-3"
          >
            <SectionTitle>Participants</SectionTitle>
            {detail.participants.length === 0 ? (
              <p className="text-ehs-muted-text text-sm">
                No participants listed.
              </p>
            ) : (
              <ul className="flex flex-col">
                {detail.participants.map((participant, index) => (
                  <ParticipantRow
                    key={participant.name}
                    participant={participant}
                    showDivider={index < detail.participants.length - 1}
                  />
                ))}
              </ul>
            )}
          </IncidentGlassCard>

          <IncidentGlassCard
            paddingClassName="p-4 md:p-5"
            className="min-w-0"
            incidentGlassCardClassName="gap-3"
          >
            <SectionTitle>Discussion Notes</SectionTitle>
            <p className="text-[13px] leading-5 text-[#0b1320] md:text-base md:leading-5.5 md:text-[#566072]">
              {detail.notes}
            </p>
          </IncidentGlassCard>

          <IncidentGlassCard
            paddingClassName="p-4 md:p-0"
            className="min-w-0 overflow-hidden"
            incidentGlassCardClassName="gap-3 md:gap-0"
          >
            <div className="md:px-5 md:pt-5 md:pb-2">
              <SectionTitle>Follow-Up Actions</SectionTitle>
            </div>
            <div className="md:hidden">
              <FollowUpCards rows={detail.followUps} />
            </div>
            <div className="hidden md:block">
              <FollowUpTable rows={detail.followUps} />
            </div>
          </IncidentGlassCard>
        </div>

        {/* Desktop participants rail */}
        <IncidentGlassCard
          paddingClassName="p-5"
          className="hidden min-w-0 lg:block"
          incidentGlassCardClassName="gap-4"
        >
          <SectionTitle>Participants</SectionTitle>
          {detail.participants.length === 0 ? (
            <p className="text-ehs-muted-text text-sm">
              No participants listed.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
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
