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
  | "linked-capa"
  | "closure";

export type IncidentDetailHeaderProps = Readonly<{
  incidentId: string;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onEdit?: () => void;
  /** When true, the Edit control shows as Save. */
  isEditing?: boolean;
  isSaving?: boolean;
  /** Hides Edit and treats the page as view-only. */
  readOnly?: boolean;
  /** Hides breadcrumb, incident title, edit toolbar, and tabs (HRCA worksheet view). */
  hideIncidentChrome?: boolean;
  /** When true, the Closure tab is not selectable (incident already closed). */
  closureTabDisabled?: boolean;
  isClosingIncident?: boolean;
  closeDisabled?: boolean;
  className?: string;
}>;

export function IncidentDetailHeader(
  props: Readonly<IncidentDetailHeaderProps>,
) {
  const {
    incidentId,
    activeTab,
    onTabChange,
    onEdit,
    isEditing = false,
    isSaving = false,
    readOnly = false,
    hideIncidentChrome = false,
    closureTabDisabled = false,
    isClosingIncident = false,
    closeDisabled = false,
    className = "",
  } = props;
  const router = useRouter();

  const handleEdit =
    onEdit ??
    (() => {
      toast.info("Edit mode coming soon", "This feature is being developed.");
    });

  const tabs: { id: TabId; label: string }[] = [
    { id: "details", label: "Details" },
    { id: "timeline", label: "Timeline" },
    { id: "people", label: "People" },
    { id: "attachments", label: "Attachments" },
    { id: "investigation", label: "Investigation" },
    { id: "linked-capa", label: "Linked CAPA" },
    { id: "closure", label: "Closure" },
  ];

  return (
    <div className={["flex flex-col", className].filter(Boolean).join(" ")}>
      {!hideIncidentChrome ? (
        <>
          {/* Breadcrumb Navigation */}
          <div className="text-ehs-muted-text flex flex-wrap items-center gap-1 text-xs font-medium">
            <span
              onClick={() => router.push("/dashboard/incidents/list")}
              className="hover:text-ehs-dark-bg cursor-pointer hover:underline"
            >
              Incidents
            </span>
            <Icon icon="mdi:chevron-right" className="text-ehs-muted-text size-3" />
            <span className="text-ehs-gray">{incidentId}</span>
          </div>

          {/* Page Title & Actions Toolbar */}
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-4">
            <Text
              as="h1"
              className="text-ehs-dark-bg text-2xl font-semibold tracking-[-0.2px]"
            >
              {incidentId}
            </Text>

            {activeTab !== "closure" ? (
              <div className="flex items-center gap-2">
                {!readOnly ? (
                  <Button
                    type="button"
                    variant={isEditing ? "primary" : "tertiary"}
                    onClick={handleEdit}
                    disabled={isSaving}
                    className={
                      isEditing
                        ? "bg-ehs-normal-blue text-ehs-light-text hover:bg-ehs-normal-blue-active rounded-[10px] px-4 py-2 text-sm font-medium shadow-[0px_6px_18px_-6px_var(--ehs-normal-blue)] transition-colors disabled:opacity-50"
                        : "text-ehs-slate rounded-[10px] border border-[rgba(15,23,42,0.14)] bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-white/70 disabled:opacity-50"
                    }
                  >
                    {isSaving ? "Saving…" : isEditing ? "Save" : "Edit"}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Horizontal Tabs List */}
          <div className="mt-4 flex scrollbar-none overflow-x-auto border-b border-[rgba(15,23,42,0.08)]">
            <nav className="flex gap-6 px-1 whitespace-nowrap">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const isDisabled =
                  tab.id === "closure" && closureTabDisabled;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) {
                        onTabChange(tab.id);
                      }
                    }}
                    aria-disabled={isDisabled || undefined}
                    title={
                      isDisabled
                        ? "Closure is unavailable for closed incidents"
                        : undefined
                    }
                    className={[
                      "border-b-2 py-2.5 text-sm font-semibold transition-all",
                      isDisabled
                        ? "text-ehs-muted-text/70 cursor-not-allowed border-transparent"
                        : isActive
                          ? "border-ehs-normal-blue text-ehs-dark-blue"
                          : "text-ehs-gray hover:text-ehs-dark-bg border-transparent",
                    ].join(" ")}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}
