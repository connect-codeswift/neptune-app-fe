"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AcknowledgeActionsCard } from "@/components/policy-maker/acknowledge/AcknowledgeActionsCard";
import { AcknowledgeCommentsCard } from "@/components/policy-maker/acknowledge/AcknowledgeCommentsCard";
import { AcknowledgeConfirmSection } from "@/components/policy-maker/acknowledge/AcknowledgeConfirmSection";
import { AcknowledgeDocumentInfoCard } from "@/components/policy-maker/acknowledge/AcknowledgeDocumentInfoCard";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useAcknowledgeDocumentMutation } from "@/hooks/use-document-mutations";
import { getAuthContext } from "@/lib/auth-context";
import { toast } from "@/lib/toast";
import { findMyAcknowledgement } from "@/services/mappers/acknowledgement.mapper";
import { getDocumentAcknowledgements } from "@/services/document.service";

export type AcknowledgeDocumentFormProps = Readonly<{
  document: PolicyDocument;
  className?: string;
}>;

/**
 * Left-column acknowledge form (Figma 5568:25343).
 * Approve resolves the current user's AckId from
 * GET /api/Document/versions/{documentVersionId}/acknowledgements (no
 * userId filter exists there, so it matches by name and fails closed if
 * that match isn't exactly one row), then calls
 * PUT /api/Document/Acknowledgement.
 */
export function AcknowledgeDocumentForm(
  props: Readonly<AcknowledgeDocumentFormProps>,
) {
  const { document, className = "" } = props;
  const router = useRouter();
  const acknowledgeMutation = useAcknowledgeDocumentMutation();
  const [confirmed, setConfirmed] = useState(false);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const detailHref = `/dashboard/policy-maker/${encodeURIComponent(document.id)}`;

  const handleCancel = () => {
    router.push(detailHref);
  };

  const handleApprove = async () => {
    if (!confirmed) {
      toast.error(
        "Confirmation required",
        "Please confirm you have read and understood this document.",
      );
      return;
    }

    if (document.versionId == null) {
      toast.error(
        "Missing version",
        "This document has no version id to acknowledge against.",
      );
      return;
    }

    const auth = getAuthContext();
    if (!auth) {
      toast.error("Sign in required", "Please sign in to acknowledge this document.");
      return;
    }

    setIsSubmitting(true);
    try {
      const acknowledgements = await getDocumentAcknowledgements(
        document.versionId,
      );
      const rows = acknowledgements.dataModel?.rows ?? [];
      const match = findMyAcknowledgement(rows, auth.fullName);

      if (match.ackId == null) {
        toast.error("Could not acknowledge", match.error);
        return;
      }

      await acknowledgeMutation.mutateAsync({
        acknowledgeBy: auth.userId,
        docVersionId: document.versionId,
        ackId: match.ackId,
      });

      toast.success(
        "Acknowledgment recorded",
        `${document.title} was logged to the audit trail.`,
      );
      router.push(detailHref);
    } catch (error: unknown) {
      toast.error(
        "Could not record acknowledgement",
        getMutationErrorMessage(error, "Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={[
        "flex w-full min-w-0 flex-col gap-[18px] lg:max-w-[463px] lg:shrink-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex w-full min-w-0 flex-col gap-3">
        <AcknowledgeDocumentInfoCard document={document} />
        <AcknowledgeConfirmSection
          checked={confirmed}
          onCheckedChange={setConfirmed}
        />
      </div>

      <div className="flex w-full min-w-0 flex-col gap-[18px]">
        <AcknowledgeCommentsCard value={comments} onChange={setComments} />
        <AcknowledgeActionsCard
          canApprove={confirmed}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
          onApprove={handleApprove}
        />
      </div>
    </div>
  );
}
