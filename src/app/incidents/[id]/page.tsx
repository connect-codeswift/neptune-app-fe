"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  IncidentDetailHeader,
  IncidentDetailSummaryCard,
  IncidentDetailInfoCard,
  IncidentDetailResponseCard,
  IncidentDetailRoutingCard,
  IncidentDetailLinkedCard,
  IncidentDetailAiCard,
  IncidentDetailTimelineCard,
  IncidentDetailResponseMetricsCard,
  IncidentDetailAddTimelineCard,
  IncidentDetailPeopleCard,
  IncidentDetailWitnessesCard,
  IncidentDetailNotificationsCard,
  IncidentDetailPhotosCard,
  IncidentDetailFilesTable,
  IncidentDetailUploadCard,
  IncidentDetailStorageCard,
  FilePreviewModal,
  IncidentDetailInvestigationCard,
  IncidentDetailInvestigationStatusCard,
  IncidentDetailSignOffCard,
  IncidentDetailHrcaBoard,
  IncidentDetailCapaListCard,
  IncidentDetailCapaSummaryCard,
  IncidentDetailCapaControlCoverageCard,
  type AttachmentItem,
  type TabId,
} from "@/components/incidents/detail";
import type { ReportIncidentFormState } from "@/components/incidents/report/shared/report-incident-data";

