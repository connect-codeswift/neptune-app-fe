"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Text } from "@/components/Text";
import { ReportIncidentView } from "@/components/incidents/report";
import { INCIDENT_LOCATION_OPTIONS } from "@/components/incidents/report/shared/report-locations";
import { formatMmDdYyyy } from "@/components/incidents/report/shared/report-date-time";
import type { ReportIncidentFormState } from "@/components/incidents/report/shared/report-incident-data";
import { SkeletonFormPage } from "@/components/ui/skeletons";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useNearMissDetailQuery } from "@/hooks/use-near-miss-queries";
import { canConvertNearMissToIncident } from "@/lib/current-user";
import {
  formatNearMissDisplayId,
  mapNearMissDtoToRecord,
  toNearMissApiId,
} from "@/lib/map-near-miss";
import type { NearMissRecord } from "@/app/dashboard/near-miss/near-miss-data";

export type ConvertToIncidentContentProps = Readonly<{
  nearMissId: string;
}>;

function eventDateToMmDdYyyy(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (match) {
    return `${match[2]}/${match[3]}/${match[1]}`;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return formatMmDdYyyy(parsed);
}

function toIncidentPrefill(
  record: NearMissRecord,
): Partial<ReportIncidentFormState> {
  const location = record.location.trim();
  const known = INCIDENT_LOCATION_OPTIONS.some(
    (option) => option.value === location || option.label === location,
  );

  return {
    description: record.description,
    incidentDate: eventDateToMmDdYyyy(record.dateOfEvent),
    incidentLocations: location ? [location] : [],
    customIncidentLocations: location && !known ? [location] : [],
  };
}

export function ConvertToIncidentContent(
  props: Readonly<ConvertToIncidentContentProps>,
) {
  const { nearMissId } = props;
  const router = useRouter();
  const apiId = toNearMissApiId(nearMissId);
  const detailQuery = useNearMissDetailQuery(apiId);

  const dto = detailQuery.data?.dataModel ?? null;
  const record = dto ? mapNearMissDtoToRecord(dto) : null;
  const detailRoute = `/dashboard/near-miss/${encodeURIComponent(apiId)}`;

  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  useEffect(() => {
    const allowed = canConvertNearMissToIncident();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time role read from localStorage token
    setIsAllowed(allowed);
    if (!allowed) {
      router.replace(detailRoute);
    }
  }, [router, detailRoute]);

  useEffect(() => {
    if (record?.status === "Closed") {
      router.replace(detailRoute);
    }
  }, [record?.status, router, detailRoute]);

  if (isAllowed !== true) {
    return null;
  }

  if (record?.status === "Closed") {
    return null;
  }

  if (detailQuery.isPending) {
    return (
      <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
        <SkeletonFormPage fields={8} />
      </div>
    );
  }

  if (detailQuery.isError) {
    return (
      <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
        <Text as="p" className="text4 text-ehs-red">
          {getMutationErrorMessage(
            detailQuery.error,
            "Could not load this near miss.",
          )}
        </Text>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
        <Text as="p" className="text4 text-ehs-muted-text">
          {`No near miss found for id ${nearMissId}.`}
        </Text>
      </div>
    );
  }

  const displayId = formatNearMissDisplayId(record.id);

  return (
    <ReportIncidentView
      initialForm={toIncidentPrefill(record)}
      exitHref={detailRoute}
      backHref={detailRoute}
      backLabel={displayId}
      headerTitle={`Convert ${displayId} to an incident`}
    />
  );
}
