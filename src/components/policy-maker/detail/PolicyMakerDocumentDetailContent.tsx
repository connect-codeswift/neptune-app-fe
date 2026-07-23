"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Text } from "@/components/Text";
import { PolicyMakerDocumentDetailView } from "@/components/policy-maker/detail/PolicyMakerDocumentDetailView";
import { getDocumentById } from "@/components/policy-maker/policy-maker-data";
import { toast } from "@/lib/toast";

export type PolicyMakerDocumentDetailContentProps = Readonly<{
  documentIdParam: string;
}>;

/**
 * Loads mock document by route id and renders the detail view.
 */
export function PolicyMakerDocumentDetailContent(
  props: Readonly<PolicyMakerDocumentDetailContentProps>,
) {
  const { documentIdParam } = props;
  const router = useRouter();
  const document = getDocumentById(documentIdParam);

  if (!document) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 px-4">
        <Text as="h1" className="text-[22px] font-semibold text-[#0b1320]">
          Document not found
        </Text>
        <Text as="p" className="text-[14px] text-[#8892a3]">
          {`No document matches “${documentIdParam}”.`}
        </Text>
        <Link
          href="/dashboard/policy-maker"
          className="text-[14px] font-medium text-[#0891a6] hover:underline"
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
      onApproval={() => toast.success("Approval", "Approval flow coming soon.")}
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
      onDateRangeClick={() =>
        toast.success("Date range", "Date filter coming soon.")
      }
      onNotificationsClick={() =>
        toast.success("Notifications", "Notifications coming soon.")
      }
    />
  );
}
