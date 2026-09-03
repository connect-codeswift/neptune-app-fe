/** One answered checklist item. */
export type InspectionItemResponseRequestDto = {
  /** The snapshot item's id. */
  inspectionItemId: number;
  /**
   * The chosen response option, or null when the item is not backed by a response
   * set. Never send 0 — see `responseOptionId` in audit-request.dto.ts.
   */
  inspectionResponseOptionId: number | null;
  /** The chosen answer as text, e.g. "Yes". */
  valueText: string;
  note: string;
  isNA: boolean;
  /**
   * The grade the inspector picked. The backend derives Pass/Action/Critical
   * from this; omitting it falls back to the response option, which inspection
   * templates do not carry, so every answer would grade as Pass.
   */
  severity?: "Pass" | "Action" | "Critical" | null;
};

/** Body for PUT /api/v1/inspections/{id}/responses — records the answers. */
export type SaveInspectionResponsesRequestDto = {
  userId: number;
  siteId: number;
  responses: InspectionItemResponseRequestDto[];
};

/** Body for POST /api/v1/inspections — starts (schedules) an inspection. */
export type CreateInspectionRequestDto = {
  /** 0 on create; the backend assigns the real id. */
  id: number;
  inspectionTitle: string;
  inspectionTemplateId: number;
  location: string;
  inspectorId: number;
  /** ISO date-time string. */
  scheduleDate: string;
  /** ISO date-time string. Optional until the backend persists it. */
  dueDate?: string;
  userId: number;
  siteId: number;
};

/** Body for POST /api/v1/inspections/{id}/submit — locks the run and raises findings. */
export type SubmitInspectionRequestDto = {
  userId: number;
  siteId: number;
};

/** Body for POST /api/v1/inspections/{id}/reopen — lead-only correction path. */
export type ReopenInspectionRequestDto = {
  userId: number;
  siteId: number;
  reason: string;
};

/**
 * Body for POST /api/v1/inspections/{id}/attachments — links a file already
 * uploaded through the files pipeline.
 */
export type LinkInspectionAttachmentRequestDto = {
  fileId: string;
  inspectionItemId: number | null;
};
