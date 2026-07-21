"use client";

import { useState } from "react";
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

export default function IncidentDetailPage() {
  const params = useParams();
  const incidentId =
    typeof params.id === "string" ? params.id : "—";

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
