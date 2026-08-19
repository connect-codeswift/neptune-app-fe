"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
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

/** Filename from a Cloudinary URL, so the row reads like a file listing. */
function fileNameOf(url: string): string {
  const withoutQuery = url.split("?")[0];
  return withoutQuery.split("/").pop() ?? "attachment";
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
            <li
              key={photo}
              className="border-ehs-border bg-ehs-form-classes-bg/70 flex items-center gap-3 rounded-xl border p-3"
            >
              <span className="relative size-11 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={photo}
                  alt=""
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </span>

              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-ehs-dark-bg min-w-0 truncate font-semibold">
                  {fileNameOf(photo)}
                </span>
                <span className="text-ehs-muted-text text-sm">Attached</span>
              </div>

              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-md"
                aria-hidden="true"
              >
                <Icon
                  icon="lucide:image"
                  className="text-ehs-muted-text size-5"
                />
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
