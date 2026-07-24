"use client";

import { Icon } from "@iconify/react";
import { FilePreviewModal } from "@/components/incidents/detail/attachments/preview/FilePreviewModal";
import { IncidentDetailFilesTable } from "@/components/incidents/detail/attachments/IncidentDetailFilesTable";
import { IncidentDetailPhotosCard } from "@/components/incidents/detail/attachments/IncidentDetailPhotosCard";
import { IncidentDetailStorageCard } from "@/components/incidents/detail/attachments/IncidentDetailStorageCard";
import { IncidentDetailUploadCard } from "@/components/incidents/detail/attachments/IncidentDetailUploadCard";
import { IncidentDetailAiCard } from "@/components/incidents/detail/details/IncidentDetailAiCard";
import { IncidentDetailInfoCard } from "@/components/incidents/detail/details/IncidentDetailInfoCard";
import { IncidentDetailLinkedCard } from "@/components/incidents/detail/details/IncidentDetailLinkedCard";
import { IncidentDetailResponseCard } from "@/components/incidents/detail/details/IncidentDetailResponseCard";
import { IncidentDetailRoutingCard } from "@/components/incidents/detail/details/IncidentDetailRoutingCard";
import { IncidentDetailSummaryCard } from "@/components/incidents/detail/details/IncidentDetailSummaryCard";
import { IncidentDetailHrcaBoard } from "@/components/incidents/detail/investigations/IncidentDetailHrcaBoard";
import { IncidentDetailInvestigationCard } from "@/components/incidents/detail/investigations/IncidentDetailInvestigationCard";
import { IncidentDetailInvestigationStatusCard } from "@/components/incidents/detail/investigations/IncidentDetailInvestigationStatusCard";
import { IncidentDetailSignOffCard } from "@/components/incidents/detail/investigations/IncidentDetailSignOffCard";
import type {
  AttachmentItem,
  IncidentClosureData,
  IncidentDetailInfoItem,
  ResponderMember,
  TimelineEvent,
  WitnessRow,
} from "@/components/incidents/detail/incident-detail-types";
import { IncidentDetailClosureCard } from "@/components/incidents/detail/closure";
import { IncidentDetailCapaControlCoverageCard } from "@/components/incidents/detail/linked-capa/IncidentDetailCapaControlCoverageCard";
import { IncidentDetailCapaListCard } from "@/components/incidents/detail/linked-capa/IncidentDetailCapaListCard";
import { IncidentDetailCapaSummaryCard } from "@/components/incidents/detail/linked-capa/IncidentDetailCapaSummaryCard";
import { IncidentDetailNotificationsCard } from "@/components/incidents/detail/people/IncidentDetailNotificationsCard";
import { IncidentDetailPeopleCard } from "@/components/incidents/detail/people/IncidentDetailPeopleCard";
import { IncidentDetailWitnessesCard } from "@/components/incidents/detail/people/IncidentDetailWitnessesCard";
import { IncidentDetailHeader } from "@/components/incidents/detail/shared/IncidentDetailHeader";
import type { TabId } from "@/components/incidents/detail/shared/IncidentDetailHeader";
import { IncidentDetailAddTimelineCard } from "@/components/incidents/detail/timeline/IncidentDetailAddTimelineCard";
import { IncidentDetailResponseMetricsCard } from "@/components/incidents/detail/timeline/IncidentDetailResponseMetricsCard";
import { IncidentDetailTimelineCard } from "@/components/incidents/detail/timeline/IncidentDetailTimelineCard";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import type { LinkedCapaViewModel } from "@/services/mappers/capa.mapper";
import type {
  IncidentDetailViewModel,
  IncidentInvestigationView,
} from "@/services/mappers/incident-detail.mapper";

