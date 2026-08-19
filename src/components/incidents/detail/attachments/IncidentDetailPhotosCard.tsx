"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { ResolvedFileImage } from "@/components/files/ResolvedFileImage";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { AttachmentItem } from "@/components/incidents/detail/shared/types";

export type IncidentDetailPhotosCardProps = Readonly<{
  attachments: readonly AttachmentItem[];
  onSelectFile?: (file: AttachmentItem) => void;
  onAddFile?: () => void;
  onDeleteFile?: (file: AttachmentItem) => void;
  isEditing?: boolean;
  readOnly?: boolean;
  /** When true, renders section content without an outer glass card. */
  embedded?: boolean;
  className?: string;
}>;

function PhotosContent(
  props: Readonly<{
    attachments: readonly AttachmentItem[];
    onSelectFile?: (file: AttachmentItem) => void;
    onAddFile?: () => void;
    onDeleteFile?: (file: AttachmentItem) => void;
    isEditing: boolean;
    readOnly: boolean;
  }>,
) {
  const {
    attachments,
    onSelectFile,
    onAddFile,
    onDeleteFile,
    isEditing,
    readOnly,
  } = props;
  // Always show every attachment — do not hide PDFs when images exist.
  const displayItems = attachments;

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text as="h3" className="text-ehs-dark-bg text3">
            Photos, video & files
          </Text>
          <span className="text-ehs-muted-text text4 leading-normal">
            {isEditing
              ? "Remove files, then save"
              : `${String(attachments.length)} files attached`}
          </span>
        </div>
        {!readOnly && !isEditing ? (
          <button
            type="button"
            onClick={onAddFile}
            className="text-ehs-dark-bg rounded-2.5 text5 backdrop-blur-1.5 border-ehs-hairline/90 bg-ehs-surface/62 hover:bg-ehs-surface/80 inline-flex shrink-0 items-center gap-2 border px-3.75 pt-2.5 pb-[11px] transition-colors"
          >
            <Icon icon="mdi:plus" className="size-3.25" aria-hidden="true" />
            Add file
          </button>
        ) : null}
      </div>

      {displayItems.length === 0 ? (
        <div className="text-ehs-muted-text text4 py-8 text-center">
          No media files uploaded.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {displayItems.map((item, index) => {
            const isVideo = item.kind === "video";
            const isPdf = item.kind === "pdf";
            const hasImage = item.kind === "image" && Boolean(item.secureUrl);
            const gradients = [
              "linear-gradient(135deg, rgb(69, 100, 126) 0%, rgb(34, 50, 71) 100%)",
              "linear-gradient(155deg, rgb(68, 103, 130) 0%, rgb(35, 52, 74) 100%)",
              "linear-gradient(175deg, rgb(66, 106, 133) 0%, rgb(35, 55, 78) 100%)",
              "linear-gradient(195deg, rgb(65, 109, 137) 0%, rgb(36, 58, 81) 100%)",
            ];

            return (
              <div
                key={item.id}
                className="rounded-2.5 border-ehs-border-ink/8 relative aspect-[152/114] w-full overflow-hidden border"
                style={{
                  backgroundImage: gradients[index % gradients.length],
                }}
              >
                <button
                  type="button"
                  onClick={() => onSelectFile?.(item)}
                  className="absolute inset-0 text-left"
                  aria-label={`Preview ${item.name}`}
                >
                  {hasImage ? (
                    <ResolvedFileImage
                      fileRef={item.secureUrl!}
                      alt={item.name}
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  ) : null}

                  {isPdf || (!hasImage && !isVideo) ? (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-[rgba(11,19,32,0.45)]">
                      <Icon
                        icon={
                          isPdf
                            ? "mdi:file-pdf-box"
                            : "mdi:file-document-outline"
                        }
                        className="text-ehs-light-text/90 size-8"
                        aria-hidden="true"
                      />
                      <span className="text-ehs-light-text/80 text7 tracking-wider uppercase">
                        {isPdf ? "PDF" : "FILE"}
                      </span>
                    </div>
                  ) : null}

                  {isVideo ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/45">
                      <div className="text-ehs-dark-bg rounded-4.5 bg-ehs-surface/92 flex size-9 items-center justify-center">
                        <Icon
                          icon="mdi:play"
                          className="size-4"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  ) : null}

                  <div className="absolute inset-x-2 bottom-0.75 z-20 flex items-start justify-between gap-1">
                    <span className="text8 truncate leading-normal text-[rgba(255,255,255,0.9)]">
                      {item.name.replace(/\.[^.]+$/, "")}
                    </span>
                    <span className="text8 shrink-0 leading-normal text-[rgba(255,255,255,0.9)]">
                      {item.sizeLabel}
                    </span>
                  </div>
                </button>

                {isEditing ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteFile?.(item);
                    }}
                    className="bg-ehs-surface-inverse/72 text-ehs-light-text hover:bg-ehs-red absolute top-1.5 right-1.5 z-30 inline-flex size-7 items-center justify-center rounded-full shadow-sm transition-colors"
                    aria-label={`Delete ${item.name}`}
                  >
                    <Icon
                      icon="mdi:close"
                      className="size-3.5"
                      aria-hidden="true"
                    />
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export function IncidentDetailPhotosCard(
  props: Readonly<IncidentDetailPhotosCardProps>,
) {
  const {
    attachments,
    onSelectFile,
    onAddFile,
    onDeleteFile,
    isEditing = false,
    readOnly = false,
    embedded = false,
    className = "",
  } = props;

  const content = (
    <PhotosContent
      attachments={attachments}
      onSelectFile={onSelectFile}
      onAddFile={onAddFile}
      onDeleteFile={onDeleteFile}
      isEditing={isEditing}
      readOnly={readOnly}
    />
  );

  if (embedded) {
    return (
      <div
        className={["flex flex-col gap-3.5", className]
          .filter(Boolean)
          .join(" ")}
      >
        {content}
      </div>
    );
  }

  return (
    <IncidentGlassCard
      paddingClassName="p-5.75"
      incidentGlassCardClassName="gap-3.5"
      className={[className, isEditing ? "ring-ehs-normal-blue/25 ring-1" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      {content}
    </IncidentGlassCard>
  );
}
