"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import {
  FilePreviewModal,
  IncidentDetailAddTimelineCard,
  IncidentDetailAiCard,
  IncidentDetailCapaControlCoverageCard,
  IncidentDetailCapaListCard,
  IncidentDetailCapaSummaryCard,
  IncidentDetailFilesTable,
  IncidentDetailHeader,
  IncidentDetailHrcaBoard,
  IncidentDetailInfoCard,
  IncidentDetailInvestigationCard,
  IncidentDetailInvestigationStatusCard,
  IncidentDetailLinkedCard,
  IncidentDetailNotificationsCard,
  IncidentDetailPeopleCard,
  IncidentDetailPhotosCard,
  IncidentDetailResponseCard,
  IncidentDetailResponseMetricsCard,
  IncidentDetailRoutingCard,
  IncidentDetailSignOffCard,
  IncidentDetailStorageCard,
  IncidentDetailSummaryCard,
  IncidentDetailTimelineCard,
  IncidentDetailUploadCard,
  IncidentDetailWitnessesCard,
  type AttachmentItem,
  type IncidentDetailInfoItem,
  type ResponderMember,
  type TabId,
  type TimelineEvent,
  type WitnessRow,
} from "@/components/incidents/detail";
import { Text } from "@/components/Text";
import { IncidentGlassCard } from "@/components/incidents/shared/IncidentGlassCard";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import { useCreateCapaMutation } from "@/hooks/use-capa-mutations";
import { useCapasByIncidentQuery } from "@/hooks/use-capa-queries";
import {
  useCloseIncidentMutation,
  useUpdateIncidentMutation,
} from "@/hooks/use-incident-mutations";
import { useIncidentByIdQuery } from "@/hooks/use-incident-queries";
import { getAccessToken } from "@/lib/axios";
import { formatFileSize } from "@/lib/cloudinary-constants";
import { fetchRemoteFileMeta } from "@/lib/fetch-remote-file-bytes";
import { formatShortDateTime } from "@/lib/format-short-date-time";
import { toast } from "@/lib/toast";
import { EMPTY_LINKED_CAPA_VIEW } from "@/services/mappers/capa.mapper";
import {
  applyAttachmentsEditDraft,
  applyDetailEditDraft,
  applyPeopleEditDraft,
} from "@/services/mappers/incident-detail-edit.mapper";
import {
  EMPTY_INCIDENT_INVESTIGATION,
  parseIncidentRouteId,
} from "@/services/mappers/incident-detail.mapper";

export type IncidentDetailContentProps = Readonly<{
  /** Route param: numeric id or `INC-{id}`. */
  incidentIdParam: string;
}>;

