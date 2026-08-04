"use client";

import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";
import type { AttachmentItem } from "@/components/incidents/detail/shared/types";
import { stripAttachmentDisplayName } from "@/lib/attachment-url";

const FilePreviewPdf = dynamic(
  () => import("./FilePreviewPdf").then((module) => module.FilePreviewPdf),
  {
    ssr: false,
    loading: () => (
      <div className="text-ehs-gray flex h-[70vh] w-[80vw] flex-col items-center justify-center gap-2 rounded-[8px] bg-white text-sm">
        <Icon
          icon="mdi:loading"
          className="size-6 animate-spin text-ehs-normal-blue"
        />
        <span>Loading PDF viewer...</span>
      </div>
    ),
  },
);

export type FilePreviewModalProps = Readonly<{
  file: AttachmentItem;
  onClose: () => void;
}>;

export function FilePreviewModal(props: Readonly<FilePreviewModalProps>) {
  const { file, onClose } = props;

  const isImage = file.kind === "image";
  const isVideo = file.kind === "video";
  const isPdf = file.kind === "pdf";

  const fileUrl = file.secureUrl
    ? stripAttachmentDisplayName(file.secureUrl)
    : "/images/sample-coupling.jpg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <div className="relative z-10 flex max-h-[85vh] max-w-[90vw] flex-col items-center justify-center rounded-[16px] border border-white/10 bg-black/30 p-2 shadow-2xl backdrop-blur-lg">
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-2 inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/10 text-ehs-light-text shadow-lg transition-all hover:bg-white/20"
        >
          <Icon icon="mdi:close" className="size-5" />
        </button>

        <div className="flex min-h-[240px] min-w-[280px] items-center justify-center overflow-hidden rounded-[10px] bg-ehs-dark-bg">
          {isImage ? (
            <img
              src={fileUrl}
              alt={file.name}
              className="max-h-[70vh] max-w-[80vw] object-contain"
            />
          ) : null}

          {isVideo ? (
            <video
              src={fileUrl}
              controls
              autoPlay
              className="max-h-[70vh] max-w-[80vw] rounded-[8px] object-contain"
            />
          ) : null}

          {isPdf ? <FilePreviewPdf fileUrl={fileUrl} /> : null}
        </div>

        <div className="mt-2 flex w-full items-center justify-between px-3.5 py-1 text-ehs-light-text">
          <div className="flex min-w-0 flex-col pr-4">
            <span className="truncate text-sm font-bold">{file.name}</span>
            <span className="truncate text-xs text-ehs-light-text/70">
              {file.description}
            </span>
          </div>
          <span className="shrink-0 rounded-full bg-white/14 px-3 py-0.5 text-xs font-bold text-ehs-light-text/90">
            {file.sizeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
