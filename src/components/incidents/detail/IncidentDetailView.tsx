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
import { EmptyState } from "@/components/ui/EmptyState";
import { IncidentDetailClosureCard } from "@/components/incidents/detail/closure";
import { IncidentClosureSummaryCard } from "@/components/incidents/detail/closure";
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
import type { PeopleEditErrors } from "@/components/incidents/detail/people/people-edit-validation";
import type { PeoplePhotoIndex } from "@/components/incidents/detail/people/people-photos";
import { IncidentDetailHeader } from "@/components/incidents/detail/shared/IncidentDetailHeader";
import type { TabId } from "@/components/incidents/detail/shared/IncidentDetailHeader";
import { IncidentDetailResponseMetricsCard } from "@/components/incidents/detail/timeline/IncidentDetailResponseMetricsCard";
import { IncidentDetailTimelineCard } from "@/components/incidents/detail/timeline/IncidentDetailTimelineCard";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { useCapabilities } from "@/lib/capabilities";
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
  /** Resolved from the affected person's user record; falls back to the mapper's label. */
  affectedDisplayName: string;
  /** Their profile photo, when their user record carries one. */
  affectedProfileUrl: string | null;
  /** Roster photos for everyone else named on the incident, keyed by name. */
  peoplePhotos: PeoplePhotoIndex;
  affectedEmpId: string;
  affectedInjuryLabel: string;
  affectedInitials: string;
  bodyPart: string;
  treatment: string;
  daysAway: string;
  /** Read-only days-away value, sourced from the closure record. */
  daysAwayDisplay: string | number;
  responders: readonly ResponderMember[];
  witnesses: readonly WitnessRow[];
  onChangeBodyPart: (value: string) => void;
  onChangeTreatment: (value: string) => void;
  onChangeDaysAway: (value: string) => void;
  onAddWitness: () => void;
  onChangeWitness: (index: number, patch: Partial<WitnessRow>) => void;
  onRemoveWitness: (index: number) => void;
  /** Leading witnesses already on the record; locked against editing. */
  lockedWitnessCount: number;
  peopleErrors: PeopleEditErrors;

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
    affectedDisplayName,
    affectedProfileUrl,
    peoplePhotos,
    affectedEmpId,
    affectedInjuryLabel,
    bodyPart,
    treatment,
    daysAway,
    daysAwayDisplay,
    responders,
    witnesses,
    onChangeBodyPart,
    onChangeTreatment,
    onChangeDaysAway,
    onAddWitness,
    onChangeWitness,
    onRemoveWitness,
    lockedWitnessCount,
    peopleErrors,
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

  const { can } = useCapabilities();

  // Two independent rules, in this order. A closed incident offers no write control anywhere on
  // the screen — the API refuses every write against it, so an affordance could only ever end in
  // a failed request. While it is open, each control still answers to the capability its own
  // endpoint checks, so a role that cannot make the call is never shown the button that makes it.
  const isClosed = detail?.isClosed ?? false;
  const canUpdateIncident = !isClosed && can("Incident.Update");
  const canCreateCapa = !isClosed && can("CAPA.Create");
  // Adding a file takes BOTH. File.Upload alone is not enough — the preset matrix grants it to
  // Worker, so gating on it leaves the button up for a view-only role; the upload then succeeds
  // and the link to the incident (PUT /incident/{id}) is what 403s, orphaning the object in the
  // bucket.
  const canUploadFiles = canUpdateIncident && can("File.Upload");
  const canCloseIncident = can("Incident.Close");
  const canViewRca = can("Rca.View");

  // A tab whose content can only ever 403 is worse than no tab: it looks like a broken page
  // rather than a permission. Hidden here rather than inside each panel, so the tab strip and
  // the panel behind it cannot disagree about what exists.
  const hiddenTabs: TabId[] = [];
  if (!canViewRca) {
    // The RCA reads refuse outright — a different module, so Incident.View is never enough.
    hiddenTabs.push("investigation");
  }
  if (!canCloseIncident && !isClosed) {
    // Kept once closed: the summary is the record of what happened, and reading it needs nothing
    // beyond Incident.View. It is the unusable wizard on an open incident that is worth hiding.
    hiddenTabs.push("closure");
  }
  // Nothing stops a stale tab in state from pointing at one of those.
  const visibleTab: TabId = hiddenTabs.includes(activeTab)
    ? "details"
    : activeTab;

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-0 px-3 pb-8 sm:px-4">
        <IncidentDetailHeader
          incidentId={displayId}
          activeTab={visibleTab}
          hiddenTabs={hiddenTabs}
          onTabChange={onTabChange}
          onEdit={onEditOrSave}
          isEditing={isEditing}
          isSaving={isSaving}
          hideIncidentChrome={showHrca}
          // No longer disabled once closed: the tab now opens the read-only summary
          // instead of the wizard, so there is nothing to re-submit by reaching it.
          closureTabDisabled={false}
          readOnly={
            // A closed incident is read-only on every tab, not just the tabs that
            // never had an editor. The backend refuses the write either way now, so
            // leaving the button visible would only offer an action that 400s.
            (detail?.isClosed ?? false) ||
            // Without Incident.Update the PUT is a 403, so Edit is a dead end.
            !canUpdateIncident ||
            (visibleTab !== "details" &&
              visibleTab !== "people" &&
              visibleTab !== "attachments")
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
            {visibleTab === "details" && (
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
                  <IncidentDetailRoutingCard
                    peoplePhotos={peoplePhotos}
                    members={detail.routingMembers}
                  />
                  <IncidentDetailLinkedCard
                    linkedItems={mapCapaItemsToLinkedItems(linkedCapa.items, {
                      limit: 3,
                    })}
                    totalLinkedCount={linkedCapa.summary.totalCount}
                    isLoading={isCapaLoading}
                    // Withholding the handler is this card's own way of hiding the
                    // button, so an incident that is closed — or a role without
                    // CAPA.Create, which POST /capas refuses — is offered nothing.
                    onAddCapa={
                      canCreateCapa
                        ? () => onNavigateToLinkedCapa({ openAddModal: true })
                        : undefined
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

            {visibleTab === "timeline" && (
              <div className="mt-4.5 grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <IncidentDetailTimelineCard events={timelineEvents} />
                <div className="flex flex-col gap-3.5">
                  <IncidentDetailResponseMetricsCard
                    metrics={detail.responseMetrics}
                  />
                </div>
              </div>
            )}

            {visibleTab === "people" && (
              <div className="mt-4.5 grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <IncidentDetailPeopleCard
                  // The record stores only an id, so the person's real name is
                  // looked up and shown here; the mapper's placeholder is the
                  // fallback when that lookup finds nobody.
                  affectedName={
                    isEditingPeople ? affectedName : affectedDisplayName
                  }
                  affectedProfileUrl={affectedProfileUrl}
                  peoplePhotos={peoplePhotos}
                  hasAffectedPerson={detail.hasAffectedPerson}
                  affectedRole={detail.affectedRole}
                  affectedEmpId={
                    isEditingPeople ? affectedEmpId : detail.affectedEmpId
                  }
                  affectedInjuryLabel={
                    isEditingPeople
                      ? affectedInjuryLabel
                      : detail.affectedInjuryLabel
                  }
                  bodyPart={isEditingPeople ? bodyPart : detail.bodyPart}
                  treatment={isEditingPeople ? treatment : detail.treatment}
                  daysAway={isEditingPeople ? daysAway : daysAwayDisplay}
                  responders={isEditingPeople ? responders : detail.responders}
                  isEditing={isEditingPeople}
                  onChangeBodyPart={onChangeBodyPart}
                  onChangeTreatment={onChangeTreatment}
                  onChangeDaysAway={onChangeDaysAway}
                  bodyPartError={peopleErrors.bodyPart}
                  treatmentError={peopleErrors.treatment}
                  daysAwayError={peopleErrors.daysAway}
                />
                <div className="flex flex-col gap-3.5">
                  <IncidentDetailWitnessesCard
                    witnesses={witnesses}
                    isEditing={isEditingPeople}
                    onAddWitness={onAddWitness}
                    onChangeWitness={onChangeWitness}
                    onRemoveWitness={onRemoveWitness}
                    peoplePhotos={peoplePhotos}
                    lockedCount={lockedWitnessCount}
                    witnessErrors={peopleErrors.witnesses}
                  />
                  <IncidentDetailNotificationsCard />
                </div>
              </div>
            )}

            {visibleTab === "attachments" && (
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
                    // Add file needs File.Upload for the upload AND Incident.Update to link
                    // the result to the record. See canUploadFiles above.
                    readOnly={!canUploadFiles}
                    // Removable while simply viewing, not only inside the editor. Removal is
                    // written as an incident update, so it answers to Incident.Update and is off
                    // entirely once the incident is closed.
                    canDelete={canUpdateIncident}
                    embedded
                  />
                  <IncidentDetailFilesTable
                    attachments={attachments}
                    onSelectFile={onSelectFile}
                    onDeleteFile={onDeleteFile}
                    isEditing={isEditingAttachments}
                    canDelete={canUpdateIncident}
                    embedded
                  />
                </IncidentGlassCard>
                <div className="flex flex-col gap-3.5">
                  {/* The whole dropzone goes, not just its button: it accepts a drag and a
                      paste as well as a click, so leaving it visible would keep three ways to
                      start an upload the API will refuse. */}
                  {isEditingAttachments ? (
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
                  ) : canUploadFiles ? (
                    <IncidentDetailUploadCard
                      onUploadSuccess={onUploadSuccess}
                      onRegisterOpen={onRegisterUploadOpen}
                    />
                  ) : null}
                  <IncidentDetailStorageCard usedBytes={usedBytes} />
                </div>
              </div>
            )}

            {visibleTab === "investigation" &&
              (showHrca && incidentNumericId != null ? (
                <IncidentDetailHrcaBoard
                  incidentId={incidentNumericId}
                  queryEnabled={hrcaQueryEnabled}
                  onClose={onCloseHrca}
                  meta={investigation.hrcaMeta}
                  readOnly={detail.isClosed ?? false}
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
                    isIncidentClosed={detail.isClosed ?? false}
                  />
                  <div className="flex flex-col gap-3.5">
                    <IncidentDetailInvestigationStatusCard
                      steps={rcaInvestigationPreview?.statusSteps ?? []}
                      isLoading={isRcaInvestigationLoading}
                    />
                    <IncidentDetailSignOffCard
                      peoplePhotos={peoplePhotos}
                      signoffs={investigation.signoffs}
                    />
                  </div>
                </div>
              ))}

            {visibleTab === "linked-capa" && (
              <div className="mt-4.5 grid grid-cols-1 items-start gap-3.5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <IncidentDetailCapaListCard
                  incidentId={displayId}
                  incidentTitle={detail.title}
                  capas={linkedCapa.items}
                  isLoading={isCapaLoading}
                  isSubmitting={isCapaSubmitting}
                  isIncidentClosed={detail.isClosed}
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

            {/* Three states, not two. The summary card is for a closure that HAPPENED: it
                hardcodes a "Closed" badge and renders closedBy/closureDate, which on an open
                incident are draft defaults seeded from the current user and now — so reusing it
                for a viewer told them the incident was closed and named them as the closer.
                A viewer who cannot close an open incident gets neither the form nor that. */}
            {visibleTab === "closure" &&
              (detail.isClosed ? (
                <IncidentClosureSummaryCard data={closureData} />
              ) : !canCloseIncident ? (
                <EmptyState
                  variant="plain"
                  icon="mdi:lock-outline"
                  title="This incident is not closed"
                  message="Closing an incident needs the Incident.Close permission. Ask an EHS manager to close it, or to grant it to you."
                />
              ) : (
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
              ))}
          </>
        ) : null}
      </div>

      {previewFile ? (
        <FilePreviewModal file={previewFile} onClose={onClosePreview} />
      ) : null}
    </div>
  );
}
