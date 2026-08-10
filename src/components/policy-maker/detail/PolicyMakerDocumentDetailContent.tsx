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
import {
  useDocumentByIdQuery,
  useDocumentDepartmentsQuery,
} from "@/hooks/use-document-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import { toDepartmentNameLookup } from "@/services/mappers/document-list.mapper";
import { getAuthContext } from "@/lib/auth-context";
import { toast } from "@/lib/toast";

export type PolicyMakerDocumentDetailContentProps = Readonly<{
  documentIdParam: string;
}>;

function parseDocumentId(raw: string): number | null {
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Loads a document via GET /api/Document/{id} and renders the detail view.
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
      <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 py-4">
        <SkeletonDetailPage />
      </div>
    );
  }

  if (isClientReady && !hasToken) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 px-4">
        <Text as="h1" className="text-ehs-dark-bg text-[22px] font-semibold">
          Sign in required
        </Text>
        <Text as="p" className="text-ehs-muted-text text-3.5">
          Please sign in to load this document.
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
          className="min-h-[220px] text-center"
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

  if (!document) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 px-4">
        <Text as="h1" className="text-ehs-dark-bg text-[22px] font-semibold">
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
    <PolicyMakerDocumentDetailView
      document={document}
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
