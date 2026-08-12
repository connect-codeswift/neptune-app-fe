"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { EditDocumentView } from "@/components/policy-maker/edit/EditDocumentView";
import { SkeletonFormPage } from "@/components/ui/skeletons";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  useDocumentByIdQuery,
  useDocumentDepartmentsQuery,
} from "@/hooks/use-document-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { toDepartmentNameLookup } from "@/services/mappers/document-list.mapper";

export type EditDocumentContentProps = Readonly<{
  documentIdParam: string;
}>;

function parseDocumentId(raw: string): number | null {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Loads a document via GET /api/Document/{id} and renders the edit view.
 */
export function EditDocumentContent(props: Readonly<EditDocumentContentProps>) {
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

  const document = documentQuery.data ?? null;

  const showBootLoading = !isClientReady;
  const showQueryLoading =
    isClientReady && hasToken && numericId != null && documentQuery.isLoading;

  if (showBootLoading || showQueryLoading) {
    return (
      <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 py-4">
        <SkeletonFormPage fields={8} />
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
          Please sign in to edit this document.
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

  return <EditDocumentView document={document} />;
}
