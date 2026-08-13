"use client";

import { Icon } from "@iconify/react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { IhModuleTabs } from "@/components/industrial-hygiene/IhModuleTabs";
import { IhPageHeader } from "@/components/industrial-hygiene/IhPageHeader";
import {
  IH_SURVEILLANCE_PROGRAMS,
  type IhSurveillanceProgram,
} from "@/components/industrial-hygiene/ih-medical-surveillance-data";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";

function MetricBox(props: Readonly<{ value: number; label: string }>) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg border border-[rgba(15,23,42,0.08)] bg-white/62 px-2.5 py-2">
      <Text as="span" className="text-xl leading-5 font-bold text-[#0b1320]">
        {String(props.value)}
      </Text>
      <Text as="span" className="font-mono text-sm text-[#8892a3]">
        {props.label}
      </Text>
    </div>
  );
}

function SurveillanceCard(props: Readonly<{ program: IhSurveillanceProgram }>) {
  const { program } = props;

  return (
    <IncidentGlassCard
      paddingClassName="p-5"
      className="min-w-0 rounded-2xl"
      incidentGlassCardClassName="gap-0"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Text as="p" className="text-sm font-bold text-[#0891a6]">
            {program.code}
          </Text>
          <Text
            as="h2"
            className="mt-0.5 text-base leading-5 font-bold text-[#0b1320]"
          >
            {program.title}
          </Text>
          <Text as="p" className="mt-0.5 text-sm text-[#8892a3]">
            {program.regulation}
          </Text>
        </div>
        {program.overdueLabel ? (
          <Text as="span" className="shrink-0 text-sm font-bold text-[#8892a3]">
            {program.overdueLabel}
          </Text>
        ) : null}
      </div>

      <div className="mt-3 flex gap-2">
        <MetricBox value={program.enrolled} label="Enrolled" />
        <MetricBox value={program.overdue} label="Overdue" />
        <MetricBox value={program.compliant} label="Compliant" />
      </div>

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[#8892a3]">
          Frequency:{" "}
          <span className="font-bold text-[#566072]">{program.frequency}</span>
        </p>
        <p className="text-sm text-[#8892a3]">
          Last reviewed:{" "}
          <span className="font-bold text-[#566072]">
            {program.lastReviewed}
          </span>
        </p>
      </div>

      <Button
        type="button"
        variant="tertiary"
        className="mt-3 w-full justify-center rounded-lg px-3.5 py-2 text-base! font-semibold text-[#2a3446]"
      >
        {/* Figma 5348:38193 — users icon, 12×12 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/industrial-hygiene/users.svg"
          alt=""
          width={12}
          height={12}
          className="size-4"
        />
        Manage Enrollment
      </Button>
    </IncidentGlassCard>
  );
}

/** Medical Surveillance tab — Figma 5348:37332. */
export function IhMedicalSurveillanceView() {
  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <DashboardHeader title="Industrial Hygiene Dashboard" showSiteSwitcher />

      <div className="flex min-w-0 flex-1 flex-col gap-3.5 px-4 pb-8">
        <IhModuleTabs />

        <IhPageHeader
          breadcrumb={["Safety", "Industrial Hygiene", "Medical Surveillance"]}
          title="Medical Surveillance Programs"
          subtitle="Track required periodic medical exams driven by occupational exposure"
          actions={
            <Button
              type="button"
              variant="primary"
              className="rounded-lg px-3.5 py-2 text-base! font-semibold"
            >
              <Icon icon="mdi:plus" className="size-4" aria-hidden />
              New Program
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-2">
          {IH_SURVEILLANCE_PROGRAMS.map((program) => (
            <SurveillanceCard key={program.id} program={program} />
          ))}
        </div>
      </div>
    </div>
  );
}