export type IncidentDetailViewProps = Readonly<{
  displayId: string;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onEditOrSave: () => void;
  isEditing: boolean;
  isSaving: boolean;
  onCloseIncident: () => void;
  isClosingIncident: boolean;
  closeDisabled: boolean;

  errorMessage: string | null;
  showLoading: boolean;
  hasToken: boolean;
  canRetry: boolean;
  onRetry: () => void;

  detail: IncidentDetailViewModel | null;
  investigation: IncidentInvestigationView;
  showHrca: boolean;
  onOpenHrca: () => void;
  onCloseHrca: () => void;

  isEditingDetails: boolean;
  isEditingPeople: boolean;
  isEditingAttachments: boolean;

  summaryText: string;
  onChangeSummary: (value: string) => void;
  responseNotes: string;
  onChangeResponseNotes: (value: string) => void;
  infoItems: readonly IncidentDetailInfoItem[];
  onChangeInfoItem: (key: string, value: string) => void;

  timelineEvents: readonly TimelineEvent[];
  onAddTimelinePost: (text: string) => void;

  affectedName: string;
  affectedEmpId: string;
  affectedInjuryLabel: string;
  affectedInitials: string;
  bodyPart: string;
  treatment: string;
  responders: readonly ResponderMember[];
  witnesses: readonly WitnessRow[];
  onChangeAffectedName: (value: string) => void;
  onChangeAffectedEmpId: (value: string) => void;
  onChangeAffectedInjuryLabel: (value: string) => void;
  onChangeBodyPart: (value: string) => void;
  onChangeTreatment: (value: string) => void;
  onChangeResponder: (index: number, patch: Partial<ResponderMember>) => void;
  onAddWitness: () => void;
  onChangeWitness: (index: number, patch: Partial<WitnessRow>) => void;
  onRemoveWitness: (index: number) => void;

  attachments: readonly AttachmentItem[];
  usedBytes: number;
  onSelectFile: (file: AttachmentItem) => void;
  onAddFile: () => void;
  onDeleteFile: (file: AttachmentItem) => void;
  onUploadSuccess: (item: AttachmentItem) => void | Promise<void>;
  onRegisterUploadOpen: (open: () => void) => void;

  linkedCapa: LinkedCapaViewModel;
  isCapaLoading: boolean;
  isCapaSubmitting: boolean;
  onSubmitCapa: (payload: {
    controlLevel: string;
    description: string;
    type: string;
    owner: string;
    dueDate: string;
    priority: string;
  }) => void | Promise<void>;

  previewFile: AttachmentItem | null;
  onClosePreview: () => void;

  closureData: IncidentClosureData;
  onSelectClosureStep: (step: 1 | 2 | 3 | 4) => void;
  onChangeClosureField: <K extends keyof IncidentClosureData>(
    field: K,
    value: IncidentClosureData[K]
  ) => void;
  onToggleClosureCheckItem: (itemId: string) => void;
  onSaveClosureDraft?: () => void;
  onFinalizeClosure?: () => void;
}>;

/**
 * Presentational detail shell (near-miss DetailView pattern).
 * All data fetching / mutations stay in IncidentDetailContent.
 */
