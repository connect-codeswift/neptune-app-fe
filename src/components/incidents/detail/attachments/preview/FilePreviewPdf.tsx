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
    <div className="h-[70vh] w-[80vw] overflow-y-auto rounded-2 bg-white p-4">
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages: loadedPages }) => setNumPages(loadedPages)}
        loading={
          <div className="text-ehs-gray flex flex-col items-center justify-center gap-2 py-12 text4">
            <Icon
              icon="mdi:loading"
              className="size-6 animate-spin text-ehs-normal-blue"
            />
            <span>Loading PDF document...</span>
          </div>
        }
        error={
          <div className="text-ehs-red py-12 text-center text4">
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
            className="mx-auto mb-4 border border-ehs-border shadow-sm"
            width={pageWidth}
          />
        ))}
      </Document>
    </div>
  );
}
