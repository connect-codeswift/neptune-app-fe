"use client";

import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { ReportFieldLabel } from "@/components/incidents/report/ReportFormField";
import type { ReportPhotoFile } from "@/components/incidents/report/report-incident-data";

export type ReportPhotosFieldProps = Readonly<{
  photos: readonly ReportPhotoFile[];
  onRemove: (id: string) => void;
  onAdd?: () => void;
  className?: string;
}>;

export function ReportPhotosField(props: Readonly<ReportPhotosFieldProps>) {
  const { photos = [], onRemove, onAdd, className = "" } = props;

  return (
    <div
      className={["flex flex-col gap-1.5 py-[18px]", className]
        .filter(Boolean)
        .join(" ")}
    >
      <ReportFieldLabel
        label="Photos & files"
        trailing={
          <Text as="span" className="text-ehs-muted-text text-[10px]">
            Up to 10 files, 50 MB each.
          </Text>
        }
      />

      <div className="flex flex-wrap gap-2.5">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative size-[88px] shrink-0 overflow-hidden rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(135deg,#446580_0%,#223349_100%)]"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15), transparent 60%)",
              }}
              aria-hidden="true"
            />

            <div className="absolute right-1 bottom-px left-1.5 flex items-start justify-between">
              <span className="text-[9px] text-white/85">{photo.name}</span>
              <span className="text-[9px] text-white/85">{photo.sizeLabel}</span>
            </div>

            <button
              type="button"
              aria-label={`Remove ${photo.name}`}
              onClick={() => onRemove(photo.id)}
              className="absolute top-1 right-1 inline-flex size-[18px] items-center justify-center rounded-[9px] bg-black/50 text-white transition hover:bg-black/70"
            >
              <Icon icon="mdi:close" className="size-2.5" aria-hidden="true" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={onAdd}
          className="flex size-[88px] shrink-0 flex-col items-center justify-center gap-[5px] rounded-[10px] border border-dashed border-[rgba(15,23,42,0.14)] bg-white/62 transition hover:border-ehs-normal-blue/40 hover:bg-ehs-normal-blue/5"
        >
          <Icon
            icon="mdi:plus"
            className="text-ehs-gray size-4"
            aria-hidden="true"
          />
          <Text as="span" className="text-ehs-gray text-[10.8px]">
            Add file
          </Text>
        </button>
      </div>
    </div>
  );
}
