"use client";

import { EmptyState } from "@/components/ui/EmptyState";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { ResolvedFileImage } from "@/components/files/ResolvedFileImage";
import {
  canPreviewResolvedFile,
  useResolvedFileUrl,
} from "@/hooks/use-file-queries";
import { IncidentBadge } from "@/components/near-miss/IncidentBadge";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";
import type {
  ObservationDetail,
  ObservationPhoto,
} from "@/app/dashboard/bbs/bbs-data";
import { ObservationDetailBannerCard } from "./ObservationDetailBannerCard";

const actionClass = "text4 h-9 rounded-2.5 px-3 sm:h-9.5";

function displayValue(value: string): string {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "—";
}

function DetailField(props: Readonly<{ label: string; value: string }>) {
  const { label, value } = props;
  const shown = displayValue(value);
  const isEmpty = shown === "—";

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Text as="span" className="text6 text-ehs-muted-text">
        {label}
      </Text>
      <Text
        as="span"
        className={
          isEmpty ? "text4 text-ehs-muted-text" : "text4 text-ehs-darker"
        }
      >
        {shown}
      </Text>
    </div>
  );
}

function SectionTitle(props: Readonly<{ children: string }>) {
  return (
    <Text as="h3" className="text8 text-ehs-muted-text mb-3 font-semibold">
      {props.children}
    </Text>
  );
}

function TypeBadge(props: Readonly<{ type: ObservationDetail["type"] }>) {
  const { type } = props;
  const isSafe = type === "Safe";

  return (
    <IncidentBadge
      label={type}
      tone={isSafe ? "teal" : "warn"}
      showDot
      className="w-fit"
    />
  );
}

/**
 * One evidence file. `photo.url` is a files-API id since the move to the private bucket, so
 * it was going straight into an `<img src>` — a broken frame — and `photo.name` was showing
 * the raw uuid. Both come from resolving the ref instead.
 */
function PhotoRow(props: Readonly<{ photo: ObservationPhoto }>) {
  const { photo } = props;
  const ref = photo.url?.trim() || "";
  const { url, thumbnailUrl, fileName, mimeType } = useResolvedFileUrl(ref);
  const name = fileName?.trim() || photo.name;

  return (
    <li className="border-ehs-border bg-ehs-surface/80 flex items-center gap-3 rounded-xl border p-3">
      {ref && canPreviewResolvedFile(mimeType, thumbnailUrl) ? (
        <span className="relative size-12 shrink-0 overflow-hidden rounded-lg">
          <ResolvedFileImage
            fileRef={ref}
            alt={name}
            sizes="48px"
            className="object-cover"
          />
        </span>
      ) : (
        <span
          className="bg-ehs-normal-blue/10 flex size-9 shrink-0 items-center justify-center rounded-lg"
          aria-hidden="true"
        >
          <Icon icon="lucide:image" className="text-ehs-normal-blue size-5" />
        </span>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text4 text-ehs-normal-blue hover:text-ehs-normal-blue-hover min-w-0 truncate transition-colors"
          >
            {name}
          </a>
        ) : (
          <Text as="span" className="text4 text-ehs-darker min-w-0 truncate">
            {name}
          </Text>
        )}
        <Text as="span" className="text8 text-ehs-muted-text">
          {photo.size}
        </Text>
      </div>
    </li>
  );
}

export type ObservationDetailContentProps = Readonly<{
  detail: ObservationDetail;
  onEdit?: () => void;
}>;

export function ObservationDetailContent(props: ObservationDetailContentProps) {
  const { detail, onEdit } = props;
  const router = useRouter();

  const editRoute = `/dashboard/bbs/observation/edit?id=${encodeURIComponent(detail.id)}`;

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
      return;
    }
    router.push(editRoute);
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-3.5 px-4 pt-4 pb-8">
      <ObservationDetailBannerCard detail={detail} />

      <div className="mx-auto flex w-full max-w-200 justify-center">
        <IncidentGlassCard
          paddingClassName="p-0 overflow-hidden"
          className="backdrop-blur-2.5 bg-ehs-surface/62 w-full"
        >
          <div className="border-ehs-border flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
            <Text as="h2" className="text3 text-ehs-darker">
              Observation Details
            </Text>

            <Button
              type="button"
              variant="primary"
              onClick={handleEdit}
              className={`${actionClass} border-transparent! shadow-none!`}
            >
              <Icon
                icon="mdi:pencil-outline"
                className="size-4 shrink-0"
                aria-hidden="true"
              />
              Edit
            </Button>
          </div>

          <div className="flex flex-col gap-5 px-5 py-5 sm:gap-6 sm:px-6 sm:py-6">
            <section>
              <SectionTitle>Overview</SectionTitle>
              <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
                <DetailField label="Observer" value={detail.observer} />
                <DetailField label="Location" value={detail.location} />
                <DetailField label="Date" value={detail.date} />
                <DetailField label="Time" value={detail.time} />
                <DetailField
                  label="Behavior Category"
                  value={detail.category}
                />
                <div className="flex flex-col items-start gap-1">
                  <Text as="span" className="text6 text-ehs-muted-text">
                    Observation Type
                  </Text>
                  <TypeBadge type={detail.type} />
                </div>
              </div>
            </section>

            <div className="bg-ehs-surface-inverse/8 h-px w-full" />

            <section>
              <SectionTitle>Behavior Details</SectionTitle>
              {detail.observed.trim() && detail.observed !== "—" ? (
                <div className="flex min-w-0 flex-col gap-1">
                  <Text as="span" className="text6 text-ehs-muted-text">
                    What was observed
                  </Text>
                  <Text as="p" className="text4 text-ehs-darker">
                    {detail.observed}
                  </Text>
                </div>
              ) : (
                <div className="bg-ehs-surface-inverse/4 flex items-start gap-2 rounded-xl px-3 py-2.5">
                  <Icon
                    icon="mdi:note-outline"
                    className="text-ehs-muted-text mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <Text as="p" className="text4 text-ehs-muted-text">
                    No behavior details recorded for this observation.
                  </Text>
                </div>
              )}
            </section>

            <div className="bg-ehs-surface-inverse/8 h-px w-full" />

            <section>
              <SectionTitle>Photo Evidence</SectionTitle>
              {detail.photos.length === 0 ? (
                <EmptyState
                  variant="inline"
                  icon="mdi:image-outline"
                  title="No photos attached"
                />
              ) : (
                <ul className="flex flex-col gap-3">
                  {detail.photos.map((photo) => (
                    <PhotoRow key={photo.url ?? photo.name} photo={photo} />
                  ))}
                </ul>
              )}
            </section>
          </div>
        </IncidentGlassCard>
      </div>
    </div>
  );
}
