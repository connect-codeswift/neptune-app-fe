"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AttachmentItem,
  IncidentClosureData,
  IncidentDetailInfoItem,
  IncidentDetailResponseAction,
  ResponderMember,
  TimelineEvent,
  WitnessRow,
} from "@/components/incidents/detail/incident-detail-types";
import { isAffectedNamePlaceholder } from "@/components/incidents/detail/incident-detail-types";
import { IncidentDetailView } from "@/components/incidents/detail/IncidentDetailView";
import type { TabId } from "@/components/incidents/detail/shared/IncidentDetailHeader";
import {
  createInitialClosureData,
  resetClosureWizardFields,
} from "@/components/incidents/detail/closure/closure-form-state";
import { toCanonicalIncidentType } from "@/forms/incident-module/closure-classification";
import { getMutationErrorMessage } from "@/hooks/use-auth-mutations";
import {
  useCreateCapaMutation,
  useCreateCapaTaskMutation,
  useDeleteCapaTaskMutation,
  useUpdateCapaMutation,
  useVerifyCapaMutation,
} from "@/hooks/use-capa-mutations";
import { useCapasByIncidentQuery } from "@/hooks/use-capa-queries";
import {
  useCloseIncidentMutation,
  useUpdateIncidentClosureMutation,
  useUpdateIncidentMutation,
} from "@/hooks/use-incident-mutations";
import {
  useIncidentByIdQuery,
  useIncidentClosureQuery,
} from "@/hooks/use-incident-queries";
import { useRcaByIncidentQuery } from "@/hooks/use-rca-queries";
import { useHasAccessToken } from "@/hooks/use-has-access-token";
import {
  useSiteUsersQuery,
  useUserSummaryQuery,
} from "@/hooks/use-user-queries";
import { buildPeoplePhotoIndex } from "@/components/incidents/detail/people/people-photos";
import { getAuthContext, getAuthDisplayName } from "@/lib/auth-context";
import { formatFileSize } from "@/lib/cloudinary-constants";
import { fetchRemoteFileMeta } from "@/lib/fetch-remote-file-bytes";
import { formatShortDateTime } from "@/lib/format-short-date-time";
import { toast } from "@/lib/toast";
import {
  buildCreateCapaRequest,
  EMPTY_LINKED_CAPA_VIEW,
} from "@/services/mappers/capa.mapper";
import {
  applyAttachmentsEditDraft,
  applyDetailEditDraft,
  applyPeopleEditDraft,
} from "@/services/mappers/incident-detail-edit.mapper";
import {
  firstPeopleEditError,
  hasPeopleEditErrors,
  NO_PEOPLE_EDIT_ERRORS,
  parseDaysAway,
  validatePeopleEditDraft,
  type PeopleEditErrors,
} from "@/components/incidents/detail/people/people-edit-validation";
import {
  EMPTY_INCIDENT_INVESTIGATION,
  parseIncidentRouteId,
  withDetailClosedState,
} from "@/services/mappers/incident-detail.mapper";
import {
  isClosureFinalized,
  mapIncidentClosureDtoToData,
} from "@/services/mappers/incident-closure.mapper";
import { buildRcaInvestigationPreview } from "@/services/mappers/rca.mapper";

export type IncidentDetailContentProps = Readonly<{
  /** Route param: numeric id or `INC-{id}`. */
  incidentIdParam: string;
}>;

type EditScope = "details" | "people" | "attachments";

/** One page of roster covers a site's people; incidents rarely name more. */
const ROSTER_PAGE_SIZE = 200;

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

/**
 * Detail page orchestrator (near-miss DetailContent pattern).
 * Owns queries, mutations, and editable local state; renders IncidentDetailView.
 */
