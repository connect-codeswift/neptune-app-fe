"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Document, Page, pdfjs } from "react-pdf";
import type { AttachmentItem } from "./types";

// Configure pdfjs worker to run from CDN matching the package version
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export type FilePreviewModalProps = Readonly<{
  file: AttachmentItem;
  onClose: () => void;
}>;

export function FilePreviewModal(props: Readonly<FilePreviewModalProps>) {
  const { file, onClose } = props;
  const [numPages, setNumPages] = useState<number>(0);

  const isImage = file.kind === "image";
  const isVideo = file.kind === "video";
  const isPdf = file.kind === "pdf";

  // Dynamic preview URL using secure Cloudinary URL or fallbacks
  const fileUrl = file.secureUrl || "/images/sample-coupling.jpg"; // Fallback to avoid dead links

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      {/* Backdrop overlay trigger for closing */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <div className="relative z-10 flex max-h-[85vh] max-w-[90vw] flex-col items-center justify-center rounded-[16px] border border-white/10 bg-black/30 p-2 shadow-2xl backdrop-blur-lg">
        {/* Close Toggle Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-2 inline-flex size-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white border border-white/10 shadow-lg transition-all hover:bg-white/20"
        >
          <Icon icon="mdi:close" className="size-5" />
        </button>

        {/* Dynamic File content previewer */}
        <div className="flex min-h-[240px] min-w-[280px] items-center justify-center overflow-hidden rounded-[10px] bg-[#1c2a3d]">
          {isImage && (
            <img
              src={fileUrl}
              alt={file.name}
              className="max-h-[70vh] max-w-[80vw] object-contain"
            />
          )}

          {isVideo && (
            <video
              src={fileUrl}
              controls
              autoPlay
              className="max-h-[70vh] max-w-[80vw] rounded-[8px] object-contain"
            />
          )}

          {isPdf && (
            <div className="h-[70vh] w-[80vw] overflow-y-auto rounded-[8px] bg-white p-4">
              <Document
                file={fileUrl}
                onLoadSuccess={({ numPages: loadedPages }) => setNumPages(loadedPages)}
                loading={
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-ehs-gray text-[13px]">
                    <Icon icon="mdi:loading" className="size-6 animate-spin text-[#0891a6]" />
                    <span>Loading PDF document...</span>
                  </div>
                }
                error={
                  <div className="text-center py-12 text-ehs-red text-[13px]">
                    Failed to load PDF. Unsigned raw Cloudinary assets may require local download permissions.
                  </div>
                }
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <Page
                    key={index}
                    pageNumber={index + 1}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="mb-4 shadow-sm border border-gray-100 mx-auto"
                    width={typeof window !== "undefined" ? Math.min(window.innerWidth * 0.75, 800) : 600}
                  />
                ))}
              </Document>
            </div>
          )}
        </div>

        {/* Footer label details bar */}
        <div className="mt-2 flex w-full items-center justify-between px-3.5 py-1 text-white">
          <div className="flex flex-col min-w-0 pr-4">
            <span className="truncate text-[13px] font-bold">{file.name}</span>
            <span className="truncate text-[10.5px] text-white/70">
              {file.description}
            </span>
          </div>
          <span className="rounded-full bg-white/14 px-3 py-0.5 text-[10px] font-bold text-white/90 shrink-0">
            {file.sizeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
