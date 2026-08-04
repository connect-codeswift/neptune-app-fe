"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents";
import { Button } from "@/components/ui/Button";
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

/** Uppercase label above its value, as used across the information grid. */
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
      <span
        className="bg-ehs-normal-blue/10 flex size-9 shrink-0 items-center justify-center rounded-lg"
        aria-hidden="true"
      >
        <Icon icon="lucide:image" className="text-ehs-normal-blue size-5" />
      </span>

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
  const { detail, onEdit } = props;
  const router = useRouter();

  const editRoute = `/dashboard/bbs/observation/edit?id=${encodeURIComponent(detail.id)}`;

  return (
    <div className="flex flex-1 flex-col gap-3.5 px-4 pb-8">
      {/* Header */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white px-6 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
        <div className="relative z-1 flex min-w-0 flex-col gap-1.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1">
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

          <Text
            as="h1"
            className="text-ehs-dark-bg text-2xl font-semibold tracking-[-0.2px]"
          >
            {`Observation ${detail.id}`}
          </Text>
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
          className="relative z-1 shrink-0 rounded-[10px] px-6 py-2.5 font-semibold"
        >
          Edit
        </Button>
      </div>

      {/* Information + behaviour details, with the evidence rail alongside. */}
      <div className="grid min-w-0 items-start gap-3.5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-3.5">
          <IncidentGlassCard
            paddingClassName="p-6"
            className="min-w-0"
            incidentGlassCardClassName="gap-5"
          >
            <h2 className="text-ehs-dark-bg text-xl font-bold">
              Observation Information
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
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

          <IncidentGlassCard
            paddingClassName="p-6"
            className="min-w-0"
            incidentGlassCardClassName="gap-4"
          >
            <h2 className="text-ehs-dark-bg text-xl font-bold">
              Behavior Details
            </h2>

            <Field label="What was observed">
              <p className="text-ehs-darker leading-7">{detail.observed}</p>
            </Field>
          </IncidentGlassCard>
        </div>

        <IncidentGlassCard
          paddingClassName="p-6"
          className="min-w-0"
          incidentGlassCardClassName="gap-4"
        >
          <h2 className="text-ehs-dark-bg text-xl font-bold">Photo Evidence</h2>

          {detail.photos.length === 0 ? (
            <p className="text-ehs-muted-text text-sm">No photos attached.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {detail.photos.map((photo) => (
                <PhotoRow key={photo.name} photo={photo} />
              ))}
            </ul>
          )}
        </IncidentGlassCard>
      </div>
    </div>
  );
}
