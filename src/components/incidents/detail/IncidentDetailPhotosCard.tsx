import Image from "next/image";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/IncidentGlassCard";
import type { AttachmentItem } from "./types";

export type IncidentDetailPhotosCardProps = Readonly<{
  attachments: readonly AttachmentItem[];
  onSelectFile?: (file: AttachmentItem) => void;
  onAddFile?: () => void;
  className?: string;
}>;

export function IncidentDetailPhotosCard(
  props: Readonly<IncidentDetailPhotosCardProps>,
) {
  const { attachments, onSelectFile, onAddFile, className = "" } = props;

  return (
    <IncidentGlassCard paddingClassName="p-4 sm:p-5" className={className}>
      <div className="mb-3.5 flex items-center justify-between border-b border-[rgba(15,23,42,0.06)] pb-3.5">
        <div className="flex flex-col gap-0.5">
          <Text as="h3" className="text-ehs-dark-bg text-[15px] font-bold">
            Photos & video
          </Text>
          <span className="text-ehs-muted-text text-[11px]">
            {attachments.length} files attached
          </span>
        </div>
        <button
          type="button"
          onClick={onAddFile}
          className="text-ehs-gray hover:bg-ehs-light-bg inline-flex items-center gap-1.5 rounded-[6px] border border-[rgba(15,23,42,0.08)] bg-white/70 px-2.5 py-1 text-[11px] font-bold transition-colors hover:bg-white"
        >
          <Icon icon="mdi:plus" className="size-3.5" />
          <span>Add file</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-4 pt-1">
        {attachments.length === 0 ? (
          <div className="col-span-full py-8 text-center text-ehs-muted-text text-[12px]">
            No media files uploaded.
          </div>
        ) : (
          attachments.map((item) => {
            const isVideo = item.kind === "video";
            const isPdf = item.kind === "pdf";
            const hasImage = item.kind === "image" && Boolean(item.secureUrl);

          return (
            <div
              key={item.id}
              onClick={() => onSelectFile?.(item)}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(135deg,#446580_0%,#223349_100%)] cursor-pointer group"
            >
              {/* Actual Image Render */}
              {hasImage && (
                <Image
                  src={item.secureUrl!}
                  alt={item.name}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              )}

              {/* PDF Document Render */}
              {isPdf && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[linear-gradient(135deg,#3b4f66_0%,#1c2a3d_100%)] p-2">
                  <Icon
                    icon="mdi:file-pdf-box"
                    className="size-8 text-white/90"
                    aria-hidden="true"
                  />
                  <span className="text-[9px] font-bold text-white/80 mt-1 uppercase tracking-wider">
                    PDF
                  </span>
                </div>
              )}

              {/* Optional overlay / play icon for videos */}
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/15 z-10">
                  <Icon
                    icon="mdi:play"
                    className="size-7 text-white/90 drop-shadow-sm group-hover:scale-110 transition-transform"
                    aria-hidden="true"
                  />
                </div>
              )}

              {/* Bottom detail text bar */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2.5 pt-4 pb-1.5 z-20">
                <div className="flex items-end justify-between gap-1 text-[9.5px] text-white">
                  <span className="truncate font-semibold tracking-wide uppercase">
                    {item.name.replace(/\.[^.]+$/, "")}
                  </span>
                  <span className="shrink-0 text-white/80 font-medium">
                    {item.sizeLabel}
                  </span>
                </div>
              </div>
            </div>
          );
        })
        )}
      </div>
    </IncidentGlassCard>
  );
}
