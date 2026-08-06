"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { EditDocumentForm } from "@/components/policy-maker/edit/EditDocumentForm";
import { EditDocumentHeader } from "@/components/policy-maker/edit/EditDocumentHeader";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";

export type EditDocumentViewProps = Readonly<{
  document: PolicyDocument;
}>;

/**
 * Edit Document screen (Figma 5568:25788).
 * Same shell pattern as Upload Document — full-width header + centered form.
 */
export function EditDocumentView(props: Readonly<EditDocumentViewProps>) {
  const { document } = props;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DashboardHeader />

      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-3 pb-6 sm:gap-5 sm:px-4 sm:pb-8">
        <EditDocumentHeader />
        <div className="flex w-full min-w-0 justify-center">
          <EditDocumentForm document={document} />
        </div>
      </div>
    </div>
  );
}
