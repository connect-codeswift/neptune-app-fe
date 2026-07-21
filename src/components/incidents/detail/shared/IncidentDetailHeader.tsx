"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/Text";
import { toast } from "@/lib/toast";

export type TabId =
  | "details"
  | "timeline"
  | "people"
  | "attachments"
  | "investigation"
  | "linked-capa";

export type IncidentDetailHeaderProps = Readonly<{
  incidentId: string;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onCloseIncident?: () => void;
  onEdit?: () => void;
  className?: string;
}>;

export function IncidentDetailHeader(props: Readonly<IncidentDetailHeaderProps>) {
  const {
    incidentId,
    activeTab,
    onTabChange,
    onCloseIncident,
    onEdit,
    className = "",
  } = props;
  const router = useRouter();

  const handleEdit = onEdit ?? (() => {
    toast.info("Edit mode coming soon", "This feature is being developed.");
  });

  const handleClose = onCloseIncident ?? (() => {
    toast.success("Incident Closed", `Incident ${incidentId} has been successfully closed.`);
  });

  const tabs: { id: TabId; label: string }[] = [
    { id: "details", label: "Details" },
    { id: "timeline", label: "Timeline" },
    { id: "people", label: "People" },
    { id: "attachments", label: "Attachments" },
    { id: "investigation", label: "Investigation" },
    { id: "linked-capa", label: "Linked CAPA" },
  ];

  return (
    <div className={["flex flex-col", className].filter(Boolean).join(" ")}>
      {/* Top Header Section (Search & Controls) */}
      <header className="flex flex-col gap-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="relative w-full min-w-0 sm:w-[220px] lg:w-[280px]">
          <Icon
            icon="mdi:magnify"
            className="text-ehs-muted-text pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search incidents, actions, docs…"
            className="placeholder-ehs-muted-text text-ehs-dark-bg focus:border-ehs-normal-blue focus:ring-ehs-normal-blue/20 w-full rounded-lg border border-[rgba(15,23,42,0.12)] bg-white/70 py-[7px] pr-8 pl-8.5 text-[13px] shadow-sm backdrop-blur-[4px] transition-all outline-none focus:ring-2"
          />
          <kbd className="text-ehs-muted-text pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded border border-[rgba(15,23,42,0.12)] bg-white/60 px-1.5 py-0.5 font-sans text-[10px] font-medium shadow-[0_1px_1px_rgba(0,0,0,0.03)] sm:inline-block">
            ⌘K
          </kbd>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
          <button
            type="button"
            className="text-ehs-gray hover:bg-ehs-light-bg inline-flex min-w-0 shrink-0 items-center gap-1.5 rounded-lg border border-[rgba(15,23,42,0.12)] bg-white px-2.5 py-2 text-[13px] shadow-sm transition-colors sm:px-3.5"
          >
            <Icon
              icon="mdi:calendar-range"
              className="text-sm"
              aria-hidden="true"
            />
            <span>March 25 — April 24, 2026</span>
            <Icon
              icon="mdi:chevron-down"
              className="text-xs"
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            className="hover:bg-ehs-light-bg relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[rgba(15,23,42,0.12)] bg-white shadow-sm transition-colors"
          >
            <Icon
              icon="mdi:bell-outline"
              className="text-ehs-gray text-lg"
              aria-hidden="true"
            />
            <span className="bg-ehs-red absolute top-1.5 right-1.5 size-2 rounded-full border-2 border-white" />
          </button>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <div className="text-ehs-muted-text flex flex-wrap items-center gap-1 text-[11px] font-semibold tracking-wide uppercase">
        <span
          onClick={() => router.push("/incidents/list")}
          className="hover:text-ehs-dark-bg cursor-pointer hover:underline"
        >
          Incidents
        </span>
        <Icon
          icon="mdi:chevron-right"
          className="text-ehs-muted-text size-3"
        />
        <span className="text-ehs-gray">{incidentId}</span>
      </div>

      {/* Page Title & Actions Toolbar */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-4">
        <Text
          as="h1"
          className="text-ehs-dark-bg text-[22px] font-bold tracking-tight"
        >
          {incidentId}
        </Text>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="tertiary"
            onClick={handleEdit}
            className="rounded-[10px] border border-[rgba(15,23,42,0.14)] bg-white px-4 py-2 text-[13px] font-bold text-[#2a3446] transition-colors hover:bg-white/70"
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleClose}
            className="rounded-[10px] bg-[#0891a6] px-4 py-2 text-[13px] font-bold text-white shadow-[0px_6px_18px_-6px_#0891a6] transition-colors hover:bg-[#067485]"
          >
            Close Incident
          </Button>
        </div>
      </div>

      {/* Horizontal Tabs List */}
      <div className="mt-4 flex scrollbar-none overflow-x-auto border-b border-[rgba(15,23,42,0.08)]">
        <nav className="flex gap-6 px-1 whitespace-nowrap">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={[
                  "border-b-2 py-2.5 text-[13px] font-semibold transition-all",
                  isActive
                    ? "border-[#0891a6] text-[#056e7e]"
                    : "text-ehs-gray hover:text-ehs-dark-bg border-transparent",
                ].join(" ")}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
