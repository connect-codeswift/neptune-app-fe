"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AcknowledgeActionsCard } from "@/components/policy-maker/acknowledge/AcknowledgeActionsCard";
import { AcknowledgeCommentsCard } from "@/components/policy-maker/acknowledge/AcknowledgeCommentsCard";
import { AcknowledgeConfirmSection } from "@/components/policy-maker/acknowledge/AcknowledgeConfirmSection";
import { AcknowledgeDocumentInfoCard } from "@/components/policy-maker/acknowledge/AcknowledgeDocumentInfoCard";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";
import { toast } from "@/lib/toast";

export type AcknowledgeDocumentFormProps = Readonly<{
  document: PolicyDocument;
  className?: string;
}>;

/**
 * Left-column acknowledge form (Figma 5568:25343).
 */
export function AcknowledgeDocumentForm(
  props: Readonly<AcknowledgeDocumentFormProps>,
) {
  const { document, className = "" } = props;
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const detailHref = `/dashboard/policy-maker/${encodeURIComponent(document.id)}`;

  const handleCancel = () => {
    router.push(detailHref);
  };

  const handleApprove = () => {
    if (!confirmed) {
      toast.error(
        "Confirmation required",
        "Please confirm you have read and understood this document.",
      );
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        "Acknowledgment recorded",
        `${document.title} was logged to the audit trail.`,
      );
      router.push(detailHref);
    }, 600);
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
