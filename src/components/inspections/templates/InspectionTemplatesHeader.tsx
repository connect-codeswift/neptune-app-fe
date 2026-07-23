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

export type InspectionTemplatesHeaderProps = Readonly<{
  onCreateTemplate?: () => void;
}>;

export function InspectionTemplatesHeader(props: InspectionTemplatesHeaderProps) {
  const { onCreateTemplate } = props;

  return (
    <div className="relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white px-6 py-4 shadow-[0px_12px_32px_0px_rgba(15,23,42,0.14),0px_1px_2px_0px_rgba(15,23,42,0.04)] backdrop-blur-[10px] before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.9)] before:content-['']">
      <div className="relative z-1 flex min-w-0 flex-col gap-1.5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1">
          <span className="text-ehs-gray text-sm font-medium">Compliance</span>
          <Chevron />
          <Link href="/dashboard/inspections" className={crumbClass}>
            Inspections
          </Link>
          <Chevron />
          <span className="text-ehs-gray text-sm font-medium">Templates</span>
        </nav>

        <Text
          as="h1"
          className="text-ehs-dark-bg text-2xl font-semibold tracking-[-0.2px]"
        >
          Inspection Templates
        </Text>

        <Text as="p" className="text-ehs-muted-text text-sm">
          Manage and use inspection checklists
        </Text>
      </div>

      <Button
        type="button"
        variant="primary"
        onClick={onCreateTemplate}
        className="relative z-1 shrink-0 gap-2 rounded-[10px] px-4 py-2.5"
      >
        <Icon icon="mdi:plus" className="size-4 shrink-0" aria-hidden="true" />
        <span className="text-sm font-semibold whitespace-nowrap">
          Create Template
        </span>
      </Button>
    </div>
  );
}
