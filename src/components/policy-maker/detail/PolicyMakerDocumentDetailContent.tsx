"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import { PolicyMakerDocumentDetailView } from "@/components/policy-maker/detail/PolicyMakerDocumentDetailView";
import { SkeletonDetailPage } from "@/components/ui/skeletons";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useApproveDocumentMutation } from "@/hooks/use-document-mutations";
import { useDocumentByIdQuery } from "@/hooks/use-document-queries";
import { useDepartmentsQuery } from "@/hooks/use-department-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { getAuthContext } from "@/lib/auth-context";
import { parseRecordNumericId } from "@/lib/format-record-id";
import { toast } from "@/lib/toast";
import { toDepartmentNameLookup } from "@/services/mappers/document-list.mapper";

export type PolicyMakerDocumentDetailContentProps = Readonly<{
  documentIdParam: string;
}>;

function parseDocumentId(raw: string): number | null {
  const parsed = parseRecordNumericId(raw);
  return parsed != null && parsed > 0 ? parsed : null;
}

/**
 * Loads a document via GET /api/v1/documents/{id} and renders the detail view.
 */
export function PolicyMakerDocumentDetailContent(
  props: Readonly<PolicyMakerDocumentDetailContentProps>,
) {
  const { documentIdParam } = props;
  const router = useRouter();
  const accessTokenState = useHasAccessToken();
  const isClientReady = accessTokenState !== null;
  const hasToken = accessTokenState === true;

  const numericId = parseDocumentId(documentIdParam);

  const departmentsQuery = useDepartmentsQuery(isClientReady && hasToken);
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

  const approveMutation = useApproveDocumentMutation();
  const [isApproved, setIsApproved] = useState(false);

  const auth = useMemo(
    () => (isClientReady && hasToken ? getAuthContext() : null),
    [isClientReady, hasToken],
  );
  const canApprove =
    auth != null &&
    (document?.approverIds?.includes(String(auth.userId)) ?? false);
  const canAcknowledge =
    auth != null &&
    (document?.ackUserIds?.includes(String(auth.userId)) ?? false);

  const handleApproval = async () => {
    if (!auth || !document || document.versionId == null) {
      return;
    }

    try {
      await approveMutation.mutateAsync({
        approverId: auth.userId,
        docVersionId: document.versionId,
        comments: "Approved",
      });
      setIsApproved(true);
      toast.success(
        "Document approved",
        `${document.title} has been approved.`,
      );
    } catch (error: unknown) {
      toast.error(
        "Could not approve document",
        getMutationErrorMessage(error, "Please try again."),
      );
    }
  };

  const showBootLoading = !isClientReady;
  const showQueryLoading =
    isClientReady && hasToken && numericId != null && documentQuery.isLoading;

  if (showBootLoading || showQueryLoading) {
    return (
      <div className="flex min-h-screen flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-3.5 px-4 pt-4 pb-4">
          <SkeletonDetailPage />
        </div>
      </div>
    );
  }

  if (isClientReady && !hasToken) {
    return (
      <div className="flex min-h-screen flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
          <Text as="h1" className="text1 text-ehs-darker">
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
      </div>
    );
  }

  if (documentQuery.isError) {
    return (
      <div className="flex min-h-screen flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center px-4">
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
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex min-h-screen flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
          <Text as="h1" className="text1 text-ehs-darker">
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
      </div>
    );
  }

  return (
    <PolicyMakerDocumentDetailView
      document={document}
      onEdit={() =>
        router.push(
          `/dashboard/policy-maker/${encodeURIComponent(document.id)}/edit`,
        )
      }
      onVersionHistory={() =>
        router.push(
          `/dashboard/policy-maker/${encodeURIComponent(document.id)}/versions`,
        )
      }
      onApproval={() => void handleApproval()}
      canApprove={canApprove}
      canAcknowledge={canAcknowledge}
      isApproved={isApproved}
      isApproving={approveMutation.isPending}
      onAcknowledgment={() =>
        router.push(
          `/dashboard/policy-maker/${encodeURIComponent(document.id)}/acknowledge`,
        )
      }
      onApprovals={() =>
        router.push(
          `/dashboard/policy-maker/${encodeURIComponent(document.id)}/acknowledgments`,
        )
      }
    />
  );
}