export default function IncidentDetailPage() {
  const params = useParams();
  const incidentId =
    typeof params.id === "string" ? params.id : "INC-2025-DET-001";

  const [activeTab, setActiveTab] = useState<TabId>("details");
  const [showHrca, setShowHrca] = useState(false);
  const [previewFile, setPreviewFile] = useState<AttachmentItem | null>(null);

  // Reactive State variables populated from localStorage
  const [summaryText, setSummaryText] = useState(
    "No incident summary description loaded.",
  );

  const [infoItems, setInfoItems] = useState<
    readonly { label: string; value: string }[]
  >([]);

  const [responseActions, setResponseActions] = useState<
    readonly { id: string; label: string; completed: boolean }[]
  >([
    { id: "area-cordoned", label: "Area cordoned off", completed: false },
    { id: "loto", label: "Equipment locked out (LOTO)", completed: false },
    { id: "first-aid", label: "First aid administered", completed: false },
    {
      id: "supervisor-notified",
      label: "Supervisor notified",
      completed: false,
    },
    { id: "spill-contained", label: "Spill contained", completed: false },
    { id: "photos-captured", label: "Photos captured", completed: false },
  ]);

  const [affectedName, setAffectedName] = useState("No affected person logged");
  const [affectedRole, setAffectedRole] = useState("N/A");
  const [affectedEmpId, setAffectedEmpId] = useState("N/A");
  const [bodyPart, setBodyPart] = useState("—");
  const [treatment, setTreatment] = useState("None");
  const [daysAway, setDaysAway] = useState<string | number>(0);

  const [witnessList, setWitnessList] = useState<
    readonly {
      name: string;
      role: string;
      initials: string;
      badgeLabel: string;
      badgeTone: "green" | "gray";
    }[]
  >([]);

  const [attachments, setAttachments] = useState<readonly AttachmentItem[]>([]);

  // Load uploaded items and metadata from localStorage upon mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("reported_incident_form");
      if (stored) {
        try {
          const form = JSON.parse(stored) as ReportIncidentFormState;

          // 1. Sync attachments (Fetch uploaded files from report uploader)
          if (
            form.photos &&
            Array.isArray(form.photos) &&
            form.photos.length > 0
          ) {
            const mappedPhotos: readonly AttachmentItem[] = form.photos.map(
              (p) => {
                let kind: "image" | "video" | "pdf" = "pdf";
                if (
                  p.kind === "image" ||
                  p.resourceType === "image" ||
                  p.mimeType?.startsWith("image/")
                ) {
                  kind = "image";
                } else if (
                  p.kind === "video" ||
                  p.resourceType === "video" ||
                  p.mimeType?.startsWith("video/")
                ) {
                  kind = "video";
                }

                return {
                  id: p.id || String(Math.random()),
                  name: p.name || "uploaded_file",
                  description: `Uploaded during report - ${
                    p.name?.replace(/\.[^.]+$/, "") || "file"
                  }`,
                  sizeLabel: p.sizeLabel || "0 KB",
                  bytes: p.bytes || 0,
                  addedBy: form.reportedBy || "Maria Lopez",
                  time: form.incidentTime || "09:14",
                  secureUrl: p.secureUrl || p.url,
                  kind,
                };
              },
            );
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAttachments(mappedPhotos);
          }

          // 2. Sync incident description text
          if (form.description) {
            setSummaryText(form.description);
          }

          // 3. Sync incident details grid info
          if (form.location || form.objectInvolved || form.reportedBy) {
            const affectedSplit = (
              form.affectedPerson || "Maria Lopez · EMP-04821"
            ).split("·");
            const opName = affectedSplit[0]?.trim() || "Maria Lopez";
            const opId = affectedSplit[1]?.trim() || "EMP-04821";

            setInfoItems([
              {
                label: "Equipment",
                value:
                  form.objectInvolved || "Hydraulic Press #4 - ASSET-PRS-014",
              },
              { label: "Energy involved", value: "Hydraulic - 2,800 psi" },
              { label: "Hose age", value: "14 months (warranty: 24)" },
              { label: "Last inspection", value: "2026-03-12 (passed)" },
              { label: "Operator on shift", value: `${opName} - ${opId}` },
              { label: "Supervisor", value: form.reportedBy || "Alicia Chen" },
              { label: "Weather", value: "Indoor - n/a" },
              { label: "Lighting", value: "Adequate" },
            ]);

            // Sync affected person details
            setAffectedName(opName);
            setAffectedRole("Operator - Plant A - Press");
            setAffectedEmpId(opId);
          }

          // 4. Sync immediate response checkboxes
          if (form.immediateActions && Array.isArray(form.immediateActions)) {
            const actions = [
              { id: "area-cordoned", label: "Area cordoned off" },
              { id: "loto", label: "Equipment locked out (LOTO)" },
              { id: "first-aid", label: "First aid administered" },
              { id: "supervisor-notified", label: "Supervisor notified" },
              { id: "spill-contained", label: "Spill contained" },
              { id: "photos-captured", label: "Photos captured" },
            ].map((act) => ({
              ...act,
              completed: form.immediateActions.includes(act.id),
            }));
            setResponseActions(actions);
          }

          // 5. Sync injury details
          if (form.injuryLevel) {
            setTreatment(
              form.injuryLevel === "no-injury"
                ? "None required"
                : "First aid administered",
            );
          }
          if (form.bodyParts && Array.isArray(form.bodyParts)) {
            setBodyPart(form.bodyParts.join(", ") || "—");
          }

          // 6. Sync witnesses
          if (form.witnesses) {
            const list = form.witnesses.split(",").map((name: string) => {
              const cleaned = name.trim();
              const initials = cleaned
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase();
              return {
                name: cleaned,
                role: "Incident Witness",
                initials: initials || "W",
                badgeLabel: "Statement",
                badgeTone: "green" as const,
              };
            });
            setWitnessList(list);
          }
        } catch (e) {
          console.error("Failed to parse incident form state:", e);
        }
      }
    }
  }, []);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setShowHrca(false);
  };

  const handleUploadSuccess = (item: AttachmentItem) => {
    setAttachments((prev) => [...prev, item]);
  };

  const usedBytes = attachments.reduce((sum, item) => sum + item.bytes, 0);

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-0 px-3 pb-8 sm:px-4">
        {/* Header containing search bar, quick controls, breadcrumbs, titles and navigation tabs */}
        <IncidentDetailHeader
          incidentId={incidentId}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Tab-based View Content Layout */}
        {activeTab === "details" && (
          <div className="mt-[18px] grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[1fr_340px]">
            {/* Left Content Column */}
            <div className="flex flex-col gap-[18px]">
              <IncidentDetailSummaryCard summaryText={summaryText} />
              <IncidentDetailInfoCard items={infoItems} />
              <IncidentDetailResponseCard actions={responseActions} />
            </div>

            {/* Right Sidebar Column */}
            <div className="flex flex-col gap-[18px]">
              <IncidentDetailRoutingCard />
              <IncidentDetailLinkedCard />
              <IncidentDetailAiCard />
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="mt-[18px] grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[1fr_340px]">
            {/* Left Column (Timeline list) */}
            <div className="flex flex-col gap-[18px]">
              <IncidentDetailTimelineCard />
            </div>

            {/* Right Sidebar Column */}
            <div className="flex flex-col gap-[18px]">
              <IncidentDetailResponseMetricsCard />
              <IncidentDetailAddTimelineCard />
            </div>
          </div>
        )}

        {activeTab === "people" && (
          <div className="mt-[18px] grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[1fr_340px]">
            {/* Left Column (People details & Responders) */}
            <div className="flex flex-col gap-[18px]">
              <IncidentDetailPeopleCard
                affectedName={affectedName}
                affectedRole={affectedRole}
                affectedEmpId={affectedEmpId}
                bodyPart={bodyPart}
                treatment={treatment}
                daysAway={daysAway}
              />
            </div>

            {/* Right Sidebar Column */}
            <div className="flex flex-col gap-[18px]">
              <IncidentDetailWitnessesCard witnesses={witnessList} />
              <IncidentDetailNotificationsCard />
            </div>
          </div>
        )}

        {activeTab === "attachments" && (
          <div className="mt-[18px] grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[1fr_340px]">
            {/* Left Column (Photos, Video and All Files list) */}
            <div className="flex flex-col gap-[18px]">
              <IncidentDetailPhotosCard
                attachments={attachments}
                onSelectFile={setPreviewFile}
              />
              <IncidentDetailFilesTable
                attachments={attachments}
                onSelectFile={setPreviewFile}
              />
            </div>

            {/* Right Sidebar Column */}
            <div className="flex flex-col gap-[18px]">
              <IncidentDetailUploadCard onUploadSuccess={handleUploadSuccess} />
              <IncidentDetailStorageCard usedBytes={usedBytes} />
            </div>
          </div>
        )}

        {activeTab === "investigation" &&
          (showHrca ? (
            <IncidentDetailHrcaBoard onClose={() => setShowHrca(false)} />
          ) : (
            <div className="mt-[18px] grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[1fr_340px]">
              {/* Left Column (5-Whys and Why-chain mapping) */}
              <div className="flex flex-col gap-[18px]">
                <IncidentDetailInvestigationCard
                  onOpenHrca={() => setShowHrca(true)}
                />
              </div>

              {/* Right Sidebar Column */}
              <div className="flex flex-col gap-[18px]">
                <IncidentDetailInvestigationStatusCard />
                <IncidentDetailSignOffCard />
              </div>
            </div>
          ))}

        {activeTab === "linked-capa" && (
          <div className="mt-[18px] grid grid-cols-1 items-start gap-[18px] xl:grid-cols-[1fr_340px]">
            {/* Left Column (Linked CAPA Actions List) */}
            <div className="flex flex-col gap-[18px]">
              <IncidentDetailCapaListCard />
            </div>

            {/* Right Sidebar Column */}
            <div className="flex flex-col gap-[18px]">
              <IncidentDetailCapaSummaryCard />
              <IncidentDetailCapaControlCoverageCard />
            </div>
          </div>
        )}

        {activeTab !== "details" &&
          activeTab !== "timeline" &&
          activeTab !== "people" &&
          activeTab !== "attachments" &&
          activeTab !== "investigation" &&
          activeTab !== "linked-capa" && (
            <div className="mt-6 flex min-h-[200px] items-center justify-center rounded-[12px] border border-[rgba(15,23,42,0.06)] bg-white/42 p-6">
              <span className="text-ehs-muted-text text-[13px]">
                Content for this tab is coming soon.
              </span>
            </div>
          )}
      </div>

      {/* Lightbox popover previewer for images, videos, and PDFs */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}
