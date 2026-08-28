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
import type { IncidentDetailResponseAction } from "@/components/incidents/detail/incident-detail-types";
import { IncidentDetailRoutingCard } from "@/components/incidents/detail/details/IncidentDetailRoutingCard";
import { IncidentDetailSummaryCard } from "@/components/incidents/detail/details/IncidentDetailSummaryCard";
import { FIELD_TEXTAREA_CLASS } from "@/components/ui/field-styles";
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
import type { CapaItem } from "@/components/incidents/detail/linked-capa/capa-types";
import type { CapaFormPayload } from "@/components/incidents/shared/capa/AddCapaModal";
import type { CapaTaskFormPayload } from "@/components/incidents/shared/capa/AddTaskModal";
import type { CapaEffectiveness } from "@/dtos/req/capa-verification-request.dto";
import { IncidentDetailCapaControlCoverageCard } from "@/components/incidents/detail/linked-capa/IncidentDetailCapaControlCoverageCard";
import { IncidentDetailCapaListCard } from "@/components/incidents/detail/linked-capa/IncidentDetailCapaListCard";
import { IncidentDetailCapaSummaryCard } from "@/components/incidents/detail/linked-capa/IncidentDetailCapaSummaryCard";
import { IncidentDetailNotificationsCard } from "@/components/incidents/detail/people/IncidentDetailNotificationsCard";
import { IncidentDetailPeopleCard } from "@/components/incidents/detail/people/IncidentDetailPeopleCard";
import { IncidentDetailWitnessesCard } from "@/components/incidents/detail/people/IncidentDetailWitnessesCard";
import { IncidentDetailHeader } from "@/components/incidents/detail/shared/IncidentDetailHeader";
import type { TabId } from "@/components/incidents/detail/shared/IncidentDetailHeader";
import { IncidentDetailResponseMetricsCard } from "@/components/incidents/detail/timeline/IncidentDetailResponseMetricsCard";
import { IncidentDetailTimelineCard } from "@/components/incidents/detail/timeline/IncidentDetailTimelineCard";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { SkeletonDetailPage } from "@/components/ui/skeletons";
import {
  mapCapaItemsToLinkedItems,
  type LinkedCapaViewModel,
} from "@/services/mappers/capa.mapper";
import type {
  IncidentDetailViewModel,
  IncidentInvestigationView,
} from "@/services/mappers/incident-detail.mapper";
import type { RcaInvestigationPreview } from "@/services/mappers/rca.mapper";