export function IncidentDetailView(props: Readonly<IncidentDetailViewProps>) {
  const {
    displayId,
    activeTab,
    onTabChange,
    onEditOrSave,
    isEditing,
    isSaving,
    onCloseIncident,
    isClosingIncident,
    closeDisabled,
    errorMessage,
    showLoading,
    hasToken,
    canRetry,
    onRetry,
    detail,
    investigation,
    showHrca,
    onOpenHrca,
    onCloseHrca,
    isEditingDetails,
    isEditingPeople,
    isEditingAttachments,
    summaryText,
    onChangeSummary,
    responseNotes,
    onChangeResponseNotes,
    infoItems,
    onChangeInfoItem,
    timelineEvents,
    onAddTimelinePost,
    affectedName,
    affectedEmpId,
    affectedInjuryLabel,
    affectedInitials,
    bodyPart,
    treatment,
    responders,
    witnesses,
    onChangeAffectedName,
    onChangeAffectedEmpId,
    onChangeAffectedInjuryLabel,
    onChangeBodyPart,
    onChangeTreatment,
    onChangeResponder,
    onAddWitness,
    onChangeWitness,
    onRemoveWitness,
    attachments,
    usedBytes,
    onSelectFile,
    onAddFile,
    onDeleteFile,
    onUploadSuccess,
    onRegisterUploadOpen,
    linkedCapa,
    isCapaLoading,
    isCapaSubmitting,
    onSubmitCapa,
    previewFile,
    onClosePreview,
    closureData,
    onSelectClosureStep,
    onChangeClosureField,
    onToggleClosureCheckItem,
    onSaveClosureDraft,
    onFinalizeClosure,
  } = props;

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-0 px-3 pb-8 sm:px-4">
        <IncidentDetailHeader
          incidentId={displayId}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onEdit={onEditOrSave}
          isEditing={isEditing}
          isSaving={isSaving}
          readOnly={
            activeTab !== "details" &&
            activeTab !== "people" &&
            activeTab !== "attachments"
          }
          onCloseIncident={onCloseIncident}
          isClosingIncident={isClosingIncident}
          closeDisabled={closeDisabled}
        />

        {errorMessage ? (
          <IncidentGlassCard className="mt-[18px] min-h-[180px] items-center justify-center gap-2 text-center">
            <Icon
              icon="mdi:alert-circle-outline"
              className="text-ehs-red size-8"
              aria-hidden="true"
            />
            <Text as="p" className="text-ehs-darker text-sm font-semibold">
              Couldn’t load incident
            </Text>
            <Text as="p" className="text-ehs-muted-text max-w-md text-sm">
              {errorMessage}
            </Text>
            {hasToken && canRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="border-ehs-border text-ehs-gray hover:bg-ehs-light-bg mt-1 inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-[13px] font-semibold"
              >
                <Icon
                  icon="mdi:refresh"
                  className="size-4"
                  aria-hidden="true"
                />
                Retry
              </button>
            ) : null}
          </IncidentGlassCard>
        ) : null}

        {showLoading && !errorMessage ? (
          <IncidentGlassCard className="mt-[18px] min-h-[240px] items-center justify-center gap-2">
            <Icon
              icon="mdi:loading"
              className="text-ehs-dark-blue size-7 animate-spin"
              aria-hidden="true"
            />
            <Text as="p" className="text-ehs-muted-text text-sm">
              Loading incident details…
            </Text>
          </IncidentGlassCard>
        ) : null}

        {detail && !errorMessage && !showLoading ? (
          <>
            {activeTab === "details" && (
              <div className="mt-[18px] grid grid-cols-1 items-start gap-[14px] xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <div className="flex flex-col gap-[14px]">
                  <IncidentDetailSummaryCard
                    summaryText={summaryText}
                    isEditing={isEditingDetails}
                    onChangeSummary={onChangeSummary}
                  />
                  <IncidentDetailInfoCard
                    items={infoItems}
                    isEditing={isEditingDetails}
                    onChangeItem={onChangeInfoItem}
                  />
                  <IncidentDetailResponseCard
                    actions={detail.responseActions}
                  />
                  {responseNotes || isEditingDetails ? (
                    <IncidentGlassCard
                      paddingClassName="p-[23px]"
                      incidentGlassCardClassName="gap-[13px]"
                      className={
                        isEditingDetails ? "ring-1 ring-[#0891a6]/25" : ""
                      }
                    >
                      <Text
                        as="h3"
                        className="text-[14px] leading-normal font-bold tracking-[-0.14px] text-[#0b1320]"
                      >
                        Response notes
                      </Text>
                      {isEditingDetails ? (
                        <textarea
                          value={responseNotes}
                          onChange={(event) =>
                            onChangeResponseNotes(event.target.value)
                          }
                          rows={4}
                          placeholder="Add response notes…"
                          className="min-h-[100px] w-full resize-y rounded-[12px] border border-[rgba(15,23,42,0.12)] bg-white px-3.5 py-3 text-[13px] leading-[20.8px] text-[#2a3446] transition outline-none focus:border-[#0891a6] focus:ring-2 focus:ring-[#0891a6]/20"
                        />
                      ) : (
                        <Text
                          as="p"
                          className="text-[13px] leading-[20.8px] whitespace-pre-wrap text-[#2a3446]"
                        >
                          {responseNotes}
                        </Text>
                      )}
                    </IncidentGlassCard>
                  ) : null}
                </div>

                <div className="flex flex-col gap-[14px]">
                  <IncidentDetailRoutingCard members={detail.routingMembers} />
                  <IncidentDetailLinkedCard />
                  <IncidentDetailAiCard />
                </div>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="mt-[18px] grid grid-cols-1 items-start gap-[14px] xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <IncidentDetailTimelineCard events={timelineEvents} />
                <div className="flex flex-col gap-[14px]">
                  <IncidentDetailResponseMetricsCard
                    metrics={detail.responseMetrics}
                  />
                  <IncidentDetailAddTimelineCard
                    onAddPost={onAddTimelinePost}
                  />
                </div>
              </div>
            )}

            {activeTab === "people" && (
              <div className="mt-[18px] grid grid-cols-1 items-start gap-[14px] xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <IncidentDetailPeopleCard
                  affectedName={
                    isEditingPeople ? affectedName : detail.affectedName
                  }
                  affectedRole={detail.affectedRole}
                  affectedEmpId={
                    isEditingPeople ? affectedEmpId : detail.affectedEmpId
                  }
                  affectedInitials={
                    isEditingPeople ? affectedInitials : detail.affectedInitials
                  }
                  affectedInjuryLabel={
                    isEditingPeople
                      ? affectedInjuryLabel
                      : detail.affectedInjuryLabel
                  }
                  bodyPart={isEditingPeople ? bodyPart : detail.bodyPart}
                  treatment={isEditingPeople ? treatment : detail.treatment}
                  daysAway={detail.daysAway}
                  responders={isEditingPeople ? responders : detail.responders}
                  isEditing={isEditingPeople}
                  onChangeAffectedName={onChangeAffectedName}
                  onChangeAffectedEmpId={onChangeAffectedEmpId}
                  onChangeAffectedInjuryLabel={onChangeAffectedInjuryLabel}
                  onChangeBodyPart={onChangeBodyPart}
                  onChangeTreatment={onChangeTreatment}
                  onChangeResponder={onChangeResponder}
                />
                <div className="flex flex-col gap-[14px]">
                  <IncidentDetailWitnessesCard
                    witnesses={witnesses}
                    isEditing={isEditingPeople}
                    onAddWitness={onAddWitness}
                    onChangeWitness={onChangeWitness}
                    onRemoveWitness={onRemoveWitness}
                  />
                  <IncidentDetailNotificationsCard />
                </div>
              </div>
            )}

            {activeTab === "attachments" && (
              <div className="mt-[18px] grid grid-cols-1 items-start gap-[14px] xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <IncidentGlassCard
                  paddingClassName="p-[23px]"
                  incidentGlassCardClassName="gap-[14px]"
                  className={
                    isEditingAttachments ? "ring-1 ring-[#0891a6]/25" : ""
                  }
                >
                  <IncidentDetailPhotosCard
                    attachments={attachments}
                    onSelectFile={onSelectFile}
                    onAddFile={onAddFile}
                    onDeleteFile={onDeleteFile}
                    isEditing={isEditingAttachments}
                    embedded
                  />
                  <IncidentDetailFilesTable
                    attachments={attachments}
                    onSelectFile={onSelectFile}
                    onDeleteFile={onDeleteFile}
                    isEditing={isEditingAttachments}
                    embedded
                  />
                </IncidentGlassCard>
                <div className="flex flex-col gap-[14px]">
                  {!isEditingAttachments ? (
                    <IncidentDetailUploadCard
                      onUploadSuccess={onUploadSuccess}
                      onRegisterOpen={onRegisterUploadOpen}
                    />
                  ) : (
                    <IncidentGlassCard
                      paddingClassName="p-[19px]"
                      incidentGlassCardClassName="gap-2"
                    >
                      <Text
                        as="h3"
                        className="text-[14px] leading-normal font-bold tracking-[-0.14px] text-[#0b1320]"
                      >
                        Delete files
                      </Text>
                      <span className="text-[12px] leading-normal text-[#566072]">
                        Remove photos or documents, then click Save. Uploads are
                        disabled while editing.
                      </span>
                    </IncidentGlassCard>
                  )}
                  <IncidentDetailStorageCard usedBytes={usedBytes} />
                </div>
              </div>
            )}

            {activeTab === "investigation" &&
              (showHrca ? (
                <IncidentDetailHrcaBoard
                  onClose={onCloseHrca}
                  meta={investigation.hrcaMeta}
                  initialRows={investigation.hrcaRows}
                  incidentLabel={displayId}
                />
              ) : (
                <div className="mt-[18px] grid grid-cols-1 items-start gap-[14px] xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                  <IncidentDetailInvestigationCard
                    whyChain={investigation.whyChain}
                    contributingFactors={investigation.hrcaRows.map((row) => ({
                      category: row.category,
                      text: row.contributingFactor,
                      accent: row.accent,
                    }))}
                    methodLine={investigation.methodLine}
                    statusLabel={investigation.statusLabel}
                    onOpenHrca={onOpenHrca}
                  />
                  <div className="flex flex-col gap-[14px]">
                    <IncidentDetailInvestigationStatusCard
                      steps={investigation.statusSteps}
                    />
                    <IncidentDetailSignOffCard
                      signoffs={investigation.signoffs}
                    />
                  </div>
                </div>
              ))}

            {activeTab === "linked-capa" && (
              <div className="mt-[18px] grid grid-cols-1 items-start gap-[14px] xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <IncidentDetailCapaListCard
                  incidentId={displayId}
                  incidentTitle={detail.title}
                  capas={linkedCapa.items}
                  isLoading={isCapaLoading}
                  isSubmitting={isCapaSubmitting}
                  onSubmitCapa={onSubmitCapa}
                />
                <div className="flex flex-col gap-[14px]">
                  <IncidentDetailCapaSummaryCard
                    totalCount={linkedCapa.summary.totalCount}
                    inProgressCount={linkedCapa.summary.inProgressCount}
                    verifiedCount={linkedCapa.summary.verifiedCount}
                    planningCount={linkedCapa.summary.planningCount}
                    isLoading={isCapaLoading}
                  />
                  <IncidentDetailCapaControlCoverageCard
                    hierarchyControls={linkedCapa.hierarchy}
                    noticeMessage={linkedCapa.noticeMessage}
                    isLoading={isCapaLoading}
                  />
                </div>
              </div>
            )}

            {activeTab === "closure" && (
              <IncidentDetailClosureCard
                data={closureData}
                onSelectStep={onSelectClosureStep}
                onChangeField={onChangeClosureField}
                onToggleCheckItem={onToggleClosureCheckItem}
                onSaveAsDraft={onSaveClosureDraft}
                onFinalizeClosure={onFinalizeClosure}
              />
            )}
          </>
        ) : null}
      </div>

      {previewFile ? (
        <FilePreviewModal file={previewFile} onClose={onClosePreview} />
      ) : null}
    </div>
  );
}
