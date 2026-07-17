"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { AttachmentItem } from "@/components/incidents/detail/shared/types";

export type IncidentDetailFilesTableProps = Readonly<{
  attachments: readonly AttachmentItem[];
  onSelectFile?: (file: AttachmentItem) => void;
  className?: string;
}>;

export function IncidentDetailFilesTable(
  props: Readonly<IncidentDetailFilesTableProps>,
) {
  const { attachments, onSelectFile, className = "" } = props;

  const getFileIcon = (kind: string) => {
    if (kind === "image") return "mdi:file-image-outline";
    if (kind === "video") return "mdi:video-outline";
    if (kind === "pdf") return "mdi:file-pdf-box";
    return "mdi:file-document-outline";
  };

  return (
    <IncidentGlassCard
      paddingClassName="p-4 sm:p-5"
      className={className}
    >
      <div className="flex flex-col border-b border-[rgba(15,23,42,0.06)] pb-3.5 mb-2.5">
        <Text as="h3" className="text-ehs-dark-bg text-[15px] font-bold">
          All files
        </Text>
        <span className="text-[11px] text-ehs-muted-text">
          {attachments.length} items
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] border-collapse text-left text-[12px]">
          <thead>
            <tr className="text-ehs-muted-text border-b border-[rgba(15,23,42,0.04)] text-[10px] font-bold tracking-[0.8px] uppercase">
              <th className="py-2.5">File</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3 text-right">Size</th>
              <th className="py-2.5 px-3">Added By</th>
              <th className="py-2.5 px-3 text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            {attachments.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-ehs-muted-text text-[12px]">
                  No files uploaded.
                </td>
              </tr>
            ) : (
              attachments.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectFile?.(item)}
                  className="border-b border-[rgba(15,23,42,0.04)] last:border-b-0 text-ehs-dark-bg cursor-pointer hover:bg-[rgba(15,23,42,0.03)] transition-colors"
                >
                  <td className="py-3 pr-2 font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-[6px] bg-[rgba(15,23,42,0.04)] text-ehs-gray">
                        <Icon icon={getFileIcon(item.kind)} className="size-4" />
                      </div>
                      <span className="truncate max-w-[120px]">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-ehs-gray font-normal">{item.description}</td>
                  <td className="py-3 px-3 text-right text-ehs-gray">{item.sizeLabel}</td>
                  <td className="py-3 px-3 font-semibold">{item.addedBy}</td>
                  <td className="py-3 px-3 text-right text-ehs-muted-text">{item.time}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </IncidentGlassCard>
  );
}
