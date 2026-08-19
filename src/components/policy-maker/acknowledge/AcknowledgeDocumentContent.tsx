"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { AcknowledgeDocumentView } from "@/components/policy-maker/acknowledge/AcknowledgeDocumentView";
import { SkeletonDetailPage } from "@/components/ui/skeletons";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useDocumentByIdQuery } from "@/hooks/use-document-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { getAuthContext } from "@/lib/auth-context";

export type AcknowledgeDocumentContentProps = Readonly<{
  documentIdParam: string;
}>;

function parseDocumentId(raw: string): number | null {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Loads a document via GET /api/v1/documents/{id} and renders the
 * Read & Acknowledge view.
 */
export function AcknowledgeDocumentContent(
  props: Readonly<AcknowledgeDocumentContentProps>,
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

  const auth = useMemo(
    () => (isClientReady && hasToken ? getAuthContext() : null),
    [isClientReady, hasToken],
  );
  const canAcknowledge =
    auth != null &&
    (document?.ackUserIds?.includes(String(auth.userId)) ?? false);

  const showBootLoading = !isClientReady;
  const showQueryLoading =
    isClientReady && hasToken && numericId != null && documentQuery.isLoading;

  if (showBootLoading || showQueryLoading) {
    return (
      <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 py-4">
        <SkeletonDetailPage />
      </div>
    );
  }

  if (isClientReady && !hasToken) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 px-4">
        <Text as="h1" className="text1 text-ehs-dark-bg">
          Sign in required
        </Text>
        <Text as="p" className="text4 text-ehs-muted-text">
          Please sign in to acknowledge this document.
        </Text>
        <Link
          href="/dashboard/policy-maker"
          className="text4 text-ehs-normal-blue hover:underline"
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
          <Text as="p" className="text4 text-ehs-darker">
            Could not load document
          </Text>
          <Text as="p" className="text4 text-ehs-muted-text max-w-xs">
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

  if (!document) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 px-4">
        <Text as="h1" className="text1 text-ehs-dark-bg">
          Document not found
        </Text>
        <Text as="p" className="text4 text-ehs-muted-text">
          {`No document matches “${documentIdParam}”.`}
        </Text>
        <Link
          href="/dashboard/policy-maker"
          className="text4 text-ehs-normal-blue hover:underline"
        >
          Back to Document Library
        </Link>
      </div>
    );
  }

  if (!canAcknowledge) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 px-4">
        <Text as="h1" className="text1 text-ehs-dark-bg">
          Not assigned
        </Text>
        <Text as="p" className="text4 text-ehs-muted-text max-w-xs text-center">
          You are not assigned to acknowledge this document.
        </Text>
        <Link
          href={`/dashboard/policy-maker/${encodeURIComponent(document.id)}`}
          className="text4 text-ehs-normal-blue hover:underline"
        >
          Back to Document Details
        </Link>
      </div>
    );
  }

  return <AcknowledgeDocumentView document={document} />;
}
