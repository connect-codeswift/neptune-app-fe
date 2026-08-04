"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { AttachmentItem } from "@/components/incidents/detail/shared/types";

export type IncidentDetailFilesTableProps = Readonly<{
  attachments: readonly AttachmentItem[];
  onSelectFile?: (file: AttachmentItem) => void;
  onDeleteFile?: (file: AttachmentItem) => void;
  isEditing?: boolean;
  /** When true, renders section content without an outer glass card. */
  embedded?: boolean;
  className?: string;
}>;

function getFileIcon(kind: AttachmentItem["kind"]): string {
  if (kind === "image") return "mdi:file-image-outline";
  if (kind === "video") return "mdi:flash-outline";
  if (kind === "pdf") return "mdi:file-pdf-box";
  return "mdi:file-document-outline";
}

function FilesContent(
  props: Readonly<{
    attachments: readonly AttachmentItem[];
    onSelectFile?: (file: AttachmentItem) => void;
    onDeleteFile?: (file: AttachmentItem) => void;
    isEditing: boolean;
  }>,
) {
  const { attachments, onSelectFile, onDeleteFile, isEditing } = props;
  const columnCount = isEditing ? 6 : 5;

  return (
    <>
      <div className="flex flex-col gap-0.5 pt-0.5">
        <Text
          as="h3"
          className="text-ehs-dark-bg text-lg font-semibold"
        >
          All files
        </Text>
        <span className="text-sm leading-normal text-ehs-muted-text">
          {attachments.length} items
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr>
              {(
                [
                  { label: "File", align: "left" as const },
                  { label: "Description", align: "left" as const },
                  { label: "Size", align: "left" as const },
                  { label: "Added by", align: "left" as const },
                  { label: "Time", align: "right" as const },
                  ...(isEditing
                    ? [{ label: "", align: "right" as const }]
                    : []),
                ] as const
              ).map((column, index) => (
                <th
                  key={column.label || `action-${String(index)}`}
                  className={[
                    "pt-[11px] pb-[11.5px] text-xs font-bold tracking-wide text-ehs-muted-text uppercase",
                    column.align === "right" ? "text-right" : "text-left",
                  ].join(" ")}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attachments.length === 0 ? (
              <tr>
                <td
                  colSpan={columnCount}
                  className="border-t border-[rgba(15,23,42,0.08)] py-8 text-center text-sm text-ehs-muted-text"
                >
                  No files uploaded.
                </td>
              </tr>
            ) : (
              attachments.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => {
                    if (!isEditing) {
                      onSelectFile?.(item);
                    }
                  }}
                  className={[
                    "border-t border-[rgba(15,23,42,0.08)] transition-colors",
                    isEditing
                      ? ""
                      : "cursor-pointer hover:bg-[rgba(15,23,42,0.02)]",
                  ].join(" ")}
                >
                  <td className="py-[14px] pr-3">
                    <div className="flex items-center gap-[10px]">
                      <div className="flex h-8 w-7 shrink-0 items-center justify-center rounded border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.82)] text-ehs-gray">
                        <Icon
                          icon={getFileIcon(item.kind)}
                          className="size-[13px]"
                          aria-hidden="true"
                        />
                      </div>
                      <span className="max-w-[140px] truncate text-sm leading-normal text-ehs-dark-bg">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-[14px] pr-3 text-sm leading-normal text-ehs-gray">
                    {item.description}
                  </td>
                  <td className="py-[14px] pr-3 text-sm leading-normal whitespace-nowrap text-ehs-gray">
                    {item.sizeLabel}
                  </td>
                  <td className="py-[14px] pr-3 text-sm leading-normal whitespace-nowrap text-ehs-gray">
                    {item.addedBy}
                  </td>
                  <td className="py-[14px] text-right text-sm leading-normal whitespace-nowrap text-ehs-muted-text">
                    {item.time}
                  </td>
                  {isEditing ? (
                    <td className="py-[14px] pl-2 text-right">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteFile?.(item);
                        }}
                        className="inline-flex size-7 items-center justify-center rounded-[8px] text-ehs-muted-text transition-colors hover:bg-ehs-red/10 hover:text-ehs-red"
                        aria-label={`Delete ${item.name}`}
                      >
                        <Icon
                          icon="mdi:trash-can-outline"
                          className="size-4"
                          aria-hidden="true"
                        />
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function IncidentDetailFilesTable(
  props: Readonly<IncidentDetailFilesTableProps>,
) {
  const {
    attachments,
    onSelectFile,
    onDeleteFile,
    isEditing = false,
    embedded = false,
    className = "",
  } = props;

  const content = (
    <FilesContent
      attachments={attachments}
      onSelectFile={onSelectFile}
      onDeleteFile={onDeleteFile}
      isEditing={isEditing}
    />
  );

  if (embedded) {
    return (
      <div
        className={["flex flex-col gap-[14px]", className]
          .filter(Boolean)
          .join(" ")}
      >
        {content}
      </div>
    );
  }

  return (
    <IncidentGlassCard
      paddingClassName="p-[23px]"
      incidentGlassCardClassName="gap-[14px]"
      className={[className, isEditing ? "ring-1 ring-ehs-normal-blue/25" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      {content}
    </IncidentGlassCard>
  );
}
