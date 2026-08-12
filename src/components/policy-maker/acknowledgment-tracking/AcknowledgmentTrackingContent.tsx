"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { AcknowledgmentTrackingView } from "@/components/policy-maker/acknowledgment-tracking/AcknowledgmentTrackingView";
import { getAcknowledgmentMetrics } from "@/components/policy-maker/acknowledgment-tracking/acknowledgment-tracking-data";
import { SkeletonListPage } from "@/components/ui/skeletons";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import {
  useDocumentAcknowledgementsQuery,
  useDocumentByIdQuery,
} from "@/hooks/use-document-queries";

export type AcknowledgmentTrackingContentProps = Readonly<{
  documentIdParam: string;
}>;

function parseDocumentId(raw: string): number | null {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Loads a document via GET /api/Document/{id} and its acknowledgement roster
 * via GET /api/Document/versions/{documentVersionId}/acknowledgements, then
 * renders the Acknowledgment Tracking view.
 */
export function AcknowledgmentTrackingContent(
  props: Readonly<AcknowledgmentTrackingContentProps>,
) {
  const { documentIdParam } = props;
  const accessTokenState = useHasAccessToken();
  const isClientReady = accessTokenState !== null;
  const hasToken = accessTokenState === true;

  const numericId = parseDocumentId(documentIdParam);

  const documentQuery = useDocumentByIdQuery({
    id: numericId,
    enabled: isClientReady && hasToken,
  });

  const document = documentQuery.data ?? null;

  const acknowledgementsQuery = useDocumentAcknowledgementsQuery({
    documentVersionId: document?.versionId ?? null,
    enabled: isClientReady && hasToken && document?.versionId != null,
  });

  const records = useMemo(
    () => acknowledgementsQuery.data?.records ?? [],
    [acknowledgementsQuery.data?.records],
  );
  const metrics = useMemo(
    () =>
      getAcknowledgmentMetrics(records, {
        acknowledgedCount: acknowledgementsQuery.data?.acknowledgedCount,
        pendingCount: acknowledgementsQuery.data?.pendingCount,
        completionRate: acknowledgementsQuery.data?.completionRate,
      }),
    [
      records,
      acknowledgementsQuery.data?.acknowledgedCount,
      acknowledgementsQuery.data?.pendingCount,
      acknowledgementsQuery.data?.completionRate,
    ],
  );

  const showBootLoading = !isClientReady;
  const showQueryLoading =
    isClientReady &&
    hasToken &&
    numericId != null &&
    (documentQuery.isLoading || acknowledgementsQuery.isLoading);

  if (showBootLoading || showQueryLoading) {
    return (
      <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 py-4">
        <SkeletonListPage kpis={3} filters={1} rows={8} columns={5} />
      </div>
    );
  }

  if (isClientReady && !hasToken) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 px-4">
        <Text as="h1" className="text-ehs-dark-bg text-5.5 font-semibold">
          Sign in required
        </Text>
        <Text as="p" className="text-ehs-muted-text text-3.5">
          Please sign in to view acknowledgment tracking.
        </Text>
        <Link
          href="/dashboard/policy-maker"
          className="text-ehs-normal-blue text-3.5 font-medium hover:underline"
        >
          Back to Document Library
        </Link>
      </div>
    );
  }

  if (documentQuery.isError) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center px-4">
        <IncidentGlassCard
          className="min-h-55 text-center"
          incidentGlassCardClassName="items-center justify-center gap-2"
        >
          <Icon
            icon="mdi:alert-circle-outline"
            className="text-ehs-red size-8"
            aria-hidden="true"
          />
          <Text as="p" className="text-ehs-darker text-sm font-semibold">
            Could not load document
          </Text>
          <Text as="p" className="text-ehs-muted-text max-w-xs text-sm">
            {getMutationErrorMessage(
              documentQuery.error,
              "Failed to load this document.",
            )}
          </Text>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void documentQuery.refetch()}
            className="mt-1"
          >
            Try again
          </Button>
        </IncidentGlassCard>
      </div>
    );
  }

  if (acknowledgementsQuery.isError) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center px-4">
        <IncidentGlassCard
          className="min-h-55 text-center"
          incidentGlassCardClassName="items-center justify-center gap-2"
        >
          <Icon
            icon="mdi:alert-circle-outline"
            className="text-ehs-red size-8"
            aria-hidden="true"
          />
          <Text as="p" className="text-ehs-darker text-sm font-semibold">
            Could not load acknowledgements
          </Text>
          <Text as="p" className="text-ehs-muted-text max-w-xs text-sm">
            {getMutationErrorMessage(
              acknowledgementsQuery.error,
              "Failed to load the acknowledgment roster.",
            )}
          </Text>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void acknowledgementsQuery.refetch()}
            className="mt-1"
          >
            Try again
          </Button>
        </IncidentGlassCard>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 px-4">
        <Text as="h1" className="text-ehs-dark-bg text-5.5 font-semibold">
          Document not found
        </Text>
        <Text as="p" className="text-ehs-muted-text text-3.5">
          {`No document matches “${documentIdParam}”.`}
        </Text>
        <Link
          href="/dashboard/policy-maker"
          className="text-ehs-normal-blue text-3.5 font-medium hover:underline"
        >
          Back to Document Library
        </Link>
      </div>
    );
  }

  return (
    <AcknowledgmentTrackingView
      document={document}
      records={records}
      metrics={metrics}
    />
  );
}
