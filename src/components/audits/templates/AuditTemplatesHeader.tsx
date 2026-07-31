"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { Text } from "@/components/Text";
import { Button } from "@/components/ui/Button";

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

/** Sent to the API as the `status` query param. */
export const TEMPLATE_STATUS_FILTERS = ["Published", "Draft"] as const;

export type TemplateStatusFilter = (typeof TEMPLATE_STATUS_FILTERS)[number];

export type AuditTemplatesHeaderProps = Readonly<{
  onCreateTemplate?: () => void;
  status?: TemplateStatusFilter;
  onStatusChange?: (value: TemplateStatusFilter) => void;
}>;

export function AuditTemplatesHeader(props: AuditTemplatesHeaderProps) {
  const { onCreateTemplate, status = "Published", onStatusChange } = props;

  return (
    <div className="relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white px-6 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
      <div className="relative z-1 flex min-w-0 flex-col gap-1.5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1">
          <span className="text-ehs-gray text-sm font-medium">Compliance</span>
          <Chevron />
          <Link href="/dashboard/audits" className={crumbClass}>
            Audits
          </Link>
          <Chevron />
          <span className="text-ehs-gray text-sm font-medium">Templates</span>
        </nav>

        <Text
          as="h1"
          className="text-ehs-dark-bg text-2xl font-semibold tracking-[-0.2px]"
        >
          Audit Templates
        </Text>

        <Text as="p" className="text-ehs-muted-text text-sm">
          Manage and use audit checklists
        </Text>
      </div>

      <div className="relative z-1 flex flex-wrap items-center gap-3">
        <div className="relative shrink-0">
          <select
            value={status}
            aria-label="Template status"
            onChange={(event) =>
              onStatusChange?.(event.target.value as TemplateStatusFilter)
            }
            className="border-ehs-border text-ehs-dark-bg focus:border-ehs-normal-blue focus:ring-ehs-normal-blue/20 w-full cursor-pointer appearance-none rounded-xl border bg-white py-2 pr-9 pl-3.5 font-medium transition outline-none focus:ring-2"
          >
            {TEMPLATE_STATUS_FILTERS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <Icon
            icon="mdi:chevron-down"
            className="text-ehs-muted-text pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={onCreateTemplate}
          className="shrink-0 gap-2 rounded-[10px] px-4 py-2.5"
        >
          <Icon
            icon="mdi:plus"
            className="size-4 shrink-0"
            aria-hidden="true"
          />
          <span className="text-sm font-semibold whitespace-nowrap">
            Create Template
          </span>
        </Button>
      </div>
    </div>
  );
}
