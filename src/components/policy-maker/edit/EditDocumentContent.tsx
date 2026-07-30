"use client";

import Link from "next/link";
import { Text } from "@/components/Text";
import { EditDocumentView } from "@/components/policy-maker/edit/EditDocumentView";
import { getDocumentById } from "@/components/policy-maker/policy-maker-data";

export type EditDocumentContentProps = Readonly<{
  documentIdParam: string;
}>;

/**
 * Loads mock document by route id and renders the edit view.
 */
export function EditDocumentContent(
  props: Readonly<EditDocumentContentProps>,
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

  return <EditDocumentView document={document} />;
}
