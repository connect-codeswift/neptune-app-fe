"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { NearMissDetailView } from "@/components/near-miss/detail/NearMissDetailView";
import { ReportNearMissHeader } from "@/components/near-miss/report/ReportNearMissHeader";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useNearMissDetailQuery } from "@/hooks/use-near-miss-queries";
import { useUserDropdownQuery } from "@/hooks/use-user-queries";
import { canConvertNearMissToIncident } from "@/lib/current-user";
import { mapNearMissDtoToRecord } from "@/lib/map-near-miss";
import { toUserNameLookup, userNameFor } from "@/lib/map-user";

export type NearMissDetailContentProps = Readonly<{
  nearMissId: string;
}>;

export function NearMissDetailContent(
  props: Readonly<NearMissDetailContentProps>,
) {
  const { nearMissId } = props;
  const router = useRouter();
  const detailQuery = useNearMissDetailQuery(nearMissId);
  const dto = detailQuery.data?.dataModel ?? null;

  // The record carries a userId, not a reporter name — resolve it for display.
  const userDropdownQuery = useUserDropdownQuery();
  const userNames = toUserNameLookup(userDropdownQuery.data?.dataModel ?? []);

  const mapped = dto ? mapNearMissDtoToRecord(dto) : null;
  const record = mapped
    ? { ...mapped, reporter: userNameFor(userNames, mapped.reporterId ?? "") }
    : null;

  // Resolve the role after mount: the token lives in localStorage, so reading
  // it during render would mismatch the server-rendered HTML.
  const [canConvert, setCanConvert] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time role read from localStorage token
    setCanConvert(canConvertNearMissToIncident());
  }, []);

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <DashboardHeader
        searchPlaceholder="Search incidents, actions, docs..."
        searchonleft={true}
        dateRangeLabel="March 25 — April 24, 2026"
        hasUnreadNotifications
      />
      <div className="mx-auto flex w-full flex-col gap-5 px-4 pb-8">
        <ReportNearMissHeader
          action={
            canConvert ? (
              <Button
                type="button"
                variant="danger"
                onClick={() =>
                  router.push(
                    `/dashboard/near-miss/${encodeURIComponent(nearMissId)}/convert`,
                  )
                }
                className="gap-2 rounded-[10px] px-4 py-2.5"
              >
                <Icon
                  icon="mdi:plus"
                  className="size-4 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-sm font-bold whitespace-nowrap">
                  Convert to Incident
                </span>
              </Button>
            ) : null
          }
        />

        {detailQuery.isPending && (
          <Text as="p" className="text-ehs-muted-text text-sm">
            Loading near miss...
          </Text>
        )}

        {detailQuery.isError && (
          <Text as="p" className="text-ehs-red text-sm">
            {getMutationErrorMessage(
              detailQuery.error,
              "Could not load this near miss.",
            )}
          </Text>
        )}

        {/* Request succeeded but the record isn't there. */}
        {!detailQuery.isPending && !detailQuery.isError && !record && (
          <Text as="p" className="text-ehs-muted-text text-sm">
            {`No near miss found for id ${nearMissId}.`}
          </Text>
        )}

        {record && <NearMissDetailView record={record} />}
      </div>
    </div>
  );
}
