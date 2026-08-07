"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Text } from "@/components/Text";
import { FormBuilder, type FormValues } from "@/components/form-builder";
import { IncidentGlassCard } from "@/components/incidents";
import { SkeletonFormPage } from "@/components/ui/skeletons";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useNearMissDetailQuery } from "@/hooks/use-near-miss-queries";
import { canConvertNearMissToIncident } from "@/lib/current-user";
import {
  formatNearMissDisplayId,
  mapNearMissDtoToRecord,
} from "@/lib/map-near-miss";
import { toast } from "@/lib/toast";
import type { NearMissRecord } from "@/app/dashboard/near-miss/near-miss-data";
import {
  convertToIncidentSchema,
  type ConvertToIncidentValues,
} from "./convert-incident-schema";

const crumbClass =
  "text-ehs-muted-text hover:text-ehs-gray text-xs font-medium transition-colors";

export type ConvertToIncidentContentProps = Readonly<{
  nearMissId: string;
}>;

function PrePopulatedPanel(props: Readonly<{ record: NearMissRecord }>) {
  const { record } = props;

  const entries: readonly (readonly [string, string])[] = [
    ["Date", record.dateOfEvent],
    ["Location", record.location],
    ["Reporter", record.reporter],
  ];

  return (
    <div className="rounded-2xl bg-[rgba(238,241,246,0.7)] p-4">
      <Text as="p" className="text-ehs-dark-bg font-medium">
        Pre-populated from Near-Miss:
      </Text>
      <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {entries.map(([label, value]) => (
          <div key={label} className="flex min-w-0 items-center gap-1">
            <dt className="text-ehs-dark-bg text-sm">{`${label}:`}</dt>
            <dd className="text-ehs-dark-bg min-w-0 truncate text-sm">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ConvertToIncidentContent(
  props: Readonly<ConvertToIncidentContentProps>,
) {
  const { nearMissId } = props;
  const router = useRouter();
  const detailQuery = useNearMissDetailQuery(nearMissId);

  const dto = detailQuery.data?.dataModel ?? null;
  const record = dto ? mapNearMissDtoToRecord(dto) : null;

  const detailRoute = `/dashboard/near-miss/${encodeURIComponent(nearMissId)}`;

  // Role guard. `null` = still resolving from the localStorage token; once
  // known, an unauthorized user is redirected back to the detail page. This
  // mirrors the button visibility check so the route can't be reached directly.
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  useEffect(() => {
    const allowed = canConvertNearMissToIncident();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time role read from localStorage token
    setIsAllowed(allowed);
    if (!allowed) {
      router.replace(detailRoute);
    }
  }, [router, detailRoute]);

  if (isAllowed !== true) {
    // Render nothing while resolving or before the redirect lands.
    return null;
  }

  const handleSubmit = (values: FormValues) => {
    const conversion = values as ConvertToIncidentValues;

    // There is no near-miss -> incident endpoint yet; POST /Incident/incident
    // needs a field mapping that hasn't been decided.
    console.log("Convert to incident:", { nearMissId, ...conversion });
    toast.error("Conversion isn't connected to the backend yet.");
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader />

      <div className="mx-auto flex w-full flex-col gap-5 px-4 pb-8">
        {/* Page header */}
        <div className="relative flex flex-col justify-center gap-1.5 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white/62 px-6 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
          <nav
            aria-label="Breadcrumb"
            className="relative z-1 flex flex-wrap items-center gap-1"
          >
            <span className="text-ehs-dark-bg text-xs font-medium">Safety</span>
            <Icon
              icon="mdi:chevron-right"
              className="text-ehs-muted-text size-4"
              aria-hidden="true"
            />
            <Link href="/dashboard/near-miss" className={crumbClass}>
              Near-Miss
            </Link>
            <Icon
              icon="mdi:chevron-right"
              className="text-ehs-muted-text size-4"
              aria-hidden="true"
            />
            <Link href={detailRoute} className={crumbClass}>
              {formatNearMissDisplayId(nearMissId)}
            </Link>
            <Icon
              icon="mdi:chevron-right"
              className="text-ehs-muted-text size-4"
              aria-hidden="true"
            />
            <span className="text-ehs-dark-bg text-xs font-medium">
              Convert
            </span>
          </nav>

          <Text
            as="h1"
            className="text-ehs-dark-bg relative z-1 text-[22px] font-semibold tracking-[-0.2px]"
          >
            Convert to Full Incident
          </Text>

          <Text as="p" className="text-ehs-dark-bg relative z-1 text-sm">
            {record?.title ?? ""}
          </Text>
        </div>

        {detailQuery.isPending && (
          <SkeletonFormPage fields={8} />
        )}

        {detailQuery.isError && (
          <Text as="p" className="text-ehs-red text-sm">
            {getMutationErrorMessage(
              detailQuery.error,
              "Could not load this near miss.",
            )}
          </Text>
        )}

        {!detailQuery.isPending && !detailQuery.isError && !record && (
          <Text as="p" className="text-ehs-muted-text text-sm">
            {`No near miss found for id ${nearMissId}.`}
          </Text>
        )}

        {record && (
          <IncidentGlassCard
            paddingClassName="p-6"
            incidentGlassCardClassName="mx-auto w-full max-w-3xl gap-5"
            className="mx-auto w-full max-w-3xl gap-5"
          >
            <Text as="h3" className="text-ehs-dark-bg text-lg font-semibold">
              Additional Information Required
            </Text>

            <FormBuilder
              schema={convertToIncidentSchema}
              submitLabel="Convert & Create Incident"
              cancelLabel="Cancel"
              submitVariant="danger"
              beforeActions={<PrePopulatedPanel record={record} />}
              onSubmit={handleSubmit}
              onCancel={() => router.push(detailRoute)}
            />
          </IncidentGlassCard>
        )}
      </div>
    </div>
  );
}
