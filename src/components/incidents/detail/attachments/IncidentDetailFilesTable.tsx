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
        <Text as="h3" className="text-ehs-dark-bg text3">
          All files
        </Text>
        <span className="text-ehs-muted-text text4 leading-normal">
          {attachments.length} items
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-140 border-collapse text-left">
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
                    "text-ehs-muted-text text6 pt-2.75 pb-[12px]",
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
                  className="text-ehs-muted-text text4 border-t border-[rgba(15,23,42,0.08)] py-8 text-center"
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
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-2.5">
                      <div className="text-ehs-gray flex h-8 w-7 shrink-0 items-center justify-center rounded border border-[rgba(15,23,42,0.08)] bg-[rgba(255,255,255,0.82)]">
                        <Icon
                          icon={getFileIcon(item.kind)}
                          className="size-3.25"
                          aria-hidden="true"
                        />
                      </div>
                      <span className="text-ehs-dark-bg text4 max-w-35 truncate leading-normal">
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="text-ehs-gray text4 py-3.5 pr-3 leading-normal">
                    {item.description}
                  </td>
                  <td className="text-ehs-gray text4 py-3.5 pr-3 leading-normal whitespace-nowrap">
                    {item.sizeLabel}
                  </td>
                  <td className="text-ehs-gray text4 py-3.5 pr-3 leading-normal whitespace-nowrap">
                    {item.addedBy}
                  </td>
                  <td className="text-ehs-muted-text text4 py-3.5 text-right leading-normal whitespace-nowrap">
                    {item.time}
                  </td>
                  {isEditing ? (
                    <td className="py-3.5 pl-2 text-right">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteFile?.(item);
                        }}
                        className="text-ehs-muted-text hover:bg-ehs-red/10 hover:text-ehs-red rounded-2 inline-flex size-7 items-center justify-center transition-colors"
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
