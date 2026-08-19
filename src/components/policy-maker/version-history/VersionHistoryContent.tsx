"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { VersionHistoryView } from "@/components/policy-maker/version-history/VersionHistoryView";
import { SkeletonTable } from "@/components/ui/skeletons";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  useDocumentByIdQuery,
  useDocumentDepartmentsQuery,
  useDocumentVersionsQuery,
} from "@/hooks/use-document-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { parseRecordNumericId } from "@/lib/format-record-id";
import { toDepartmentNameLookup } from "@/services/mappers/document-list.mapper";

export type VersionHistoryContentProps = Readonly<{
  documentIdParam: string;
}>;

function parseDocumentId(raw: string): number | null {
  const parsed = parseRecordNumericId(raw);
  return parsed != null && parsed > 0 ? parsed : null;
}

/**
 * Loads a document via GET /api/v1/documents/{id} and its versions via
 * GET /api/v1/documents/{id}/versions, then renders the version history view.
 */
export function VersionHistoryContent(
  props: Readonly<VersionHistoryContentProps>,
) {
  const { documentIdParam } = props;
  const accessTokenState = useHasAccessToken();
  const isClientReady = accessTokenState !== null;
  const hasToken = accessTokenState === true;

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
      <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 py-4">
        <SkeletonTable rows={6} columns={5} />
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
          Please sign in to load this document.
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

  if (documentQuery.isError || versionsQuery.isError) {
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
            Could not load version history
          </Text>
          <Text as="p" className="text4 text-ehs-muted-text max-w-xs">
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

  return <VersionHistoryView document={document} />;
}
