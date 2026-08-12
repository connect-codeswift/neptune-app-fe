"use client";

import { useEffect, useId, useState } from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { resolveFileName } from "@/components/policy-maker/edit/edit-document-utils";
import type { VersionHistoryCardModel } from "@/components/policy-maker/version-history/version-history-utils";
import type { PolicyDocument } from "@/components/policy-maker/policy-maker-types";

const FilePreviewPdf = dynamic(
  () =>
    import("@/components/incidents/detail/attachments/preview/FilePreviewPdf").then(
      (module) => module.FilePreviewPdf,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="text4 text-ehs-gray flex h-[70vh] w-full flex-col items-center justify-center gap-2 rounded-2 bg-white">
        <Icon
          icon="mdi:loading"
          className="text-ehs-normal-blue size-6 animate-spin"
        />
        <span>Loading PDF viewer…</span>
      </div>
    ),
  },
);

export type VersionDocumentPreviewModalProps = Readonly<{
  policyDocument: PolicyDocument;
  entry: VersionHistoryCardModel;
  onClose: () => void;
  onDownload?: () => void;
}>;

/**
 * Document preview modal opened from the Document Detail "Preview Document"
 * button and Version History's eye action. Renders the real uploaded PDF for
 * the specific version being previewed (`entry.filePath`/`fileName`), falling
 * back to the document's current-version file only if that version entry
 * doesn't carry its own (e.g. documents predating per-version file tracking).
 */
export function VersionDocumentPreviewModal(
  props: Readonly<VersionDocumentPreviewModalProps>,
) {
  const { policyDocument, entry, onClose, onDownload } = props;
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  const fileUrl = entry.filePath ?? policyDocument.filePath;
  const fileName = resolveFileName(
    entry.filePath
      ? entry
      : {
          fileName: policyDocument.fileName,
          filePath: policyDocument.filePath,
        },
    policyDocument.title,
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1320]/50 p-3 backdrop-blur-sm sm:p-5"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="relative flex max-h-[92vh] w-full max-w-230 flex-col overflow-hidden rounded-5 border border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.92)] shadow-[0px_25px_50px_-12px_rgba(15,23,42,0.35)]"
      >
        <header className="flex shrink-0 flex-col gap-3 border-b border-[rgba(15,23,42,0.08)] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div className="min-w-0 pr-10 sm:pr-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <Text
                as="h2"
                id={titleId}
                className="text3 text-ehs-dark-bg font-mono"
              >
                {entry.version}
              </Text>
              {entry.isCurrent ? (
                <span className="text8 text-ehs-gray inline-flex h-5 items-center rounded bg-[rgba(11,19,32,0.14)] px-2 py-0.5">
                  Current
                </span>
              ) : (
                <span className="inline-flex h-[20.5px] items-center gap-1.5 rounded-full bg-[rgba(86,96,114,0.1)] pr-2.5 pl-2">
                  <span className="bg-ehs-muted-text size-1.5 shrink-0 rounded-0.75" />
                  <span className="text5 text-ehs-slate">
                    {entry.status === "review" ? "In review" : "Superseded"}
                  </span>
                </span>
              )}
            </div>
            <Text
              as="p"
              className="text8 text-ehs-muted-text mt-0.5 truncate"
            >
              {policyDocument.title}
            </Text>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="tertiary"
              onClick={onDownload}
              className="text4 text-ehs-dark-bg h-9 rounded-2.5 border-[0.8px] border-[rgba(11,19,32,0.14)] px-3 !shadow-none"
            >
              <Icon
                icon="mdi:download-outline"
                className="size-4"
                aria-hidden="true"
              />
              Download
            </Button>
            <button
              type="button"
              aria-label="Close preview"
              onClick={onClose}
              className="text-ehs-gray absolute top-3.5 right-3.5 inline-flex size-8 cursor-pointer items-center justify-center rounded-2.5 border border-[rgba(15,23,42,0.1)] bg-white transition-colors hover:bg-[#eef1f6] sm:static sm:size-9"
            >
              <Icon icon="mdi:close" className="size-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="flex h-10.75 shrink-0 items-center gap-2 border-b border-[rgba(15,23,42,0.08)] px-3 sm:px-4">
          <Icon
            icon="mdi:file-pdf-box"
            className="text-ehs-red size-3.5 shrink-0"
            aria-hidden="true"
          />
          <Text
            as="span"
            className="text5 text-ehs-dark-bg min-w-0 truncate"
          >
            {fileName}
          </Text>
        </div>

        <div className="flex min-h-0 flex-1 items-start justify-center overflow-auto bg-[#eef1f6]/70 px-4 py-8 sm:px-8 sm:py-10">
          {fileUrl ? (
            <FilePreviewPdf fileUrl={fileUrl} />
          ) : (
            <div className="flex h-[50vh] w-full max-w-135 flex-col items-center justify-center gap-2 rounded bg-white text-center shadow-[0px_8px_32px_-8px_rgba(15,23,42,0.16)]">
              <Icon
                icon="mdi:file-alert-outline"
                className="text-ehs-muted-text size-8"
                aria-hidden="true"
              />
              <Text as="p" className="text4 text-ehs-dark-bg">
                Preview unavailable
              </Text>
              <Text as="p" className="text4 text-ehs-muted-text max-w-80">
                This document has no file URL on record yet.
              </Text>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
