"use client";

import { Icon } from "@iconify/react";
import { ResolvedFileImage } from "@/components/files/ResolvedFileImage";
import {
  canPreviewResolvedFile,
  useResolvedFileUrl,
} from "@/hooks/use-file-queries";
import type { FormValues } from "@/components/form-builder";
import { OBSERVATION_TYPE_OPTIONS } from "./observation-form-schema";

const DASH = "—";

/** One label/value pair, ruled off from the next. */
function ReviewRow(props: Readonly<{ label: string; value: string }>) {
  const { label, value } = props;

  return (
    <div className="border-ehs-border-ink/10 flex items-start gap-4 border-b py-3 last:border-b-0">
      <span className="text-ehs-muted-text w-28 shrink-0">{label}</span>
      <span className="min-w-0 flex-1 wrap-break-word">{value}</span>
    </div>
  );
}

/**
 * One just-uploaded photo. The value is a files-API id, so both the preview and the name
 * come from resolving it — rendering the id directly showed a broken frame above a uuid.
 */
function ReviewPhotoRow(props: Readonly<{ photo: string }>) {
  const { photo } = props;
  const { url, thumbnailUrl, fileName, mimeType } = useResolvedFileUrl(photo);
  const name = fileName?.trim() || "Attachment";

  return (
    <li className="border-ehs-border bg-ehs-form-classes-bg/70 flex items-center gap-3 rounded-xl border p-3">
      {canPreviewResolvedFile(mimeType, thumbnailUrl) ? (
        <span className="relative size-11 shrink-0 overflow-hidden rounded-lg">
          <ResolvedFileImage
            fileRef={photo}
            alt={name}
            sizes="44px"
            className="object-cover"
          />
        </span>
      ) : (
        <span
          className="bg-ehs-normal-blue/10 flex size-11 shrink-0 items-center justify-center rounded-lg"
          aria-hidden="true"
        >
          <Icon icon="lucide:image" className="text-ehs-normal-blue size-5" />
        </span>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover min-w-0 truncate font-semibold transition-colors"
          >
            {name}
          </a>
        ) : (
          <span className="text-ehs-dark-bg min-w-0 truncate font-semibold">
            {name}
          </span>
        )}
        <span className="text-ehs-muted-text text-sm">Attached</span>
      </div>
    </li>
  );
}

export type ObservationReviewStepProps = Readonly<{
  values: FormValues;
}>;

export function ObservationReviewStep(props: ObservationReviewStepProps) {
  const { values } = props;

  const asText = (key: string) => {
    const value = values[key];
    return typeof value === "string" ? value : "";
  };

  const photos = Array.isArray(values.photos) ? values.photos : [];

  const typeLabel =
    OBSERVATION_TYPE_OPTIONS.find(
      (option) => option.value === asText("observationType"),
    )?.label ?? DASH;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-ehs-dark-bg text-lg font-bold">
        Review &amp; Confirm
      </h2>

      <div className="flex flex-col">
        <ReviewRow label="Type" value={typeLabel} />
        <ReviewRow label="Category" value={asText("category") || DASH} />
        <ReviewRow label="Location" value={asText("location") || DASH} />
        <ReviewRow label="Description" value={asText("description") || DASH} />
        <ReviewRow
          label="Photo"
          value={photos.length > 0 ? "Attached" : "None"}
        />
      </div>

      {photos.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {photos.map((photo) => (
            <ReviewPhotoRow key={photo} photo={photo} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}
