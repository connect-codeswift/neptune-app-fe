"use client";

import { DashboardHeader } from "@/components/DashboardHeader";
import { AcknowledgeDocumentForm } from "@/components/policy-maker/acknowledge/AcknowledgeDocumentForm";
import { AcknowledgeDocumentHeader } from "@/components/policy-maker/acknowledge/AcknowledgeDocumentHeader";
import { AcknowledgeDocumentViewer } from "@/components/policy-maker/acknowledge/AcknowledgeDocumentViewer";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";

export type AcknowledgeDocumentViewProps = Readonly<{
  document: PolicyDocument;
}>;

/**
 * Read & Acknowledge screen (Figma 5568:25278).
 */
export function AcknowledgeDocumentView(
  props: Readonly<AcknowledgeDocumentViewProps>,
) {
  const { document } = props;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DashboardHeader />

      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-3 pb-6 sm:gap-3.5 sm:px-4 sm:pb-8">
        <AcknowledgeDocumentHeader document={document} />

        <div className="flex w-full min-w-0 flex-col gap-3.5 lg:flex-row lg:items-start lg:gap-3.5">
          <AcknowledgeDocumentForm document={document} />
          <AcknowledgeDocumentViewer
            document={document}
            className="min-w-0 flex-1"
          />
        </div>
      </div>
    </div>
  );
}
