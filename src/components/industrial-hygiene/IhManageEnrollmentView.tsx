"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DashboardHeader } from "@/components/DashboardHeader";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IhModuleTabs } from "@/components/industrial-hygiene/IhModuleTabs";
import { IhPageHeader } from "@/components/industrial-hygiene/IhPageHeader";
import { IhSearchToolbar } from "@/components/industrial-hygiene/IhSearchToolbar";
import {
  getIhEnrollmentProgramDetail,
  ihEmployeeInitials,
  ihEnrollmentSubtitle,
  IH_MEDICAL_SURVEILLANCE_PATH,
  type IhEnrollmentRow,
  type IhEnrollmentStatus,
} from "@/components/industrial-hygiene/ih-manage-enrollment-data";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { Text } from "@/components/Text";

function EnrollmentStatusCell(props: Readonly<{ status: IhEnrollmentStatus }>) {
  const isOverdue = props.status === "Overdue";

  return (
    <Text
      as="span"
      className={
        isOverdue
          ? "text-sm font-bold text-[#0b1320]"
          : "text-sm font-semibold text-[#8892a3]"
      }
    >
      {props.status}
    </Text>
  );
}

function EmployeeAvatar(props: Readonly<{ name: string }>) {
  return (
    <span
      aria-hidden
      className="inline-flex size-7.5 shrink-0 items-center justify-center rounded-full bg-[rgba(8,145,166,0.14)] text-xs font-semibold text-[#0891a6]"
    >
      {ihEmployeeInitials(props.name)}
    </span>
  );
}

const ENROLLMENT_COLUMNS: ColumnDef<IhEnrollmentRow, unknown>[] = [
  {
    id: "employee",
    header: "Employee",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5 py-1">
        <EmployeeAvatar name={row.original.name} />
        <Text as="span" className="text-sm font-semibold text-[#0b1320]">
          {row.original.name}
        </Text>
      </div>
    ),
  },
  {
    id: "department",
    header: "Department",
    cell: ({ row }) => (
      <Text as="span" className="text-sm text-[#566072]">
        {row.original.department}
      </Text>
    ),
  },
  {
    id: "lastExam",
    header: "Last Exam",
    cell: ({ row }) => (
      <Text as="span" className="text-sm text-[#566072]">
        {row.original.lastExam}
      </Text>
    ),
  },
  {
    id: "nextExamDue",
    header: "Next Exam Due",
    cell: ({ row }) => (
      <Text as="span" className="text-sm text-[#566072]">
        {row.original.nextExamDue}
      </Text>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <EnrollmentStatusCell status={row.original.status} />,
  },
];

/** Manage Enrollment — Figma 5348:37781. */
export function IhManageEnrollmentView() {
  const router = useRouter();
  const params = useParams<{ programId: string }>();
  const programId =
    typeof params.programId === "string" ? params.programId : "";

  const detail = useMemo(
    () => getIhEnrollmentProgramDetail(programId),
    [programId],
  );
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!detail) return [];
    const q = query.trim().toLowerCase();
    if (!q) return detail.employees;
    return detail.employees.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.department.toLowerCase().includes(q) ||
        row.status.toLowerCase().includes(q),
    );
  }, [detail, query]);

  if (!detail) {
    return (
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <DashboardHeader
          title="Industrial Hygiene Dashboard"
          showSiteSwitcher
        />
        <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-4 pb-8">
          <IhModuleTabs />
          <IncidentGlassCard
            paddingClassName="p-8"
            className="min-w-0 rounded-2xl"
            incidentGlassCardClassName="items-center gap-3 text-center"
          >
            <Text as="h1" className="text-lg font-bold text-[#0b1320]">
              Program not found
            </Text>
            <Text as="p" className="text-sm text-[#8892a3]">
              This surveillance program could not be loaded.
            </Text>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                router.push(IH_MEDICAL_SURVEILLANCE_PATH);
              }}
              className="mt-2 rounded-lg px-3.5 py-2 text-sm font-semibold"
            >
              Back to Medical Surveillance
            </Button>
          </IncidentGlassCard>
        </div>
      </div>
    );
  }

  const { program } = detail;

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <DashboardHeader title="Industrial Hygiene Dashboard" showSiteSwitcher />

      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-4 pb-8">
        <IhModuleTabs />

        <IhPageHeader
          breadcrumb={[
            "Safety",
            "Industrial Hygiene",
            "Medical Surveillance",
            program.code,
          ]}
          title={program.title}
          subtitle={ihEnrollmentSubtitle(program)}
          actions={
            <>
              <Button
                type="button"
                variant="tertiary"
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-[#2a3446]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/industrial-hygiene/download.svg"
                  alt=""
                  width={14}
                  height={14}
                  className="size-3.5"
                />
                Export
              </Button>
              <Button
                type="button"
                variant="primary"
                className="rounded-lg px-3.5 py-2 text-sm font-semibold shadow-[0px_6px_18px_-6px_#0891a6]"
              >
                <Icon
                  icon="mdi:account-plus"
                  className="size-3.5"
                  aria-hidden
                />
                Enroll Employees
              </Button>
            </>
          }
        />

        <IhSearchToolbar
          value={query}
          onChange={setQuery}
          placeholder="Search employees…"
          aria-label="Search enrolled employees"
          resultLabel={`${String(filtered.length)} results found`}
        />

        <Table
          data={filtered}
          columns={ENROLLMENT_COLUMNS}
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}
