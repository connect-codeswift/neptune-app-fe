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
    <div className="border-ehs-border-ink/8 flex flex-wrap items-center justify-between gap-3 border-b px-4.5 py-3.5 last:border-b-0">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Text as="p" className="text4 text-ehs-darker">
          {item.name}
        </Text>
        <Text as="p" className="text4 text-ehs-muted-text">
          {item.summary}
        </Text>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <IncidentBadge label={item.status} tone="muted" className="w-fit" />
        {item.canInspect ? (
          <button
            type="button"
            className="text8 text-ehs-gray bg-ehs-surface-inverse/14 hover:bg-ehs-surface-inverse/20 cursor-pointer rounded-lg px-2.5 py-1 transition-colors"
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
    <div className="border-ehs-border bg-ehs-surface flex flex-col gap-3 rounded-xl border p-3.5">
      <Text as="p" className="text4 text-ehs-darker">
        {item.name}
      </Text>
      <Text as="p" className="text8 text-ehs-muted-text">
        {item.summary}
      </Text>
      <div className="bg-ehs-surface-inverse/8 h-px w-full" />
      <div className="flex flex-wrap gap-2">
        <IncidentBadge label={item.status} tone="muted" className="w-fit" />
        {item.canInspect ? (
          <button
            type="button"
            className="border-ehs-normal-blue text-ehs-normal-blue text8 cursor-pointer rounded-md border px-1.75 py-0.75"
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
    <div className="border-ehs-border rounded-2.5 bg-ehs-surface flex flex-col gap-3 border p-3.5">
      <div className="flex items-center justify-between gap-3">
        <Text as="p" className="text4 text-ehs-darker min-w-0 flex-1">
          {record.item}
        </Text>
        <IncidentBadge
          label={record.status}
          tone="muted"
          className="w-fit shrink-0"
        />
      </div>
      <div className="bg-ehs-surface-inverse/8 h-px w-full" />
      <div className="text8 text-ehs-muted-text flex flex-col gap-1">
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
          className="text4 rounded-2.5 w-full px-3 py-3"
        >
          Request Replacement
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            router.push(ISSUE_ROUTE);
          }}
          className="text4 rounded-2.5 w-full px-3 py-3"
        >
          Issue PPE
        </Button>
      </div>

      <div className="flex w-full max-w-182.75 flex-col gap-3.5">
        <IncidentGlassCard paddingClassName="p-4" className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3 md:gap-4">
              <div
                className="bg-ehs-normal-blue text4 md:rounded-3.5 text-ehs-on-accent md:text-ehs-surface-inverse-text md:bg-ehs-gray flex size-12 shrink-0 items-center justify-center rounded-full md:size-13"
                aria-hidden="true"
              >
                {profile.initials}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <Text as="p" className="text3 text-ehs-darker">
                  {profile.name}
                </Text>
                <Text as="p" className="text4 text-ehs-muted-text">
                  {profile.role}
                </Text>
                <Text as="p" className="text8 text-ehs-muted-text">
                  {`ID: ${profile.employeeCode}`}
                </Text>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1 md:gap-1.5">
              <span className="text8 text-ehs-muted-text">Active Items</span>
              <span className="text2 text-ehs-darker tabular-nums">
                {String(activeCount)}
              </span>
            </div>
          </div>
        </IncidentGlassCard>

        {/* Mobile — active PPE cards */}
        <div className="flex flex-col gap-2.5 md:hidden">
          <p className="text6 text-ehs-muted-text">
            {`Active PPE (${String(activeCount)})`}
          </p>
          {activeCount === 0 ? (
            <p className="text4 text-ehs-muted-text">
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
          <div className="border-ehs-border-ink/8 border-b px-4.5 py-3.5">
            <Text as="h3" className="text3 text-ehs-darker">
              {`Active PPE (${String(activeCount)})`}
            </Text>
          </div>
          {activeCount === 0 ? (
            <p className="text4 text-ehs-muted-text px-4.5 py-8 text-center">
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
          <p className="text6 text-ehs-muted-text">Full Issuance History</p>
          {profile.history.length === 0 ? (
            <p className="text4 text-ehs-muted-text">No history yet.</p>
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
            variant="compliance"
            header={
              <Text as="h3" className="text3 text-ehs-darker">
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
        className="mx-auto w-full max-w-182.75"
      >
        <Text as="p" className="text4 text-ehs-darker">
          Employee profile not found
        </Text>
        <Text as="p" className="text4 text-ehs-muted-text mt-1">
          {`No PPE profile matches “${employeeId}”.`}
        </Text>
        <Link
          href={PPE_ROUTE}
          className="text4 text-ehs-normal-blue mt-4 inline-flex"
        >
          Back to PPE Management
        </Link>
      </IncidentGlassCard>
    </div>
  );
}
