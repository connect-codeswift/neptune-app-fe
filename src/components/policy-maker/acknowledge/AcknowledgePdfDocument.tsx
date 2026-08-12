"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Document, Page } from "react-pdf";
import { Text } from "@/components/Text";
// Side-effect import: configures the pdf.js worker before <Document> renders.
import "@/lib/pdf-worker";

export type AcknowledgePdfDocumentProps = Readonly<{
  fileUrl: string;
  fileName: string;
}>;

/**
 * Synchronous react-pdf wrapper for the Read & Acknowledge viewer.
 * Worker setup lives here so it runs before the first <Document> render.
 * This component is loaded dynamically by AcknowledgeDocumentViewer.
 */
export function AcknowledgePdfDocument(
  props: Readonly<AcknowledgePdfDocumentProps>,
) {
  const { fileUrl, fileName } = props;
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [hasError, setHasError] = useState(false);

  const pageWidth = useMemo(
    () =>
      Math.min(
        typeof window !== "undefined" ? window.innerWidth * 0.75 : 600,
        800,
      ),
    [],
  );

  const goPrev = () => setPage((current) => Math.max(1, current - 1));
  const goNext = () =>
    setPage((current) => Math.min(pageCount || current, current + 1));

  return (
    <div className="relative flex min-h-105 w-full min-w-0 flex-col overflow-hidden rounded-5 border border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.62)] shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_-12px_rgba(15,23,42,0.14)] backdrop-blur-2.5 lg:min-h-180.5">
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
        {pageCount > 0 ? (
          <Text
            as="span"
            className="text8 text-ehs-muted-text hidden shrink-0 sm:inline"
          >
            {`· ${String(pageCount)} pages`}
          </Text>
        ) : null}

        <div className="ml-auto flex items-center gap-1.5">
          {/* No handler was ever attached — in-document search isn't
              implemented. Disabled rather than presented as available. */}
          <button
            type="button"
            disabled
            aria-label="Search in document (not available yet)"
            title="Searching inside the document is not available yet"
            className="text-ehs-gray inline-flex items-center rounded-2.5 border border-[rgba(15,23,42,0.14)] px-2.25 py-1.25 opacity-40 disabled:cursor-not-allowed"
          >
            <Icon icon="mdi:magnify" className="size-3" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Previous page"
            onClick={goPrev}
            disabled={page <= 1}
            className="text-ehs-gray inline-flex items-center rounded-2.5 border border-[rgba(15,23,42,0.14)] px-2.25 py-1.25 transition-colors hover:bg-white/70 disabled:opacity-40"
          >
            <Icon
              icon="mdi:chevron-left"
              className="size-3"
              aria-hidden="true"
            />
          </button>
          <Text
            as="span"
            className="text7 text-ehs-gray min-w-10 text-center"
          >
            {pageCount > 0
              ? `${String(page)} / ${String(pageCount)}`
              : `${String(page)} / —`}
          </Text>
          <button
            type="button"
            aria-label="Next page"
            onClick={goNext}
            disabled={pageCount > 0 ? page >= pageCount : true}
            className="text-ehs-gray inline-flex items-center rounded-2.5 border border-[rgba(15,23,42,0.14)] px-2.25 py-1.25 transition-colors hover:bg-white/70 disabled:opacity-40"
          >
            <Icon
              icon="mdi:chevron-right"
              className="size-3"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col items-center overflow-auto bg-[rgba(255,255,255,0.62)] px-4 pt-8 pb-10 sm:px-8 sm:pt-12 lg:px-12">
        {hasError ? (
          <div className="flex h-full w-full max-w-135 flex-col items-center justify-center gap-2 rounded-2 bg-white px-6 text-center shadow-[0px_8px_32px_-8px_rgba(15,23,42,0.16)]">
            <Icon
              icon="mdi:file-alert-outline"
              className="text-ehs-muted-text size-8"
              aria-hidden="true"
            />
            <Text as="p" className="text4 text-ehs-dark-bg">
              Failed to load PDF
            </Text>
            <Text as="p" className="text4 text-ehs-muted-text max-w-80">
              Unsigned raw Cloudinary assets may require local download
              permissions.
            </Text>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-200">
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => {
                setPageCount(numPages);
                setPage((current) => Math.min(current, numPages || 1));
              }}
              onLoadError={() => setHasError(true)}
              loading={
                <div className="text4 text-ehs-gray flex flex-col items-center justify-center gap-2 py-12">
                  <Icon
                    icon="mdi:loading"
                    className="text-ehs-normal-blue size-6 animate-spin"
                    aria-hidden="true"
                  />
                  <span>Loading PDF document…</span>
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center gap-2 rounded-2 bg-white px-6 py-12 text-center shadow-[0px_8px_32px_-8px_rgba(15,23,42,0.16)]">
                  <Icon
                    icon="mdi:file-alert-outline"
                    className="text-ehs-muted-text size-8"
                    aria-hidden="true"
                  />
                  <Text as="p" className="text4 text-ehs-dark-bg">
                    Failed to load PDF
                  </Text>
                  <Text as="p" className="text4 text-ehs-muted-text max-w-80">
                    Unsigned raw Cloudinary assets may require local download
                    permissions.
                  </Text>
                </div>
              }
            >
              {pageCount > 0 ? (
                <Page
                  pageNumber={page}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="mx-auto mb-4 border border-gray-100 shadow-sm"
                  width={pageWidth}
                  loading={
                    <div className="text4 text-ehs-gray py-12 text-center">
                      <Icon
                        icon="mdi:loading"
                        className="text-ehs-normal-blue mx-auto size-6 animate-spin"
                        aria-hidden="true"
                      />
                      <span className="mt-2 block">Loading page…</span>
                    </div>
                  }
                />
              ) : null}
            </Document>
          </div>
        )}
      </div>
    </div>
  );
}
