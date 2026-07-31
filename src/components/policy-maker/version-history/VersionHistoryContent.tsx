"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { VersionHistoryView } from "@/components/policy-maker/version-history/VersionHistoryView";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  useDocumentByIdQuery,
  useDocumentDepartmentsQuery,
  useDocumentVersionsQuery,
} from "@/hooks/use-document-queries";
import { toDepartmentNameLookup } from "@/services/mappers/document-list.mapper";
import { getAccessToken } from "@/lib/axios";

export type VersionHistoryContentProps = Readonly<{
  documentIdParam: string;
}>;

function parseDocumentId(raw: string): number | null {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Loads a document via GET /api/Document/{id} and its versions via
 * GET /api/Document/{id}/versions, then renders the version history view.
 */
export function VersionHistoryContent(
  props: Readonly<VersionHistoryContentProps>,
) {
  const { documentIdParam } = props;
  const [isClientReady, setIsClientReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(getAccessToken()));
    setIsClientReady(true);
  }, []);

  const numericId = parseDocumentId(documentIdParam);

  const departmentsQuery = useDocumentDepartmentsQuery(
    isClientReady && hasToken,
  );
  const departmentNameById = useMemo(
    () => toDepartmentNameLookup(departmentsQuery.data ?? []),
    [departmentsQuery.data],
  );

  const documentQuery = useDocumentByIdQuery({
    id: numericId,
    enabled: isClientReady && hasToken,
    departmentNameById,
  });

  const versionsQuery = useDocumentVersionsQuery({
    documentId: numericId,
    enabled: isClientReady && hasToken,
  });

  const baseDocument = documentQuery.data ?? null;
  const document = useMemo(() => {
    if (!baseDocument) {
      return null;
    }
    if (!versionsQuery.data) {
      return baseDocument;
    }
    return { ...baseDocument, versions: versionsQuery.data };
  }, [baseDocument, versionsQuery.data]);

  const showBootLoading = !isClientReady;
  const showQueryLoading =
    isClientReady &&
    hasToken &&
    numericId != null &&
    (documentQuery.isLoading || versionsQuery.isLoading);

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
            Loading version history…
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
          Please sign in to load this document.
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

  if (documentQuery.isError || versionsQuery.isError) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center px-4">
        <IncidentGlassCard className="min-h-[220px] items-center justify-center gap-2 text-center">
          <Icon
            icon="mdi:alert-circle-outline"
            className="text-ehs-red size-8"
            aria-hidden="true"
          />
          <Text as="p" className="text-ehs-darker text-sm font-semibold">
            Could not load version history
          </Text>
          <Text as="p" className="text-ehs-muted-text max-w-xs text-sm">
            {getMutationErrorMessage(
              documentQuery.error ?? versionsQuery.error,
              "Failed to load this document's version history.",
            )}
          </Text>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              void documentQuery.refetch();
              void versionsQuery.refetch();
            }}
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

  return <VersionHistoryView document={document} />;
}