type EditScope = "details" | "people" | "attachments";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "—";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function IncidentDetailContent(
  props: Readonly<IncidentDetailContentProps>,
) {
  const { incidentIdParam } = props;
  const numericId = parseIncidentRouteId(incidentIdParam);

  const [activeTab, setActiveTab] = useState<TabId>("details");
  const [showHrca, setShowHrca] = useState(false);
  const [previewFile, setPreviewFile] = useState<AttachmentItem | null>(null);
  const [isClientReady, setIsClientReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [attachments, setAttachments] = useState<readonly AttachmentItem[]>([]);
  const [witnesses, setWitnesses] = useState<readonly WitnessRow[]>([]);
  const [responders, setResponders] = useState<readonly ResponderMember[]>([]);
  const [affectedName, setAffectedName] = useState("");
  const [affectedEmpId, setAffectedEmpId] = useState("");
  const [affectedInjuryLabel, setAffectedInjuryLabel] = useState("");
  const [bodyPart, setBodyPart] = useState("");
  const [treatment, setTreatment] = useState("");
  const [timelineEvents, setTimelineEvents] = useState<
    readonly TimelineEvent[]
  >([]);
  const [summaryText, setSummaryText] = useState("");
  const [responseNotes, setResponseNotes] = useState("");
  const [infoItems, setInfoItems] = useState<readonly IncidentDetailInfoItem[]>(
    [],
  );
  const [editScope, setEditScope] = useState<EditScope | null>(null);
  const openUploadPickerRef = useRef<(() => void) | null>(null);

  const isEditingDetails = editScope === "details";
  const isEditingPeople = editScope === "people";
  const isEditingAttachments = editScope === "attachments";
  const isEditing = editScope != null;

  const registerUploadOpen = useCallback((open: () => void) => {
    openUploadPickerRef.current = open;
  }, []);

  useEffect(() => {
    setHasToken(Boolean(getAccessToken()));
    setIsClientReady(true);
  }, []);

  const detailQuery = useIncidentByIdQuery({
    id: numericId,
    enabled: isClientReady && hasToken && numericId != null,
  });
  const closeIncidentMutation = useCloseIncidentMutation();
  const updateIncidentMutation = useUpdateIncidentMutation();
  const createCapaMutation = useCreateCapaMutation();

  const detail = detailQuery.data?.detail ?? null;
  const incidentDto = detailQuery.data?.dto ?? null;

  const capaQuery = useCapasByIncidentQuery({
    incidentId: detail?.numericId ?? numericId,
    enabled:
      isClientReady &&
      hasToken &&
      (detail?.numericId != null || numericId != null),
  });
  const linkedCapa = capaQuery.data ?? EMPTY_LINKED_CAPA_VIEW;
  // Guard stale React Query cache from before investigation was mapped.
  const investigation = detail?.investigation ?? EMPTY_INCIDENT_INVESTIGATION;
  const displayId =
    detail?.displayId ??
    (numericId != null ? `INC-${String(numericId)}` : incidentIdParam);

  // Seed editable local state from the API payload whenever it loads/refetches.
  useEffect(() => {
    if (!detail || editScope != null) {
      return;
    }
    setAttachments(detail.attachments);
    setWitnesses(detail.witnesses);
    setResponders(detail.responders);
    setAffectedName(
      detail.affectedName === "No affected person logged"
        ? ""
        : detail.affectedName,
    );
    setAffectedEmpId(detail.affectedEmpId);
    setAffectedInjuryLabel(detail.affectedInjuryLabel);
    setBodyPart(detail.bodyPart);
    setTreatment(detail.treatment);
    setTimelineEvents(detail.timelineEvents);
    setSummaryText(detail.summaryText);
    setResponseNotes(detail.responseNotes);
    setInfoItems(detail.infoItems);
  }, [detail, editScope]);

  // API only stores image URLs — resolve size (+ Last-Modified fallback) client-side.
  useEffect(() => {
    if (!detail) {
      return;
    }

    const pending = detail.attachments.flatMap((item) => {
      const url = item.secureUrl?.trim();
      if (!url) {
        return [];
      }
      const needsSize = item.bytes <= 0;
      const needsTime = !item.time || item.time === "—";
      if (!needsSize && !needsTime) {
        return [];
      }
      return [{ id: item.id, url, needsSize, needsTime }];
    });
    if (pending.length === 0) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const updates = await Promise.all(
        pending.map(async (item) => {
          const meta = await fetchRemoteFileMeta(item.url);
          const sizeUpdate =
            item.needsSize && meta.bytes != null
              ? {
                  bytes: meta.bytes,
                  sizeLabel: formatFileSize(meta.bytes),
                }
              : null;
          const timeUpdate =
            item.needsTime && meta.lastModified
              ? { time: formatShortDateTime(meta.lastModified) }
              : null;

          if (!sizeUpdate && !timeUpdate) {
            return null;
          }

          return {
            id: item.id,
            ...sizeUpdate,
            ...timeUpdate,
          };
        }),
      );

      if (cancelled) {
        return;
      }

      const byId = new Map(
        updates
          .filter(
            (
              update,
            ): update is {
              id: string;
              bytes?: number;
              sizeLabel?: string;
              time?: string;
            } => update != null,
          )
          .map((update) => [update.id, update]),
      );

      if (byId.size === 0) {
        return;
      }

      setAttachments((prev) =>
        prev.map((item) => {
          const next = byId.get(item.id);
          if (!next) {
            return item;
          }
          return {
            ...item,
            bytes: next.bytes ?? item.bytes,
            sizeLabel: next.sizeLabel ?? item.sizeLabel,
            time:
              item.time && item.time !== "—"
                ? item.time
                : (next.time ?? item.time),
          };
        }),
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [detail]);

  const handleTabChange = (tab: TabId) => {
    if (
      (editScope === "details" && tab !== "details") ||
      (editScope === "people" && tab !== "people") ||
      (editScope === "attachments" && tab !== "attachments")
    ) {
      setEditScope(null);
    }
    setActiveTab(tab);
    setShowHrca(false);
  };

  const beginEditDetails = () => {
    if (!detail) {
      return;
    }
    setActiveTab("details");
    setSummaryText(detail.summaryText);
    setResponseNotes(detail.responseNotes);
    setInfoItems(detail.infoItems);
    setEditScope("details");
  };

  const beginEditPeople = () => {
    if (!detail) {
      return;
    }
    setActiveTab("people");
    setAffectedName(
      detail.affectedName === "No affected person logged"
        ? ""
        : detail.affectedName,
    );
    setAffectedEmpId(detail.affectedEmpId);
    setAffectedInjuryLabel(detail.affectedInjuryLabel);
    setBodyPart(detail.bodyPart);
    setTreatment(detail.treatment);
    setResponders(detail.responders);
    setWitnesses(detail.witnesses);
    setEditScope("people");
  };

  const beginEditAttachments = () => {
    if (!detail) {
      return;
    }
    setActiveTab("attachments");
    setEditScope("attachments");
  };

  const handleDeleteAttachment = (file: AttachmentItem) => {
    setAttachments((prev) => prev.filter((item) => item.id !== file.id));
    setPreviewFile((current) => (current?.id === file.id ? null : current));
  };

  const handleEditOrSave = async () => {
    if (!detail || !incidentDto) {
      return;
    }

    if (!editScope) {
      if (activeTab === "people") {
        beginEditPeople();
        return;
      }
      if (activeTab === "attachments") {
        beginEditAttachments();
        return;
      }
      beginEditDetails();
      return;
    }

    try {
      if (editScope === "details") {
        if (!summaryText.trim()) {
          toast.error("Summary required", "Add a summary before saving.");
          return;
        }

        const patch = applyDetailEditDraft(incidentDto, {
          summary: summaryText,
          responseNotes,
          infoItems,
        });

        await updateIncidentMutation.mutateAsync({
          incidentId: detail.numericId,
          patch,
        });
      } else if (editScope === "people") {
        const patch = applyPeopleEditDraft(incidentDto, {
          affectedName,
          affectedEmpId,
          affectedInjuryLabel,
          bodyPart,
          treatment,
          responders,
          witnesses,
        });

        await updateIncidentMutation.mutateAsync({
          incidentId: detail.numericId,
          patch,
        });
      } else {
        const patch = applyAttachmentsEditDraft(attachments);

        await updateIncidentMutation.mutateAsync({
          incidentId: detail.numericId,
          patch,
        });
      }

      setEditScope(null);
      toast.success(
        "Incident updated",
        "Your changes were saved to this incident.",
      );
      await detailQuery.refetch();
    } catch (error) {
      toast.error(
        "Could not save changes",
        getMutationErrorMessage(error, "Please try again."),
      );
    }
  };

  const handleCloseIncident = async () => {
    if (!detail || detail.isClosed) {
      return;
    }

    try {
      await closeIncidentMutation.mutateAsync(detail.numericId);
      toast.success("Incident closed", `${detail.displayId} is now Closed.`);
      await detailQuery.refetch();
    } catch (error) {
      toast.error(
        "Could not close incident",
        getMutationErrorMessage(error, "Please try again."),
      );
    }
  };

  const handleUploadSuccess = async (item: AttachmentItem) => {
    if (!detail) {
      setAttachments((prev) => [...prev, item]);
      return;
    }

    const nextAttachments = [...attachments, item];
    setAttachments(nextAttachments);

    try {
      await updateIncidentMutation.mutateAsync({
        incidentId: detail.numericId,
        patch: applyAttachmentsEditDraft(nextAttachments),
      });
      await detailQuery.refetch();
    } catch (error) {
      setAttachments((prev) => prev.filter((entry) => entry.id !== item.id));
      throw error;
    }
  };

  const handleAddTimelinePost = (text: string) => {
    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "short" });
    const day = String(now.getDate());
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");

    setTimelineEvents((prev) => [
      ...prev,
      {
        id: `local-${String(now.getTime())}`,
        title: "Status update",
        description: text.trim(),
        time: `${month} ${day} · ${hh}:${min}`,
        actorName: "You",
        actorInitials: "YO",
        actorRole: "Update",
        icon: "mdi:message-text-outline",
      },
    ]);
    toast.success(
      "Update posted",
      "Your status update has been added to the timeline.",
    );
  };

  const usedBytes = attachments.reduce((sum, item) => sum + item.bytes, 0);

  const showBootLoading = !isClientReady;
  const showQueryLoading =
    isClientReady && hasToken && numericId != null && detailQuery.isLoading;
  const errorMessage =
    numericId == null
      ? `Invalid incident id “${incidentIdParam}”.`
      : isClientReady && !hasToken
        ? "Please sign in to load this incident."
        : isClientReady && detailQuery.isError
          ? getMutationErrorMessage(
              detailQuery.error,
              "Failed to load incident details.",
            )
          : isClientReady &&
              !detailQuery.isLoading &&
              !detailQuery.isError &&
              !detail
            ? `No incident found for id ${String(numericId)}.`
            : null;

  return (
    <div className="flex min-h-screen min-w-0 flex-1 flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-0 px-3 pb-8 sm:px-4">
        <IncidentDetailHeader
          incidentId={displayId}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onEdit={() => {
            void handleEditOrSave();
          }}
          isEditing={isEditing}
          isSaving={updateIncidentMutation.isPending}
          readOnly={
            activeTab !== "details" &&
            activeTab !== "people" &&
            activeTab !== "attachments"
          }
          onCloseIncident={() => {
            void handleCloseIncident();
          }}
          isClosingIncident={closeIncidentMutation.isPending}
          closeDisabled={!detail || detail.isClosed}
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
            {hasToken && numericId != null ? (
              <button
                type="button"
                onClick={() => void detailQuery.refetch()}
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

        {(showBootLoading || showQueryLoading) && !errorMessage ? (
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

        {detail && !errorMessage && !showBootLoading && !showQueryLoading ? (
          <>
            {activeTab === "details" && (
              <div className="mt-[18px] grid grid-cols-1 items-start gap-[14px] xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <div className="flex flex-col gap-[14px]">
                  <IncidentDetailSummaryCard
                    summaryText={summaryText}
                    isEditing={isEditingDetails}
                    onChangeSummary={setSummaryText}
                  />
                  <IncidentDetailInfoCard
                    items={infoItems}
                    isEditing={isEditingDetails}
                    onChangeItem={(key, value) => {
                      setInfoItems((prev) =>
                        prev.map((item) =>
                          item.key === key ? { ...item, value } : item,
                        ),
                      );
                    }}
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
                            setResponseNotes(event.target.value)
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
                    onAddPost={handleAddTimelinePost}
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
                    isEditingPeople
                      ? initialsFromName(affectedName)
                      : detail.affectedInitials
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
                  onChangeAffectedName={setAffectedName}
                  onChangeAffectedEmpId={setAffectedEmpId}
                  onChangeAffectedInjuryLabel={setAffectedInjuryLabel}
                  onChangeBodyPart={setBodyPart}
                  onChangeTreatment={setTreatment}
                  onChangeResponder={(index, patch) => {
                    setResponders((prev) =>
                      prev.map((member, memberIndex) => {
                        if (memberIndex !== index) {
                          return member;
                        }
                        const name = patch.name ?? member.name;
                        return {
                          ...member,
                          ...patch,
                          name,
                          initials: initialsFromName(name),
                        };
                      }),
                    );
                  }}
                />
                <div className="flex flex-col gap-[14px]">
                  <IncidentDetailWitnessesCard
                    witnesses={witnesses}
                    isEditing={isEditingPeople}
                    onAddWitness={() => {
                      setWitnesses((prev) => [
                        ...prev,
                        {
                          name: "",
                          role: "Witness",
                          initials: "—",
                          badgeLabel: "Pending",
                          badgeTone: "gray",
                        },
                      ]);
                    }}
                    onChangeWitness={(index, patch) => {
                      setWitnesses((prev) =>
                        prev.map((witness, witnessIndex) => {
                          if (witnessIndex !== index) {
                            return witness;
                          }
                          const name = patch.name ?? witness.name;
                          return {
                            ...witness,
                            ...patch,
                            name,
                            initials: initialsFromName(name),
                          };
                        }),
                      );
                    }}
                    onRemoveWitness={(index) => {
                      setWitnesses((prev) =>
                        prev.filter(
                          (_, witnessIndex) => witnessIndex !== index,
                        ),
                      );
                    }}
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
                    onSelectFile={setPreviewFile}
                    onAddFile={() => openUploadPickerRef.current?.()}
                    onDeleteFile={handleDeleteAttachment}
                    isEditing={isEditingAttachments}
                    embedded
                  />
                  <IncidentDetailFilesTable
                    attachments={attachments}
                    onSelectFile={setPreviewFile}
                    onDeleteFile={handleDeleteAttachment}
                    isEditing={isEditingAttachments}
                    embedded
                  />
                </IncidentGlassCard>
                <div className="flex flex-col gap-[14px]">
                  {!isEditingAttachments ? (
                    <IncidentDetailUploadCard
                      onUploadSuccess={handleUploadSuccess}
                      onRegisterOpen={registerUploadOpen}
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
                  onClose={() => setShowHrca(false)}
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
                    onOpenHrca={() => setShowHrca(true)}
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
                  isLoading={capaQuery.isPending}
                  isSubmitting={createCapaMutation.isPending}
                  onSubmitCapa={async (payload) => {
                    try {
                      await createCapaMutation.mutateAsync({
                        incidentId: detail.numericId,
                        controlLevel: payload.controlLevel,
                        description: payload.description,
                        type: payload.type,
                        owner: payload.owner,
                        dueDate: payload.dueDate,
                        priority: payload.priority,
                      });
                      toast.success(
                        "CAPA created",
                        `Added ${payload.type.toLowerCase()} action for ${displayId}.`,
                      );
                    } catch (error) {
                      toast.error(
                        "Could not create CAPA",
                        getMutationErrorMessage(error, "Please try again."),
                      );
                      throw error;
                    }
                  }}
                />
                <div className="flex flex-col gap-[14px]">
                  <IncidentDetailCapaSummaryCard
                    totalCount={linkedCapa.summary.totalCount}
                    inProgressCount={linkedCapa.summary.inProgressCount}
                    verifiedCount={linkedCapa.summary.verifiedCount}
                    planningCount={linkedCapa.summary.planningCount}
                    isLoading={capaQuery.isLoading}
                  />
                  <IncidentDetailCapaControlCoverageCard
                    hierarchyControls={linkedCapa.hierarchy}
                    noticeMessage={linkedCapa.noticeMessage}
                    isLoading={capaQuery.isLoading}
                  />
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>

      {previewFile ? (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      ) : null}
    </div>
  );
}