export function IncidentDetailContent(
  props: Readonly<IncidentDetailContentProps>,
) {
  const { incidentIdParam } = props;
  const numericId = parseIncidentRouteId(incidentIdParam);

  const [activeTab, setActiveTab] = useState<TabId>("details");
  const [showHrca, setShowHrca] = useState(false);
  const [openAddCapaOnLinkedTab, setOpenAddCapaOnLinkedTab] = useState(false);
  const [previewFile, setPreviewFile] = useState<AttachmentItem | null>(null);
  const accessTokenState = useHasAccessToken();
  const isClientReady = accessTokenState !== null;
  const hasToken = accessTokenState === true;
  const [attachments, setAttachments] = useState<readonly AttachmentItem[]>([]);
  const [witnesses, setWitnesses] = useState<readonly WitnessRow[]>([]);
  const [responders, setResponders] = useState<readonly ResponderMember[]>([]);
  const [affectedName, setAffectedName] = useState("");
  const [affectedEmpId, setAffectedEmpId] = useState("");
  const [affectedInjuryLabel, setAffectedInjuryLabel] = useState("");
  const [bodyPart, setBodyPart] = useState("");
  const [treatment, setTreatment] = useState("");
  // Days away is not on the incident payload — it lives on the closure record,
  // so it is held as a string here and written through the closure mutation.
  const [daysAway, setDaysAway] = useState("");
  // Witnesses come from the incident report module. Rows already on the record
  // when the edit began are locked; only rows appended here may be changed.
  const [lockedWitnessCount, setLockedWitnessCount] = useState(0);
  const [peopleErrors, setPeopleErrors] = useState<PeopleEditErrors>(
    NO_PEOPLE_EDIT_ERRORS,
  );
  const [timelineEvents, setTimelineEvents] = useState<
    readonly TimelineEvent[]
  >([]);
  const [summaryText, setSummaryText] = useState("");
  const [responseNotes, setResponseNotes] = useState("");
  const [responseActions, setResponseActions] = useState<
    readonly IncidentDetailResponseAction[]
  >([]);
  const [infoItems, setInfoItems] = useState<readonly IncidentDetailInfoItem[]>(
    [],
  );
  const [closureData, setClosureData] = useState<IncidentClosureData>(() =>
    createInitialClosureData(),
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

  const detailQuery = useIncidentByIdQuery({
    id: numericId,
    enabled: isClientReady && hasToken && numericId != null,
  });
  const closeIncidentMutation = useCloseIncidentMutation();
  const updateIncidentMutation = useUpdateIncidentMutation();
  const updateClosureMutation = useUpdateIncidentClosureMutation();
  const createCapaMutation = useCreateCapaMutation();
  const updateCapaMutation = useUpdateCapaMutation();
  const createCapaTaskMutation = useCreateCapaTaskMutation();
  const deleteCapaTaskMutation = useDeleteCapaTaskMutation();
  const verifyCapaMutation = useVerifyCapaMutation();

  const loadedDetail = detailQuery.data?.detail ?? null;
  const incidentDto = detailQuery.data?.dto ?? null;

  const capaQuery = useCapasByIncidentQuery({
    incidentId: loadedDetail?.numericId ?? numericId,
    enabled:
      isClientReady &&
      hasToken &&
      (loadedDetail?.numericId != null || numericId != null),
  });
  const closureQuery = useIncidentClosureQuery({
    incidentId: loadedDetail?.numericId ?? numericId,
    enabled:
      isClientReady &&
      hasToken &&
      (loadedDetail?.numericId != null || numericId != null),
  });
  // The incident payload alone cannot say whether this incident is closed on a
  // backend that predates `stage` on the single-incident read, and answering
  // "no" there is what let a finalised incident be walked through the closure
  // wizard a second time. The closure record loaded above settles it.
  const detail = withDetailClosedState(
    loadedDetail,
    isClosureFinalized(closureQuery.data),
  );
  const rcaIncidentId = detail?.numericId ?? numericId;
  const rcaQueryEnabled =
    isClientReady &&
    hasToken &&
    rcaIncidentId != null &&
    rcaIncidentId > 0 &&
    (activeTab === "investigation" || showHrca);
  const rcaQuery = useRcaByIncidentQuery({
    incidentId: rcaIncidentId,
    enabled: rcaQueryEnabled,
  });
  const linkedCapa = capaQuery.data ?? EMPTY_LINKED_CAPA_VIEW;
  const investigation = detail?.investigation ?? EMPTY_INCIDENT_INVESTIGATION;
  const rcaInvestigationPreview = useMemo(() => {
    if (!rcaQuery.data) {
      return null;
    }

    return buildRcaInvestigationPreview(rcaQuery.data.lanes, {
      ledBy: investigation.ledBy,
      isClosed: detail?.isClosed ?? false,
      attachmentCount: attachments.length,
      witnessCount: witnesses.length,
      capaCount: linkedCapa.items.length,
    });
  }, [
    attachments.length,
    detail?.isClosed,
    investigation.ledBy,
    linkedCapa.items.length,
    rcaQuery.data,
    witnesses.length,
  ]);
  const rcaInvestigationError =
    rcaQueryEnabled && rcaQuery.isError
      ? getMutationErrorMessage(rcaQuery.error, "Failed to load RCA data.")
      : null;
  const displayId =
    detail?.displayId ??
    (numericId != null ? `INC-${String(numericId)}` : incidentIdParam);

  // Days away is carried by the closure record, not the incident payload, so
  // `detail.daysAway` is only ever the "—" placeholder. Read the real number
  // back from closure once that record exists, otherwise a value saved from
  // the People tab would never appear anywhere.
  const daysAwayDisplay =
    closureQuery.data == null
      ? (detail?.daysAway ?? "—")
      : String(closureData.daysAwayFromWork);

  // The incident stores who was hurt as an id, not a name — the roster picker
  // files `affectedPersonId` and the record keeps nothing else about them. Look
  // the person up so the card can show who they actually are, with their photo.
  // A non-numeric id is free text from an older record and matches nobody, so it
  // is not worth a request.
  const affectedUserId = /^\d+$/.test(detail?.affectedEmpId.trim() ?? "")
    ? Number(detail?.affectedEmpId.trim())
    : null;
  const affectedUserQuery = useUserSummaryQuery(
    affectedUserId,
    isClientReady && hasToken,
  );
  const affectedUser = affectedUserQuery.data ?? null;

  // Everyone else on this page — responders, witnesses, routing, sign-off — is
  // stored by name only, so one roster fetch covers them all rather than a
  // request each. Scoped to the incident's own site, falling back to the
  // viewer's when the payload predates `siteId`.
  const rosterSiteId = incidentDto?.siteId ?? getAuthContext()?.siteId ?? 0;
  const siteRosterQuery = useSiteUsersQuery(
    rosterSiteId,
    { pageSize: ROSTER_PAGE_SIZE },
    isClientReady && hasToken && rosterSiteId > 0,
  );
  const peoplePhotos = useMemo(
    () => buildPeoplePhotoIndex(siteRosterQuery.data ?? []),
    [siteRosterQuery.data],
  );
  // The looked-up name wins over the mapper's placeholder, but never over a real
  // name already on the record.
  const affectedDisplayName =
    detail && isAffectedNamePlaceholder(detail.affectedName)
      ? (affectedUser?.fullName ?? detail.affectedName)
      : (detail?.affectedName ?? "");

  const [hydratedDetailKey, setHydratedDetailKey] = useState<string | null>(
    null,
  );
  const [hydratedClosureKey, setHydratedClosureKey] = useState<string | null>(
    null,
  );
  const [hydratedCapaKey, setHydratedCapaKey] = useState<string | null>(null);

  const detailHydrateKey =
    detail == null ? null : `${detail.displayId}:${detail.numericId}`;
  const closureHydrateKey = detail
    ? `closure:${detail.numericId}:${String(closureQuery.dataUpdatedAt)}:${closureQuery.data == null ? "0" : "1"}`
    : null;
  const capaHydrateKey =
    capaQuery.data?.items && capaQuery.data.items.length > 0
      ? `capa:${detail?.numericId ?? ""}:${String(capaQuery.dataUpdatedAt)}`
      : null;

  // Hydrate editable local state from loaded detail / closure / CAPA during
  // render (React-recommended alternative to syncing via effects).
  if (
    detail &&
    editScope == null &&
    detailHydrateKey != null &&
    detailHydrateKey !== hydratedDetailKey
  ) {
    setHydratedDetailKey(detailHydrateKey);
    setAttachments(detail.attachments);
    setWitnesses(detail.witnesses);
    setResponders(detail.responders);
    setAffectedName(
      isAffectedNamePlaceholder(detail.affectedName) ? "" : detail.affectedName,
    );
    setAffectedEmpId(detail.affectedEmpId);
    setAffectedInjuryLabel(detail.affectedInjuryLabel);
    setBodyPart(detail.bodyPart);
    setTreatment(detail.treatment);
    setTimelineEvents(detail.timelineEvents);
    setSummaryText(detail.summaryText);
    setResponseNotes(detail.responseNotes);
    setResponseActions(detail.responseActions);
    setInfoItems(detail.infoItems);
  }

  if (closureHydrateKey != null && closureHydrateKey !== hydratedClosureKey) {
    setHydratedClosureKey(closureHydrateKey);
    if (closureQuery.data) {
      setClosureData((prev) =>
        mapIncidentClosureDtoToData(closureQuery.data, prev),
      );
    } else if (detail) {
      const intakeType = detail.infoItems?.find((i) =>
        i.key.toLowerCase().includes("type"),
      )?.value;
      setClosureData((prev) => ({
        ...prev,
        finalIncidentType:
          prev.finalIncidentType === "Select option"
            ? toCanonicalIncidentType(intakeType)
            : prev.finalIncidentType,
        closedBy: prev.closedBy || getAuthDisplayName() || "EHS User",
        approverName: prev.approverName || getAuthDisplayName() || "EHS User",
        approverInitials: initialsFromName(
          prev.approverName || getAuthDisplayName() || "EU",
        ),
      }));
    }
  }

  if (capaHydrateKey != null && capaHydrateKey !== hydratedCapaKey) {
    setHydratedCapaKey(capaHydrateKey);
    const mappedCapas = (capaQuery.data?.items ?? []).map((c) => ({
      id: String(c.id),
      title: c.code || `CAPA-${String(c.id).slice(-3)}`,
      subtitle: c.title || c.controlCategory || "",
      progressPercent:
        typeof c.progressPercent === "number" ? c.progressPercent : 0,
      // Passed through untouched. The old mapping folded five statuses into three and
      // named two - Verified and Planning - that the API no longer has.
      status: c.status,
    }));
    setClosureData((prev) => ({
      ...prev,
      closureLinkedCapas: mappedCapas,
    }));
  }

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

  if (detail?.isClosed && activeTab === "closure") {
    setActiveTab("details");
  }

  const handleTabChange = (tab: TabId) => {
    if (tab === "closure" && detail?.isClosed) {
      return;
    }
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

  const handleNavigateToLinkedCapa = useCallback(
    (options?: Readonly<{ openAddModal?: boolean }>) => {
      setOpenAddCapaOnLinkedTab(Boolean(options?.openAddModal));
      setActiveTab("linked-capa");
      setShowHrca(false);
      if (editScope != null) {
        setEditScope(null);
      }
    },
    [editScope],
  );

  const handleAddCapaModalOpened = useCallback(() => {
    setOpenAddCapaOnLinkedTab(false);
  }, []);

  const beginEditDetails = () => {
    if (!detail) {
      return;
    }
    setActiveTab("details");
    setSummaryText(detail.summaryText);
    setResponseNotes(detail.responseNotes);
    setResponseActions(detail.responseActions);
    setInfoItems(detail.infoItems);
    setEditScope("details");
  };

  const toggleResponseAction = (id: string) => {
    setResponseActions((prev) =>
      prev.map((action) =>
        action.id === id ? { ...action, completed: !action.completed } : action,
      ),
    );
  };

  const beginEditPeople = () => {
    if (!detail) {
      return;
    }
    setActiveTab("people");
    setAffectedName(
      isAffectedNamePlaceholder(detail.affectedName) ? "" : detail.affectedName,
    );
    setAffectedEmpId(detail.affectedEmpId);
    setAffectedInjuryLabel(detail.affectedInjuryLabel);
    setBodyPart(detail.bodyPart);
    setTreatment(detail.treatment);
    setResponders(detail.responders);
    setWitnesses(detail.witnesses);
    // Seeded from closure, the only record that carries the number. Every
    // witness present now is pre-existing, so all of them start locked.
    setDaysAway(String(closureData.daysAwayFromWork));
    setLockedWitnessCount(detail.witnesses.length);
    setPeopleErrors(NO_PEOPLE_EDIT_ERRORS);
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
          responseActions,
          infoItems,
        });

        await updateIncidentMutation.mutateAsync({
          incidentId: detail.numericId,
          patch,
        });
      } else if (editScope === "people") {
        const errors = validatePeopleEditDraft({
          bodyPart,
          treatment,
          daysAway,
          witnesses,
          lockedWitnessCount,
        });
        setPeopleErrors(errors);
        if (hasPeopleEditErrors(errors)) {
          toast.error(
            "Check the highlighted fields",
            firstPeopleEditError(errors) ?? "Some required fields are missing.",
          );
          return;
        }

        // Identity fields are locked in this scope, so they pass straight back
        // through unchanged — the mapper still rebuilds the whole people array.
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

        // Days away is not part of the incident payload. Write it only when it
        // actually changed, so a People edit does not touch a closure record
        // that no one asked to modify.
        const nextDaysAway = parseDaysAway(daysAway);
        if (nextDaysAway !== closureData.daysAwayFromWork) {
          await updateClosureMutation.mutateAsync({
            incidentId: detail.numericId,
            data: { ...closureData, daysAwayFromWork: nextDaysAway },
          });
        }
      } else {
        const patch = applyAttachmentsEditDraft(attachments);

        await updateIncidentMutation.mutateAsync({
          incidentId: detail.numericId,
          patch,
        });
      }

      setEditScope(null);
      setPeopleErrors(NO_PEOPLE_EDIT_ERRORS);
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
    <IncidentDetailView
      displayId={displayId}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onEditOrSave={() => {
        void handleEditOrSave();
      }}
      isEditing={isEditing}
      isSaving={updateIncidentMutation.isPending}
      errorMessage={errorMessage}
      showLoading={(showBootLoading || showQueryLoading) && !errorMessage}
      hasToken={hasToken}
      canRetry={numericId != null}
      onRetry={() => {
        void detailQuery.refetch();
      }}
      detail={detail}
      investigation={investigation}
      rcaInvestigationPreview={rcaInvestigationPreview}
      isRcaInvestigationLoading={
        rcaQueryEnabled && rcaQuery.isLoading && !rcaQuery.data
      }
      rcaInvestigationError={rcaInvestigationError}
      onRetryRca={() => {
        void rcaQuery.refetch();
      }}
      incidentNumericId={rcaIncidentId}
      hrcaQueryEnabled={rcaQueryEnabled}
      showHrca={showHrca}
      onOpenHrca={() => setShowHrca(true)}
      onCloseHrca={() => setShowHrca(false)}
      isEditingDetails={isEditingDetails}
      isEditingPeople={isEditingPeople}
      isEditingAttachments={isEditingAttachments}
      summaryText={summaryText}
      onChangeSummary={setSummaryText}
      responseNotes={responseNotes}
      responseActions={responseActions}
      onToggleResponseAction={toggleResponseAction}
      onChangeResponseNotes={setResponseNotes}
      infoItems={infoItems}
      onChangeInfoItem={(key, value) => {
        setInfoItems((prev) =>
          prev.map((item) => (item.key === key ? { ...item, value } : item)),
        );
      }}
      timelineEvents={timelineEvents}
      onAddTimelinePost={handleAddTimelinePost}
      affectedName={affectedName}
      affectedDisplayName={affectedDisplayName}
      affectedProfileUrl={affectedUser?.profileUrl ?? null}
      peoplePhotos={peoplePhotos}
      affectedEmpId={affectedEmpId}
      affectedInjuryLabel={affectedInjuryLabel}
      affectedInitials={initialsFromName(affectedName)}
      bodyPart={bodyPart}
      treatment={treatment}
      responders={responders}
      witnesses={witnesses}
      daysAway={daysAway}
      daysAwayDisplay={daysAwayDisplay}
      onChangeBodyPart={setBodyPart}
      onChangeTreatment={setTreatment}
      onChangeDaysAway={setDaysAway}
      lockedWitnessCount={lockedWitnessCount}
      peopleErrors={peopleErrors}
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
        // Locked rows belong to the incident report module and are read-only
        // in this scope; the card does not render inputs for them either.
        if (index < lockedWitnessCount) {
          return;
        }
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
        // Only rows appended during this edit can be dropped — removing a
        // pre-existing witness would delete it from the incident record.
        if (index < lockedWitnessCount) {
          return;
        }
        setWitnesses((prev) =>
          prev.filter((_, witnessIndex) => witnessIndex !== index),
        );
      }}
      attachments={attachments}
      usedBytes={usedBytes}
      onSelectFile={setPreviewFile}
      onAddFile={() => openUploadPickerRef.current?.()}
      onDeleteFile={handleDeleteAttachment}
      onUploadSuccess={handleUploadSuccess}
      onRegisterUploadOpen={registerUploadOpen}
      linkedCapa={linkedCapa}
      isCapaLoading={capaQuery.isPending}
      isCapaSubmitting={
        createCapaMutation.isPending ||
        updateCapaMutation.isPending ||
        createCapaTaskMutation.isPending ||
        deleteCapaTaskMutation.isPending ||
        verifyCapaMutation.isPending
      }
      openAddCapaOnLinkedTab={openAddCapaOnLinkedTab}
      onAddCapaModalOpened={handleAddCapaModalOpened}
      onNavigateToLinkedCapa={handleNavigateToLinkedCapa}
      onSubmitCapa={async (payload) => {
        if (!detail) {
          return;
        }
        try {
          await createCapaMutation.mutateAsync({
            payload: buildCreateCapaRequest({
              incidentId: detail.numericId,
              controlLevel: payload.controlLevel,
              description: payload.description,
              type: payload.type,
              owner: payload.owner,
              dueDate: payload.dueDate,
              priority: payload.priority,
            }),
            tasks: payload.tasks,
          });
          const taskCount = payload.tasks?.length ?? 0;
          toast.success(
            "CAPA created",
            taskCount > 0
              ? `Added ${payload.type.toLowerCase()} action with ${String(taskCount)} task${taskCount === 1 ? "" : "s"}.`
              : `Added ${payload.type.toLowerCase()} action for ${displayId}.`,
          );
        } catch (error) {
          toast.error(
            "Could not create CAPA",
            getMutationErrorMessage(error, "Please try again."),
          );
          throw error;
        }
      }}
      onUpdateCapa={async (capa, payload) => {
        try {
          await updateCapaMutation.mutateAsync({
            capa,
            controlLevel: payload.controlLevel,
            description: payload.description,
            type: payload.type,
            owner: payload.owner,
            dueDate: payload.dueDate,
            priority: payload.priority,
          });
          toast.success("CAPA updated", `${capa.code} was saved.`);
        } catch (error) {
          toast.error(
            "Could not update CAPA",
            getMutationErrorMessage(error, "Please try again."),
          );
          throw error;
        }
      }}
      isCreatingCapaTask={createCapaTaskMutation.isPending}
      onCreateCapaTask={async (capa, payload) => {
        if (!detail) {
          return;
        }

        try {
          await createCapaTaskMutation.mutateAsync({
            capaId: capa.numericId,
            incidentId: detail.numericId,
            task: payload.task,
            dueDate: payload.dueDate,
            priority: payload.priority,
          });
          toast.success("Task added", `New task linked to ${capa.code}.`);
        } catch (error) {
          toast.error(
            "Could not add task",
            getMutationErrorMessage(error, "Please try again."),
          );
          throw error;
        }
      }}
      isDeletingCapaTask={deleteCapaTaskMutation.isPending}
      onDeleteCapaTask={async (capa, taskId) => {
        if (!detail) {
          return;
        }

        try {
          await deleteCapaTaskMutation.mutateAsync({
            taskId,
            capaId: capa.numericId,
            incidentId: detail.numericId,
          });
          toast.success("Task removed", `Task deleted from ${capa.code}.`);
        } catch (error) {
          toast.error(
            "Could not delete task",
            getMutationErrorMessage(error, "Please try again."),
          );
          throw error;
        }
      }}
      isVerifyingCapa={verifyCapaMutation.isPending}
      onVerifyCapa={async (capa, input) => {
        if (!detail) {
          return;
        }

        try {
          await verifyCapaMutation.mutateAsync({
            capa,
            incidentId: detail.numericId,
            effectiveness: input.effectiveness,
            notes: input.notes,
          });
          toast.success(
            "CAPA verified",
            `${capa.code} has been verified and closed.`,
          );
        } catch (error) {
          toast.error(
            "Could not verify CAPA",
            getMutationErrorMessage(error, "Please try again."),
          );
          throw error;
        }
      }}
      previewFile={previewFile}
      onClosePreview={() => setPreviewFile(null)}
      closureData={closureData}
      isClosureSubmitting={
        updateClosureMutation.isPending || closeIncidentMutation.isPending
      }
      onSelectClosureStep={(step) => {
        setClosureData((prev) => ({ ...prev, currentStep: step }));
      }}
      onChangeClosureField={(field, value) => {
        setClosureData((prev) => ({ ...prev, [field]: value }));
      }}
      onToggleClosureCheckItem={(itemId) => {
        setClosureData((prev) => ({
          ...prev,
          verificationChecklist: prev.verificationChecklist.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  completed: !item.completed,
                  completedAt: !item.completed
                    ? formatShortDateTime(new Date())
                    : undefined,
                  completedBy: !item.completed ? "Current User" : undefined,
                }
              : item,
          ),
        }));
      }}
      onCancelClosure={() => {
        const intakeType = detail?.infoItems?.find((item) =>
          item.key.toLowerCase().includes("type"),
        )?.value;

        setClosureData((prev) =>
          resetClosureWizardFields(prev, {
            finalIncidentType: toCanonicalIncidentType(intakeType),
          }),
        );
      }}
      onSaveClosureDraft={async () => {
        const targetId = detail?.numericId ?? numericId;
        if (!targetId) return;
        try {
          await updateClosureMutation.mutateAsync({
            incidentId: targetId,
            data: closureData,
          });
          toast.success(
            "Draft Saved",
            "Incident closure draft saved successfully.",
          );
        } catch (error) {
          toast.error(
            "Failed to Save Draft",
            getMutationErrorMessage(
              error,
              "Please check your network or try again.",
            ),
          );
        }
      }}
      onFinalizeClosure={async () => {
        const targetId = detail?.numericId ?? numericId;
        if (!targetId) return;

        const updatedData: IncidentClosureData = {
          ...closureData,
          closureStatus: "Closed",
          closureId: closureData.closureId ?? `CLS-${displayId}`,
          closedAt: formatShortDateTime(new Date()),
          closedBy: closureData.approverName || closureData.closedBy,
          isApproved: true,
        };

        setClosureData(updatedData);

        try {
          await updateClosureMutation.mutateAsync({
            incidentId: targetId,
            data: updatedData,
          });
          await closeIncidentMutation.mutateAsync(targetId);
          await closureQuery.refetch();
          toast.success(
            "Incident Officially Closed",
            `Incident ${displayId} has been successfully closed and verified.`,
          );
          await detailQuery.refetch();
        } catch (error) {
          toast.error(
            "Failed to Finalize Closure",
            getMutationErrorMessage(error, "Please try again."),
          );
        }
      }}
    />
  );
}
