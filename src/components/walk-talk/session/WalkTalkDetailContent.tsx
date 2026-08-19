"use client";

import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import type {
  WalkTalkActionStatus,
  WalkTalkFollowUp,
  WalkTalkParticipant,
  WalkTalkSessionDetail,
} from "@/app/dashboard/walk-talk/walk-talk-data";
import { WalkTalkDetailBannerCard } from "./WalkTalkDetailBannerCard";

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function displayValue(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "—";
}

function DetailField(props: Readonly<{ label: string; value: string }>) {
  const { label, value } = props;
  const shown = displayValue(value);
  const isEmpty = shown === "—";

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Text as="span" className="text6 text-ehs-muted-text">
        {label}
      </Text>
      <Text
        as="span"
        className={
          isEmpty ? "text4 text-ehs-muted-text" : "text4 text-ehs-darker"
        }
      >
        {shown}
      </Text>
    </div>
  );
}

function SectionTitle(props: Readonly<{ children: string }>) {
  return (
    <Text as="h3" className="text8 text-ehs-muted-text mb-3 font-semibold">
      {props.children}
    </Text>
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
        "flex items-center gap-3 py-2",
        showDivider ? "border-ehs-border border-b" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className="bg-ehs-normal-blue/14 text-ehs-dark-blue text7 flex size-8 shrink-0 items-center justify-center rounded-full"
        aria-hidden="true"
      >
        {initialsOf(participant.name)}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <Text as="span" className="text4 text-ehs-darker">
          {participant.name}
        </Text>
        <Text as="span" className="text8 text-ehs-muted-text">
          {participant.role}
        </Text>
      </div>
    </li>
  );
}

const statusClass: Record<WalkTalkActionStatus, string> = {
  Open: "bg-ehs-normal-blue/10 text-ehs-normal-blue",
  Closed: "bg-ehs-green/14 text-ehs-green",
  "In Progress": "bg-ehs-gray/14 text-ehs-gray",
};

function StatusBadge(props: Readonly<{ status: WalkTalkActionStatus }>) {
  const { status } = props;
  const label =
    status === "Closed"
      ? "Done"
      : status === "In Progress"
        ? "In Progress"
        : status;

  return (
    <span
      className={[
        "text5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5",
        statusClass[status],
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function FollowUpList(props: Readonly<{ rows: readonly WalkTalkFollowUp[] }>) {
  const { rows } = props;

  if (rows.length === 0) {
    return (
      <div className="bg-ehs-surface-inverse/4 flex items-start gap-2 rounded-xl px-3 py-2.5">
        <Icon
          icon="mdi:check-circle-outline"
          className="text-ehs-muted-text mt-0.5 size-4 shrink-0"
          aria-hidden="true"
        />
        <Text as="p" className="text4 text-ehs-muted-text">
          No follow-up actions recorded.
        </Text>
      </div>
    );
  }

  return (
    <>
      <ul className="flex flex-col sm:hidden">
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
            <Text as="p" className="text4 text-ehs-darker">
              {row.action}
            </Text>
            <div className="flex items-center justify-between gap-3">
              <div className="text8 text-ehs-muted-text flex min-w-0 items-center gap-2">
                <span className="truncate">{row.assignedTo}</span>
                <span
                  className="bg-ehs-muted-text size-1 shrink-0 rounded-full"
                  aria-hidden="true"
                />
                <span className="shrink-0">{row.dueDate}</span>
              </div>
              <StatusBadge status={row.status} />
            </div>
          </li>
        ))}
      </ul>

      <div className="border-ehs-border hidden overflow-hidden rounded-xl border sm:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-ehs-surface-inverse/6">
              {["Action", "Assigned To", "Due Date", "Status"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="text6 text-ehs-muted-text px-4 py-3"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.action}-${row.assignedTo}`}
                className="border-ehs-border border-b last:border-b-0"
              >
                <td className="text4 text-ehs-darker px-4 py-3.5">
                  {row.action}
                </td>
                <td className="text4 text-ehs-gray px-4 py-3.5">
                  {row.assignedTo}
                </td>
                <td className="text4 text-ehs-gray px-4 py-3.5 whitespace-nowrap">
                  {row.dueDate}
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export type WalkTalkDetailContentProps = Readonly<{
  detail: WalkTalkSessionDetail;
}>;

export function WalkTalkDetailContent(props: WalkTalkDetailContentProps) {
  const { detail } = props;

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
      <WalkTalkDetailBannerCard detail={detail} />

      <div className="mx-auto flex w-full max-w-200 justify-center">
        <IncidentGlassCard
          paddingClassName="p-0 overflow-hidden"
          className="backdrop-blur-2.5 bg-ehs-surface/62 w-full"
        >
          <div className="border-ehs-border border-b px-5 py-4 sm:px-6">
            <Text as="h2" className="text3 text-ehs-darker">
              Session Details
            </Text>
          </div>

          <div className="flex flex-col gap-5 px-5 py-5 sm:gap-6 sm:px-6 sm:py-6">
            <section>
              <SectionTitle>Overview</SectionTitle>
              <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
                <DetailField label="Observer" value={detail.observer} />
                <DetailField label="Site" value={detail.site} />
                <DetailField label="Location" value={detail.location} />
                <DetailField label="Topic / Focus Area" value={detail.topic} />
                <DetailField label="Date" value={detail.date} />
                <DetailField label="Time" value={detail.time} />
              </div>
            </section>

            <div className="bg-ehs-surface-inverse/8 h-px w-full" />

            <section>
              <SectionTitle>Discussion Notes</SectionTitle>
              {detail.notes.trim() ? (
                <Text as="p" className="text4 text-ehs-darker">
                  {detail.notes}
                </Text>
              ) : (
                <div className="bg-ehs-surface-inverse/4 flex items-start gap-2 rounded-xl px-3 py-2.5">
                  <Icon
                    icon="mdi:note-outline"
                    className="text-ehs-muted-text mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <Text as="p" className="text4 text-ehs-muted-text">
                    No discussion notes recorded for this session.
                  </Text>
                </div>
              )}
            </section>

            <div className="bg-ehs-surface-inverse/8 h-px w-full" />

            <section>
              <SectionTitle>Participants</SectionTitle>
              {detail.participants.length === 0 ? (
                <div className="bg-ehs-surface-inverse/4 flex items-start gap-2 rounded-xl px-3 py-2.5">
                  <Icon
                    icon="mdi:account-outline"
                    className="text-ehs-muted-text mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <Text as="p" className="text4 text-ehs-muted-text">
                    No participants listed.
                  </Text>
                </div>
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
            </section>

            <div className="bg-ehs-surface-inverse/8 h-px w-full" />

            <section>
              <SectionTitle>Follow-Up Actions</SectionTitle>
              <FollowUpList rows={detail.followUps} />
            </section>
          </div>
        </IncidentGlassCard>
      </div>
    </div>
  );
}