export type IncidentDetailViewProps = Readonly<{
  displayId: string;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onEditOrSave: () => void;
  isEditing: boolean;
  isSaving: boolean;

  errorMessage: string | null;
  showLoading: boolean;
  hasToken: boolean;
  canRetry: boolean;
  onRetry: () => void;

  detail: IncidentDetailViewModel | null;
  investigation: IncidentInvestigationView;
  rcaInvestigationPreview: RcaInvestigationPreview | null;
  isRcaInvestigationLoading: boolean;
  rcaInvestigationError: string | null;
  onRetryRca: () => void;
  incidentNumericId: number | null;
  hrcaQueryEnabled: boolean;
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
  responseActions: readonly IncidentDetailResponseAction[];
  onToggleResponseAction: (id: string) => void;
  infoItems: readonly IncidentDetailInfoItem[];
  onChangeInfoItem: (key: string, value: string) => void;

  timelineEvents: readonly TimelineEvent[];

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
  openAddCapaOnLinkedTab?: boolean;
  onAddCapaModalOpened?: () => void;
  onNavigateToLinkedCapa: (
    options?: Readonly<{ openAddModal?: boolean }>,
  ) => void;
  onSubmitCapa: (payload: CapaFormPayload) => void | Promise<void>;
  onUpdateCapa: (
    capa: CapaItem,
    payload: CapaFormPayload,
  ) => void | Promise<void>;
  isCreatingCapaTask?: boolean;
  onCreateCapaTask?: (
    capa: CapaItem,
    payload: CapaTaskFormPayload,
  ) => void | Promise<void>;
  isDeletingCapaTask?: boolean;
  onDeleteCapaTask?: (capa: CapaItem, taskId: number) => void | Promise<void>;
  isVerifyingCapa?: boolean;
  onVerifyCapa?: (
    capa: CapaItem,
    input: { effectiveness: CapaEffectiveness; notes: string },
  ) => void | Promise<void>;

  previewFile: AttachmentItem | null;
  onClosePreview: () => void;

  closureData: IncidentClosureData;
  onSelectClosureStep: (step: 1 | 2 | 3 | 4) => void;
  onChangeClosureField: <K extends keyof IncidentClosureData>(
    field: K,
    value: IncidentClosureData[K],
  ) => void;
  onToggleClosureCheckItem: (itemId: string) => void;
  onSaveClosureDraft?: () => void;
  onFinalizeClosure?: () => void;
  onCancelClosure?: () => void;
  isClosureSubmitting?: boolean;
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

    errorMessage,
    showLoading,
    hasToken,
    canRetry,
    onRetry,
    detail,
    investigation,
    rcaInvestigationPreview,
    isRcaInvestigationLoading,
    rcaInvestigationError,
    onRetryRca,
    incidentNumericId,
    hrcaQueryEnabled,
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
    responseActions,
    onToggleResponseAction,
    infoItems,
    onChangeInfoItem,
    timelineEvents,
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
    openAddCapaOnLinkedTab,
    onAddCapaModalOpened,
    onNavigateToLinkedCapa,
    onSubmitCapa,
    onUpdateCapa,
    isCreatingCapaTask,
    onCreateCapaTask,
    isDeletingCapaTask,
    onDeleteCapaTask,
    isVerifyingCapa,
    onVerifyCapa,
    previewFile,
    onClosePreview,
    closureData,
    onSelectClosureStep,
    onChangeClosureField,
    onToggleClosureCheckItem,
    onSaveClosureDraft,
    onFinalizeClosure,
    onCancelClosure,
    isClosureSubmitting,
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
          hideIncidentChrome={showHrca}
          closureTabDisabled={detail?.isClosed ?? false}
          readOnly={
            activeTab !== "details" &&
            activeTab !== "people" &&
            activeTab !== "attachments"
          }
        />

        {errorMessage ? (
          <IncidentGlassCard
            className="mt-4.5 min-h-45 text-center"
            incidentGlassCardClassName="items-center justify-center gap-2"
          >
            <Icon
              icon="mdi:alert-circle-outline"
              className="text-ehs-red size-8"
              aria-hidden="true"
            />
            <Text as="p" className="text-ehs-darker text4 font-semibold">
              Couldn’t load incident
            </Text>
            <Text as="p" className="text-ehs-muted-text text4 max-w-md">
              {errorMessage}
            </Text>
            {hasToken && canRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="border-ehs-border text-ehs-gray hover:bg-ehs-light-bg text4 bg-ehs-surface mt-1 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-semibold"
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
          <SkeletonDetailPage className="mt-4.5" />
        ) : null}

        {detail && !errorMessage && !showLoading ? (
          <>
            {activeTab === "details" && (
              <div className="mt-4.5 grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <div className="flex flex-col gap-3.5">
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
                    actions={responseActions}
                    isEditing={isEditingDetails}
                    onToggleAction={onToggleResponseAction}
                  />
                  {responseNotes || isEditingDetails ? (
                    <IncidentGlassCard
                      paddingClassName="p-5.75"
                      incidentGlassCardClassName="gap-3.25"
                      className={
                        isEditingDetails ? "ring-ehs-normal-blue/25 ring-1" : ""
                      }
                    >
                      <Text as="h3" className="text-ehs-dark-bg text3">
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
                          className={FIELD_TEXTAREA_CLASS}
                        />
                      ) : (
                        <Text
                          as="p"
                          className="text-ehs-slate text4 leading-[20.8px] whitespace-pre-wrap"
                        >
                          {responseNotes}
                        </Text>
                      )}
                    </IncidentGlassCard>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3.5">
                  <IncidentDetailRoutingCard members={detail.routingMembers} />
                  <IncidentDetailLinkedCard
                    linkedItems={mapCapaItemsToLinkedItems(linkedCapa.items, {
                      limit: 3,
                    })}
                    totalLinkedCount={linkedCapa.summary.totalCount}
                    isLoading={isCapaLoading}
                    onAddCapa={() =>
                      onNavigateToLinkedCapa({ openAddModal: true })
                    }
                    onViewAll={() => onNavigateToLinkedCapa()}
                    onSelectItem={() => onNavigateToLinkedCapa()}
                  />
                  {/* Renders nothing until an insight exists to pass in: no
                      endpoint generates one, and the card no longer invents
                      placeholder copy to fill the space. */}
                  <IncidentDetailAiCard />
                </div>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="mt-4.5 grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <IncidentDetailTimelineCard events={timelineEvents} />
                <div className="flex flex-col gap-3.5">
                  <IncidentDetailResponseMetricsCard
                    metrics={detail.responseMetrics}
                  />
                </div>
              </div>
            )}

            {activeTab === "people" && (
              <div className="mt-4.5 grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <IncidentDetailPeopleCard
                  affectedName={
                    isEditingPeople ? affectedName : detail.affectedName
                  }
                  hasAffectedPerson={detail.hasAffectedPerson}
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
                <div className="flex flex-col gap-3.5">
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
              <div className="mt-4.5 grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <IncidentGlassCard
                  paddingClassName="p-5.75"
                  incidentGlassCardClassName="gap-3.5"
                  className={
                    isEditingAttachments ? "ring-ehs-normal-blue/25 ring-1" : ""
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
                <div className="flex flex-col gap-3.5">
                  {!isEditingAttachments ? (
                    <IncidentDetailUploadCard
                      onUploadSuccess={onUploadSuccess}
                      onRegisterOpen={onRegisterUploadOpen}
                    />
                  ) : (
                    <IncidentGlassCard
                      paddingClassName="p-4.75"
                      incidentGlassCardClassName="gap-2"
                    >
                      <Text as="h3" className="text-ehs-dark-bg text3">
                        Delete files
                      </Text>
                      <span className="text-ehs-gray text4 leading-normal">
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
              (showHrca && incidentNumericId != null ? (
                <IncidentDetailHrcaBoard
                  incidentId={incidentNumericId}
                  queryEnabled={hrcaQueryEnabled}
                  onClose={onCloseHrca}
                  meta={investigation.hrcaMeta}
                />
              ) : showHrca ? (
                <div className="text-ehs-muted-text rounded-3 text4 border-ehs-border-ink/8 bg-ehs-surface/50 border px-4 py-10 text-center">
                  Sign in and open a valid incident to load the HRCA worksheet.
                </div>
              ) : (
                <div className="mt-4.5 grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                  <IncidentDetailInvestigationCard
                    whyChain={rcaInvestigationPreview?.whyChain ?? []}
                    contributingFactors={
                      rcaInvestigationPreview?.contributingFactors ?? []
                    }
                    methodLine={
                      rcaInvestigationPreview?.methodLine ??
                      investigation.methodLine
                    }
                    statusLabel={
                      rcaInvestigationPreview?.statusLabel ?? "Not started"
                    }
                    isLoading={isRcaInvestigationLoading}
                    errorMessage={rcaInvestigationError}
                    onRetry={onRetryRca}
                    onOpenHrca={onOpenHrca}
                  />
                  <div className="flex flex-col gap-3.5">
                    <IncidentDetailInvestigationStatusCard
                      steps={rcaInvestigationPreview?.statusSteps ?? []}
                      isLoading={isRcaInvestigationLoading}
                    />
                    <IncidentDetailSignOffCard
                      signoffs={investigation.signoffs}
                    />
                  </div>
                </div>
              ))}

            {activeTab === "linked-capa" && (
              <div className="mt-4.5 grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <IncidentDetailCapaListCard
                  incidentId={displayId}
                  incidentTitle={detail.title}
                  capas={linkedCapa.items}
                  isLoading={isCapaLoading}
                  isSubmitting={isCapaSubmitting}
                  openAddModal={openAddCapaOnLinkedTab}
                  onAddModalOpened={onAddCapaModalOpened}
                  onSubmitCapa={onSubmitCapa}
                  onUpdateCapa={onUpdateCapa}
                  isCreatingCapaTask={isCreatingCapaTask}
                  onCreateCapaTask={onCreateCapaTask}
                  isDeletingCapaTask={isDeletingCapaTask}
                  onDeleteCapaTask={onDeleteCapaTask}
                  isVerifying={isVerifyingCapa}
                  onVerifyCapa={onVerifyCapa}
                />
                <div className="flex flex-col gap-3.5">
                  <IncidentDetailCapaSummaryCard
                    totalCount={linkedCapa.summary.totalCount}
                    notStartedCount={linkedCapa.summary.notStartedCount}
                    inProgressCount={linkedCapa.summary.inProgressCount}
                    completedCount={linkedCapa.summary.completedCount}
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
                onCancel={onCancelClosure}
                isSubmitting={isClosureSubmitting}
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
