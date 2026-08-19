"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Document, Page } from "react-pdf";
// Side-effect import: configures the pdf.js worker before <Document> renders.
import "@/lib/pdf-worker";

export type FilePreviewPdfProps = Readonly<{
  fileUrl: string;
}>;

/** Browser-only PDF renderer — must be loaded with `ssr: false`. */
export function FilePreviewPdf(props: Readonly<FilePreviewPdfProps>) {
  const { fileUrl } = props;
  const [numPages, setNumPages] = useState(0);
  const pageWidth =
    typeof window !== "undefined"
      ? Math.min(window.innerWidth * 0.75, 800)
      : 600;

  return (
    <div className="rounded-2 bg-ehs-surface h-[70vh] w-[80vw] overflow-y-auto p-4">
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages: loadedPages }) => setNumPages(loadedPages)}
        loading={
          <div className="text-ehs-gray text4 flex flex-col items-center justify-center gap-2 py-12">
            <Icon
              icon="mdi:loading"
              className="text-ehs-normal-blue size-6 animate-spin"
            />
            <span>Loading PDF document...</span>
          </div>
        }
        error={
          <div className="text-ehs-red text4 py-12 text-center">
            Failed to load PDF. Unsigned raw Cloudinary assets may require local
            download permissions.
          </div>
        }
      >
        {Array.from({ length: numPages }, (_, index) => (
          <Page
            key={index}
            pageNumber={index + 1}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="border-ehs-border mx-auto mb-4 border shadow-sm"
            width={pageWidth}
          />
        ))}
      </Document>
    </div>
  );
}
