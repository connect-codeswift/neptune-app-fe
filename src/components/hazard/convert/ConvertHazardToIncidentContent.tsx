"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Text } from "@/components/Text";
import { SkeletonFormPage } from "@/components/ui/skeletons";
import { ReportIncidentView } from "@/components/incidents/report";
import type { ReportIncidentFormState } from "@/forms/incident-module/index";
import { INCIDENT_LOCATION_OPTIONS } from "@/forms/incident-module/locations";
import { useHazardDetailQuery } from "@/hooks/use-hazard-queries";
import { useConvertHazardToIncidentMutation } from "@/hooks/use-hazard-mutations";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { canConvertHazardToIncident } from "@/lib/current-user";
import {
  formatHazardDisplayId,
  mapHazardDtoToRecord,
  toHazardApiId,
} from "@/lib/map-hazard";
import type { HazardRecord } from "@/app/dashboard/hazard/hazard-data";
import { getCurrentUser } from "@/lib/current-user";

const HAZARD_LIST_ROUTE = "/dashboard/hazard";

export type ConvertHazardToIncidentContentProps = Readonly<{
  hazardId: string;
}>;

/**
 * Carries what the hazard already knows into the incident form, so the reporter is not asked
 * twice. A location typed before the site register existed is not in the incident picker
 * either, so it rides along as a custom entry rather than being dropped.
 */
function toIncidentPrefill(
  record: HazardRecord,
): Partial<ReportIncidentFormState> {
  const location = record.location.trim();
  const known = INCIDENT_LOCATION_OPTIONS.some(
    (option) => option.value === location || option.label === location,
  );

  return {
    description: record.description,
    incidentLocations: location ? [location] : [],
    customIncidentLocations: location && !known ? [location] : [],
  };
}

/**
 * Escalating a hazard into an incident.
 *
 * The incident is created by the report wizard first and this writes the back-link afterwards,
 * which is the same order near miss uses: the link is what the "Converted to incidents" tile
 * counts, and writing it before the incident exists would leave a hazard pointing at nothing.
 */
export function ConvertHazardToIncidentContent(
  props: ConvertHazardToIncidentContentProps,
) {
  const { hazardId } = props;
  const router = useRouter();
  const apiId = toHazardApiId(hazardId);
  const { userId, siteId } = getCurrentUser();
  const detailQuery = useHazardDetailQuery(apiId, { siteId, userId });
  const convertMutation = useConvertHazardToIncidentMutation();

  const dto = detailQuery.data?.dataModel ?? null;
  const record = dto ? mapHazardDtoToRecord(dto) : null;
  const detailRoute = `${HAZARD_LIST_ROUTE}/${encodeURIComponent(apiId)}`;

  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  useEffect(() => {
    const allowed = canConvertHazardToIncident();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time role read from localStorage token
    setIsAllowed(allowed);
    if (!allowed) {
      router.replace(detailRoute);
    }
  }, [router, detailRoute]);

  // A closed hazard is history, and one already escalated has its incident. Both are refused by
  // the API too - this only saves the reporter filling in a form that cannot be saved.
  const isBlocked =
    record?.status === "Closed" || (record?.incidentId ?? null) !== null;

  useEffect(() => {
    if (isBlocked) {
      router.replace(detailRoute);
    }
  }, [isBlocked, router, detailRoute]);

  if (isAllowed !== true || isBlocked) {
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
            "Could not load this hazard.",
          )}
        </Text>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
        <Text as="p" className="text4 text-ehs-muted-text">
          {`No hazard found for id ${hazardId}.`}
        </Text>
      </div>
    );
  }

  const displayId = formatHazardDisplayId(record.id);

  return (
    <ReportIncidentView
      initialForm={toIncidentPrefill(record)}
      exitHref={detailRoute}
      backHref={detailRoute}
      backLabel={displayId}
      headerTitle={`Convert ${displayId} to an incident`}
      onAfterCreateIncident={async (incidentId) => {
        await convertMutation.mutateAsync({ hazardId: apiId, incidentId });
      }}
    />
  );
}
