/** One answered checklist item. */
export type InspectionItemResponseRequestDto = {
  /** The snapshot item's id. */
  inspectionItemId: number;
  /** 0 until the item is backed by a response set. */
  inspectionResponseOptionId: number;
  /** The chosen answer as text, e.g. "Yes". */
  valueText: string;
  note: string;
  isNA: boolean;
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
  userId: number;
  siteId: number;
};
