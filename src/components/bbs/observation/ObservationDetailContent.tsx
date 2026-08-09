"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { Button } from "@/components/ui/Button";
import { useBbsObservationDetailQuery } from "@/hooks/use-bbs-queries";
import { toObservationDetail } from "@/lib/map-bbs";
import type {
  ObservationDetail,
  ObservationPhoto,
} from "@/app/dashboard/bbs/bbs-data";

const BBS_ROUTE = "/dashboard/bbs";

const crumbClass =
  "text-ehs-muted-text hover:text-ehs-gray text-sm font-medium transition-colors";

function Chevron() {
  return (
    <Icon
      icon="mdi:chevron-right"
      className="text-ehs-muted-text size-4"
      aria-hidden="true"
    />
  );
}

/** Desktop: label above value. */
function Field(props: Readonly<{ label: string; children: React.ReactNode }>) {
  const { label, children } = props;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-ehs-muted-text text-xs font-bold tracking-wide uppercase">
        {label}
      </span>
      <div className="text-ehs-dark-bg min-w-0">{children}</div>
    </div>
  );
}

/** Mobile: label left / value right. */
function InfoRow(
  props: Readonly<{
    label: string;
    children: React.ReactNode;
    showDivider?: boolean;
  }>,
) {
  const { label, children, showDivider = true } = props;

  return (
    <div
      className={[
        "flex items-center justify-between gap-3 py-2",
        showDivider ? "border-ehs-border border-b" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="w-30 shrink-0 text-[13px] font-medium text-[#566072]">
        {label}
      </span>
      <div className="text-ehs-dark-bg min-w-0 truncate text-right text-[13px] font-semibold">
        {children}
      </div>
    </div>
  );
}

function SectionTitle(props: Readonly<{ children: React.ReactNode }>) {
  const { children } = props;
  return (
    <h2 className="text-ehs-dark-bg text-base font-bold md:text-xl">
      {children}
    </h2>
  );
}

/** Safe reads green, At-Risk amber. */
function TypeBadge(props: Readonly<{ type: ObservationDetail["type"] }>) {
  const { type } = props;
  const isSafe = type === "Safe";

  return (
    <span
      className={[
        "inline-flex w-fit items-center rounded-md px-2 py-0.5 text-sm font-medium",
        isSafe
          ? "bg-ehs-green/14 text-ehs-green"
          : "bg-[#f59e0b]/14 text-[#f59e0b]",
      ].join(" ")}
    >
      {type}
    </span>
  );
}

function PhotoRow(props: Readonly<{ photo: ObservationPhoto }>) {
  const { photo } = props;

  return (
    <li className="border-ehs-border flex items-center gap-3 rounded-xl border bg-white p-3">
      {photo.url ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary evidence URL
        <img
          src={photo.url}
          alt={photo.name}
          className="size-12 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <span
          className="bg-ehs-normal-blue/10 flex size-9 shrink-0 items-center justify-center rounded-lg"
          aria-hidden="true"
        >
          <Icon icon="lucide:image" className="text-ehs-normal-blue size-5" />
        </span>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-ehs-dark-bg min-w-0 truncate font-semibold">
          {photo.name}
        </span>
        <span className="text-ehs-muted-text text-sm">{photo.size}</span>
      </div>
    </li>
  );
}

export type ObservationDetailContentProps = Readonly<{
  detail: ObservationDetail;
  onEdit?: () => void;
}>;

export function ObservationDetailContent(props: ObservationDetailContentProps) {
  const { detail: fallbackDetail, onEdit } = props;
  const router = useRouter();

  const observationQuery = useBbsObservationDetailQuery(fallbackDetail.id);
  const apiDetail = observationQuery.data?.dataModel
    ? toObservationDetail(observationQuery.data.dataModel)
    : null;
  const detail = apiDetail ?? fallbackDetail;

  const editRoute = `/dashboard/bbs/observation/edit?id=${encodeURIComponent(detail.id)}`;

  if (observationQuery.isPending && !apiDetail) {
    return (
      <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
        <p className="text-ehs-muted-text text-sm">Loading observation…</p>
      </div>
    );
  }

  if (observationQuery.isError && !apiDetail) {
    return (
      <div className="flex flex-1 flex-col items-start gap-2 px-4 pb-8">
        <p className="text-ehs-muted-text text-sm">
          That observation could not be loaded.
        </p>
        <Link
          href={BBS_ROUTE}
          className="text-ehs-normal-blue hover:text-ehs-normal-blue-hover text-sm transition-colors"
        >
          Back to observations
        </Link>
      </div>
    );
  }

  const infoFields: ReadonlyArray<{
    label: string;
    value: React.ReactNode;
  }> = [
    { label: "Observer", value: detail.observer },
    { label: "Date", value: detail.date },
    { label: "Time", value: detail.time },
    { label: "Location", value: detail.location },
    { label: "Behavior Category", value: detail.category },
    { label: "Observation Type", value: <TypeBadge type={detail.type} /> },
  ];

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      {/* Header — compact on mobile */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white px-4 py-3 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-[''] md:px-6 md:py-4">
        <div className="relative z-1 flex min-w-0 flex-1 flex-col gap-1.5">
          <nav
            aria-label="Breadcrumb"
            className="hidden items-center gap-1 overflow-x-auto md:flex"
          >
            <span className="text-ehs-muted-text text-sm font-medium">
              Safety
            </span>
            <Chevron />
            <Link href={BBS_ROUTE} className={crumbClass}>
              Observations
            </Link>
            <Chevron />
            <span className="text-ehs-muted-text text-sm font-medium">
              {detail.id}
            </span>
          </nav>

          <div className="flex items-center gap-2 md:block">
            <Link
              href={BBS_ROUTE}
              aria-label="Back to observations"
              className="border-ehs-border text-ehs-dark-bg hover:bg-slate-50 flex size-8 shrink-0 items-center justify-center rounded-[10px] border bg-white transition-colors md:hidden"
            >
              <Icon icon="mdi:chevron-left" className="size-3.5" />
            </Link>
            <h1 className="text-ehs-dark-bg min-w-0 truncate text-base font-bold tracking-[-0.2px] md:text-2xl md:font-semibold">
              <span className="md:hidden">{detail.id}</span>
              <span className="hidden md:inline">{`Observation ${detail.id}`}</span>
            </h1>
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={() => {
            if (onEdit) {
              onEdit();
              return;
            }
            router.push(editRoute);
          }}
          className="relative z-1 shrink-0 rounded-[10px] px-4 py-2 text-sm font-semibold md:px-6 md:py-2.5 md:text-base"
        >
          Edit
        </Button>
      </div>

      <div className="grid min-w-0 items-start gap-3.5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3.5">
          <IncidentGlassCard
            paddingClassName="p-4 md:p-6"
            className="min-w-0"
            incidentGlassCardClassName="gap-3 md:gap-5"
          >
            <SectionTitle>Observation Information</SectionTitle>

            <div className="flex flex-col md:hidden">
              {infoFields.map((field, index) => (
                <InfoRow
                  key={field.label}
                  label={field.label}
                  showDivider={index < infoFields.length - 1}
                >
                  {field.value}
                </InfoRow>
              ))}
            </div>

            <div className="hidden gap-5 md:grid md:grid-cols-2">
              <Field label="Observer">{detail.observer}</Field>
              <Field label="Date">{detail.date}</Field>
              <Field label="Time">{detail.time}</Field>
              <Field label="Location">{detail.location}</Field>
              <Field label="Behavior Category">{detail.category}</Field>
              <Field label="Observation Type">
                <TypeBadge type={detail.type} />
              </Field>
            </div>
          </IncidentGlassCard>

          {/* Photos before behavior details on mobile */}
          <IncidentGlassCard
            paddingClassName="p-4 md:p-6"
            className="min-w-0 lg:hidden"
            incidentGlassCardClassName="gap-3 md:gap-4"
          >
            <SectionTitle>Photo Evidence</SectionTitle>
            {detail.photos.length === 0 ? (
              <p className="text-ehs-muted-text text-sm">No photos attached.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {detail.photos.map((photo) => (
                  <PhotoRow key={photo.url ?? photo.name} photo={photo} />
                ))}
              </ul>
            )}
          </IncidentGlassCard>

          <IncidentGlassCard
            paddingClassName="p-4 md:p-6"
            className="min-w-0"
            incidentGlassCardClassName="gap-3 md:gap-4"
          >
            <SectionTitle>Behavior Details</SectionTitle>
            <Field label="What was observed">
              <p className="text-ehs-darker text-[13px] leading-5 md:text-base md:leading-7">
                {detail.observed}
              </p>
            </Field>
          </IncidentGlassCard>
        </div>

        <IncidentGlassCard
          paddingClassName="p-6"
          className="hidden min-w-0 lg:block"
          incidentGlassCardClassName="gap-4"
        >
          <SectionTitle>Photo Evidence</SectionTitle>
          {detail.photos.length === 0 ? (
            <p className="text-ehs-muted-text text-sm">No photos attached.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {detail.photos.map((photo) => (
                <PhotoRow key={photo.url ?? photo.name} photo={photo} />
              ))}
            </ul>
          )}
        </IncidentGlassCard>
      </div>
    </div>
  );
}
