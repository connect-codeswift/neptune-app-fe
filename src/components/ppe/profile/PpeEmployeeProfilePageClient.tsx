"use client";

import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import {
  PpeEmployeeProfileContent,
  PpeEmployeeProfileNotFound,
} from "@/components/ppe/profile/PpeEmployeeProfileContent";
import { PpeEmployeeProfileSkeleton } from "@/components/ppe/PpeSkeletons";
import { usePpeIssueProfileQuery } from "@/hooks/use-ppe-queries";

export type PpeEmployeeProfilePageClientProps = Readonly<{
  issueId: string;
}>;

export function PpeEmployeeProfilePageClient(
  props: Readonly<PpeEmployeeProfilePageClientProps>,
) {
  const { issueId } = props;
  const { profile, isLoading, errorMessage, isNotFound, refetch } =
    usePpeIssueProfileQuery(issueId);
  return (
    <div className="flex flex-1 flex-col gap-3.5">
      {isLoading ? <PpeEmployeeProfileSkeleton /> : null}

      {!isLoading && errorMessage ? (
        <div className="px-4 pb-8">
          <IncidentGlassCard paddingClassName="p-6" className="min-w-0">
            <Text as="p" className="text4 text-ehs-darker">
              Couldn&apos;t load this PPE profile
            </Text>
            <Text as="p" className="text4 text-ehs-muted-text mt-1">
              {errorMessage}
            </Text>
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={refetch}
            >
              Try again
            </Button>
          </IncidentGlassCard>
        </div>
      ) : null}

      {!isLoading && !errorMessage && (isNotFound || !profile) ? (
        <PpeEmployeeProfileNotFound employeeId={issueId} />
      ) : null}

      {!isLoading && !errorMessage && profile ? (
        <PpeEmployeeProfileContent profile={profile} issueId={issueId} />
      ) : null}
    </div>
  );
}
