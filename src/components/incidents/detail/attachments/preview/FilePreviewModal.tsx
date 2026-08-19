"use client";

import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";
import type { AttachmentItem } from "@/components/incidents/detail/shared/types";
import { useResolvedFileUrl } from "@/hooks/use-file-queries";
import { stripAttachmentDisplayName } from "@/lib/attachment-url";
import { isStoredFileId } from "@/lib/files";

const FilePreviewPdf = dynamic(
  () => import("./FilePreviewPdf").then((module) => module.FilePreviewPdf),
  {
    ssr: false,
    loading: () => (
      <div className="text-ehs-gray rounded-2 text4 bg-ehs-surface flex h-[70vh] w-[80vw] flex-col items-center justify-center gap-2">
        <Icon
          icon="mdi:loading"
          className="text-ehs-normal-blue size-6 animate-spin"
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

  const storedRef = file.secureUrl?.trim() ?? "";
  const resolved = useResolvedFileUrl(
    isStoredFileId(storedRef) ? storedRef : null,
  );
  const fileUrl = isStoredFileId(storedRef)
    ? (resolved.url ?? "")
    : storedRef
      ? stripAttachmentDisplayName(storedRef)
      : "/images/sample-coupling.jpg";

  if (isStoredFileId(storedRef) && resolved.isLoading) {
    return (
      <div className="bg-ehs-overlay-media fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
        <Icon
          icon="mdi:loading"
          className="text-ehs-light-text size-8 animate-spin"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div className="bg-ehs-overlay-media fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <div className="rounded-4 relative z-10 flex max-h-[85vh] max-w-[90vw] flex-col items-center justify-center border border-white/10 bg-black/30 p-2 shadow-2xl backdrop-blur-lg">
        <button
          type="button"
          onClick={onClose}
          className="text-ehs-light-text absolute -top-12 right-2 inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/10 shadow-lg transition-all hover:bg-white/20"
        >
          <Icon icon="mdi:close" className="size-5" />
        </button>

        <div className="rounded-2.5 bg-ehs-canvas-dark flex min-h-60 min-w-70 items-center justify-center overflow-hidden">
          {isImage ? (
            /* eslint-disable-next-line @next/next/no-img-element -- arbitrary
               user-uploaded remote files of unknown intrinsic size; next/image
               would need `fill` and a fixed container, changing the modal's
               shrink-to-content layout. Matches the other 8 preview sites. */
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
              className="rounded-2 max-h-[70vh] max-w-[80vw] object-contain"
            />
          ) : null}

          {isPdf ? <FilePreviewPdf fileUrl={fileUrl} /> : null}
        </div>

        <div className="text-ehs-light-text mt-2 flex w-full items-center justify-between px-3.5 py-1">
          <div className="flex min-w-0 flex-col pr-4">
            <span className="text5 truncate">{file.name}</span>
            <span className="text8 text-ehs-light-text/70 truncate">
              {file.description}
            </span>
          </div>
          <span className="text7 text-ehs-light-text/90 shrink-0 rounded-full bg-white/14 px-3 py-0.5">
            {file.sizeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
