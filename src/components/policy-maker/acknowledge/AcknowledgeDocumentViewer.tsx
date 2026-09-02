"use client";

import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { useResolvedFileUrl } from "@/hooks/use-file-queries";
import { isStoredFileId } from "@/lib/files";
import { documentFileName } from "@/components/policy-maker/edit/edit-document-utils";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";

const AcknowledgePdfDocument = dynamic(
  () =>
    import("@/components/policy-maker/acknowledge/AcknowledgePdfDocument").then(
      (module) => module.AcknowledgePdfDocument,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-5 backdrop-blur-2.5 border-ehs-hairline/90 bg-ehs-surface/62 relative flex min-h-105 w-full min-w-0 flex-col items-center justify-center overflow-hidden border shadow-(--ehs-shadow-card-flat) lg:min-h-180.5">
        <div className="text4 text-ehs-gray flex flex-col items-center justify-center gap-2">
          <Icon
            icon="mdi:loading"
            className="text-ehs-normal-blue size-6 animate-spin"
            aria-hidden="true"
          />
          <span>Loading PDF viewer…</span>
        </div>
      </div>
    ),
  },
);

export type AcknowledgeDocumentViewerProps = Readonly<{
  document: PolicyDocument;
  className?: string;
}>;

/**
 * PDF preview panel for Read & Acknowledge (Figma 5568:25391).
 * Loads the actual PDF renderer client-side only and passes the real uploaded
 * file URL (`document.filePath`). Shows a placeholder when no file is available.
 */
export function AcknowledgeDocumentViewer(
  props: Readonly<AcknowledgeDocumentViewerProps>,
) {
  const { document, className = "" } = props;
  /*
   * `filePath` may be a files-API uuid rather than a URL — see
   * VersionDocumentPreviewModal for the same trap. Passing the uuid straight
   * to the renderer made pdf.js resolve it against the current page and fail
   * with "Invalid PDF structure", which on this screen means the reader cannot
   * see the policy they are being asked to acknowledge.
   */
  const storedRef = document.filePath?.trim() ?? "";
  const resolved = useResolvedFileUrl(
    isStoredFileId(storedRef) ? storedRef : null,
  );
  const fileUrl = isStoredFileId(storedRef) ? (resolved.url ?? "") : storedRef;
  const isResolvingFile = isStoredFileId(storedRef) && resolved.isLoading;
  const fileName = documentFileName(document);

  if (isResolvingFile) {
    return (
      <div
        className={[
          "rounded-5 backdrop-blur-2.5 border-ehs-hairline/90 bg-ehs-surface/62 relative flex min-h-105 w-full min-w-0 flex-col items-center justify-center gap-2 overflow-hidden border px-6 text-center shadow-(--ehs-shadow-card-flat) lg:min-h-180.5",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Icon
          icon="mdi:loading"
          className="text-ehs-normal-blue size-6 animate-spin"
          aria-hidden="true"
        />
        <Text as="p" className="text4 text-ehs-muted-text">
          Preparing document…
        </Text>
      </div>
    );
  }

  if (!fileUrl) {
    return (
      <div
        className={[
          "rounded-5 backdrop-blur-2.5 border-ehs-hairline/90 bg-ehs-surface/62 relative flex min-h-105 w-full min-w-0 flex-col items-center justify-center overflow-hidden border px-6 text-center shadow-(--ehs-shadow-card-flat) lg:min-h-180.5",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Icon
          icon="mdi:file-alert-outline"
          className="text-ehs-muted-text size-8"
          aria-hidden="true"
        />
        <Text as="p" className="text4 text-ehs-dark-bg mt-2">
          Preview unavailable
        </Text>
        <Text as="p" className="text4 text-ehs-muted-text max-w-80">
          This document has no file URL on record yet.
        </Text>
      </div>
    );
  }

  return (
    <div className={className}>
      <AcknowledgePdfDocument fileUrl={fileUrl} fileName={fileName} />
    </div>
  );
}
