"use client";

import Link from "next/link";
import { Text } from "@/components/Text";
import { AcknowledgeDocumentView } from "@/components/policy-maker/acknowledge/AcknowledgeDocumentView";
import { getDocumentById } from "@/components/policy-maker/policy-maker-data";

export type AcknowledgeDocumentContentProps = Readonly<{
  documentIdParam: string;
}>;

/**
 * Loads mock document by route id and renders the acknowledge view.
 */
export function AcknowledgeDocumentContent(
  props: Readonly<AcknowledgeDocumentContentProps>,
) {
  const { documentIdParam } = props;
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

  return <AcknowledgeDocumentView document={document} />;
}
