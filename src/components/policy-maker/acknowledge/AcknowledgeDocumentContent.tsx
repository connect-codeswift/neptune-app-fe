"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { AcknowledgeDocumentView } from "@/components/policy-maker/acknowledge/AcknowledgeDocumentView";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useDocumentByIdQuery } from "@/hooks/use-document-queries";
import { getAccessToken } from "@/lib/axios";

export type AcknowledgeDocumentContentProps = Readonly<{
  documentIdParam: string;
}>;

function parseDocumentId(raw: string): number | null {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Loads a document via GET /api/Document/{id} and renders the
 * Read & Acknowledge view.
 */
export function AcknowledgeDocumentContent(
  props: Readonly<AcknowledgeDocumentContentProps>,
) {
  const { documentIdParam } = props;
  const [isClientReady, setIsClientReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(getAccessToken()));
    setIsClientReady(true);
  }, []);

  const numericId = parseDocumentId(documentIdParam);

  const documentQuery = useDocumentByIdQuery({
    id: numericId,
    enabled: isClientReady && hasToken,
  });

  const document = documentQuery.data ?? null;

  const showBootLoading = !isClientReady;
  const showQueryLoading =
    isClientReady && hasToken && numericId != null && documentQuery.isLoading;

  if (showBootLoading || showQueryLoading) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center px-4">
        <IncidentGlassCard className="min-h-[220px] items-center justify-center gap-2 text-center">
          <Icon
            icon="mdi:loading"
            className="text-ehs-normal-blue size-8 animate-spin"
            aria-hidden="true"
          />
          <Text as="p" className="text-ehs-muted-text text-sm">
            Loading document…
          </Text>
        </IncidentGlassCard>
      </div>
    );
  }

  if (isClientReady && !hasToken) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 px-4">
        <Text as="h1" className="text-ehs-dark-bg text-[22px] font-semibold">
          Sign in required
        </Text>
        <Text as="p" className="text-ehs-muted-text text-[14px]">
          Please sign in to acknowledge this document.
        </Text>
        <Link
          href="/dashboard/policy-maker"
          className="text-ehs-normal-blue text-[14px] font-medium hover:underline"
        >
          Back to Document Library
        </Link>
      </div>
    );
  }

  if (documentQuery.isError) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center px-4">
        <IncidentGlassCard className="min-h-[220px] items-center justify-center gap-2 text-center">
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

  if (!document) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 px-4">
        <Text as="h1" className="text-ehs-dark-bg text-[22px] font-semibold">
          Document not found
        </Text>
        <Text as="p" className="text-ehs-muted-text text-[14px]">
          {`No document matches “${documentIdParam}”.`}
        </Text>
        <Link
          href="/dashboard/policy-maker"
          className="text-ehs-normal-blue text-[14px] font-medium hover:underline"
        >
          Back to Document Library
        </Link>
      </div>
    );
  }

  return <AcknowledgeDocumentView document={document} />;
}
