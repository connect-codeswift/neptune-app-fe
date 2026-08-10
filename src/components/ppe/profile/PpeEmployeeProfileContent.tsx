"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import { Table } from "@/components/ui/Table";
import type {
  PpeActiveItem,
  PpeEmployeeProfile,
  PpeHistoryRecord,
} from "@/app/dashboard/ppe-management/ppe-data";
import { toast } from "@/lib/toast";
import { PpeEmployeeProfileHeader } from "./PpeEmployeeProfileHeader";
import { ppeHistoryColumns } from "./PpeHistoryColumns";

const PPE_ROUTE = "/dashboard/ppe-management";
const ISSUE_ROUTE = "/dashboard/ppe-management/issue";
const REPLACEMENT_ROUTE = "/dashboard/ppe-management/replacement";

function ActivePpeRow(props: Readonly<{ item: PpeActiveItem }>) {
  const { item } = props;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(15,23,42,0.08)] px-[18px] py-3.5 last:border-b-0">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Text as="p" className="text-ehs-darker text-base font-semibold">
          {item.name}
        </Text>
        <Text as="p" className="text-ehs-muted-text text-base">
          {item.summary}
        </Text>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <IncidentBadge
          label={item.status}
          tone="muted"
          className="rounded-full px-2.5 py-0.5 text-sm! font-semibold"
        />
        {item.canInspect ? (
          <button
            type="button"
            className="cursor-pointer rounded-lg bg-[rgba(11,19,32,0.14)] px-2.5 py-1 text-sm font-semibold text-[#566072] transition-colors hover:bg-[rgba(11,19,32,0.2)]"
            onClick={(event) => {
              event.stopPropagation();
              toast.success(`Inspection started for ${item.name}`);
            }}
          >
            Inspect
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ActivePpeMobileCard(props: Readonly<{ item: PpeActiveItem }>) {
  const { item } = props;

  return (
    <div className="border-ehs-border flex flex-col gap-3 rounded-xl border bg-white p-3.5">
      <Text as="p" className="text-ehs-darker text-sm font-bold">
        {item.name}
      </Text>
      <div className="flex flex-col gap-1">
        <Text as="p" className="text-ehs-muted-text text-xs font-medium">
          {item.summary}
        </Text>
      </div>
      <div className="h-px w-full bg-[rgba(11,19,32,0.08)]" />
      <div className="flex flex-wrap gap-2">
        <span className="bg-ehs-normal-blue rounded-md px-2 py-1 text-[11px] font-bold text-white">
          {item.status}
        </span>
        {item.canInspect ? (
          <button
            type="button"
            className="border-ehs-normal-blue text-ehs-normal-blue cursor-pointer rounded-md border px-[7px] py-[3px] text-[11px] font-semibold"
            onClick={() => {
              toast.success(`Inspection started for ${item.name}`);
            }}
          >
            Inspect
          </button>
        ) : null}
      </div>
    </div>
  );
}

function HistoryMobileCard(props: Readonly<{ record: PpeHistoryRecord }>) {
  const { record } = props;

  return (
    <div className="border-ehs-border flex flex-col gap-3 rounded-[10px] border bg-white p-3.5">
      <div className="flex items-center justify-between gap-3">
        <Text
          as="p"
          className="text-ehs-darker min-w-0 flex-1 text-[13px] font-bold"
        >
          {record.item}
        </Text>
        <span className="bg-ehs-normal-blue shrink-0 rounded-md px-2 py-1 text-[11px] font-bold text-white">
          {record.status}
        </span>
      </div>
      <div className="h-px w-full bg-[rgba(11,19,32,0.08)]" />
      <div className="text-ehs-muted-text flex flex-col gap-1 text-xs font-medium">
        <p>{`Qty: ${String(record.quantity)} · Issue Date: ${record.issueDate}`}</p>
        <p>{`Condition: ${record.condition} · Status: ${record.status}`}</p>
      </div>
    </div>
  );
}

export type PpeEmployeeProfileContentProps = Readonly<{
  profile: PpeEmployeeProfile;
  /** Issuance id from the profile route — used for Request Replacement. */
  issueId: string;
}>;

export function PpeEmployeeProfileContent(
  props: Readonly<PpeEmployeeProfileContentProps>,
) {
  const { profile, issueId } = props;
  const router = useRouter();
  const activeCount = profile.activeItems.length;

  const goReplacement = () => {
    const params = new URLSearchParams();
    if (issueId.trim()) {
      params.set("issueId", issueId.trim());
    }
    const query = params.toString();
    router.push(query ? `${REPLACEMENT_ROUTE}?${query}` : REPLACEMENT_ROUTE);
  };

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-3 pb-8 sm:px-4">
      <PpeEmployeeProfileHeader
        name={profile.name}
        role={profile.role}
        department={profile.department}
        onRequestReplacement={goReplacement}
        onIssuePpe={() => {
          router.push(ISSUE_ROUTE);
        }}
      />

      <div className="grid grid-cols-2 gap-3 md:hidden">
        <Button
          type="button"
          variant="tertiary"
          onClick={goReplacement}
          className="w-full rounded-[10px] px-3 py-3 text-[13px] font-bold"
        >
          Request Replacement
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            router.push(ISSUE_ROUTE);
          }}
          className="w-full rounded-[10px] px-3 py-3 text-[13px] font-bold"
        >
          Issue PPE
        </Button>
      </div>

      <div className="flex w-full max-w-182.75 flex-col gap-3.5">
        <IncidentGlassCard paddingClassName="p-4" className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3 md:gap-4">
              <div
                className="bg-ehs-normal-blue md:rounded-3.5 flex size-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white md:size-13 md:bg-[#566072] md:text-lg md:font-extrabold"
                aria-hidden="true"
              >
                {profile.initials}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <Text
                  as="p"
                  className="text-ehs-darker text-base font-normal md:text-lg md:font-extrabold"
                >
                  {profile.name}
                </Text>
                <Text
                  as="p"
                  className="text-ehs-muted-text text-[13px] font-medium md:text-base"
                >
                  {`${profile.role}`}
                </Text>
                <Text
                  as="p"
                  className="text-ehs-muted-text text-xs font-semibold md:text-sm md:font-normal md:text-[#b3bbc8]"
                >
                  {`ID: ${profile.employeeCode}`}
                </Text>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1 md:gap-1.5">
              <span className="text-ehs-muted-text text-[10px] font-bold md:text-base md:font-normal">
                Active Items
              </span>
              <span className="text-ehs-darker text-[28px] font-extrabold tabular-nums md:text-2xl md:tracking-[-0.78px] md:text-[#566072]">
                {String(activeCount)}
              </span>
            </div>
          </div>
        </IncidentGlassCard>

        {/* Mobile — active PPE cards */}
        <div className="flex flex-col gap-2.5 md:hidden">
          <p className="text-ehs-muted-text text-xs font-bold uppercase">
            {`Active PPE (${String(activeCount)})`}
          </p>
          {activeCount === 0 ? (
            <p className="text-ehs-muted-text text-sm">
              No active PPE for this employee.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {profile.activeItems.map((item) => (
                <li key={item.id}>
                  <ActivePpeMobileCard item={item} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Desktop — active PPE list card */}
        <IncidentGlassCard
          paddingClassName="overflow-hidden p-0"
          className="hidden min-w-0 md:block"
        >
          <div className="border-b border-[rgba(15,23,42,0.08)] px-4.5 py-3.5">
            <Text as="h3" className="text-ehs-darker text-base font-bold">
              {`Active PPE (${String(activeCount)})`}
            </Text>
          </div>
          {activeCount === 0 ? (
            <p className="text-ehs-muted-text px-4.5 py-8 text-center text-sm">
              No active PPE for this employee.
            </p>
          ) : (
            <div>
              {profile.activeItems.map((item) => (
                <ActivePpeRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </IncidentGlassCard>

        {/* Mobile — history cards */}
        <div className="flex flex-col gap-2.5 md:hidden">
          <p className="text-ehs-muted-text text-xs font-bold uppercase">
            Full Issuance History
          </p>
          {profile.history.length === 0 ? (
            <p className="text-ehs-muted-text text-sm">No history yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {profile.history.map((record) => (
                <li key={record.id}>
                  <HistoryMobileCard record={record} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Desktop — history table */}
        <div className="hidden min-w-0 overflow-x-auto md:block">
          <Table
            data={profile.history}
            columns={ppeHistoryColumns}
            getRowId={(row) => row.id}
            containerClassName="min-w-0"
            header={
              <Text as="h3" className="text-ehs-darker text-base font-bold">
                Full Issuance History
              </Text>
            }
          />
        </div>
      </div>
    </div>
  );
}

export type PpeEmployeeProfileNotFoundProps = Readonly<{
  employeeId: string;
}>;

export function PpeEmployeeProfileNotFound(
  props: Readonly<PpeEmployeeProfileNotFoundProps>,
) {
  const { employeeId } = props;

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      <PpeEmployeeProfileHeader name="Not found" role="—" department="—" />
      <IncidentGlassCard
        paddingClassName="p-6"
        className="mx-auto w-full max-w-[731px]"
      >
        <Text as="p" className="text-ehs-darker text-sm font-semibold">
          Employee profile not found
        </Text>
        <Text as="p" className="text-ehs-muted-text mt-1 text-sm">
          {`No PPE profile matches “${employeeId}”.`}
        </Text>
        <Link
          href={PPE_ROUTE}
          className="text-ehs-normal-blue mt-4 inline-flex text-sm font-semibold"
        >
          Back to PPE Management
        </Link>
      </IncidentGlassCard>
    </div>
  );
}
