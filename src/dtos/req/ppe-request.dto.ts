/** Payload for POST /api/ppe/issue. */
export type IssuePpeRequestDto = {
  assignTo: number;
  ppeId: string | number;
  item: string;
  quantity: number;
  size: string;
  note: string;
};

/** Payload for POST /api/ppe/replace-request. */
export type ReplacePpeRequestDto = {
  issuePpeId: number;
  replaceReason: string;
  urgency: string;
  detail?: string;
  evidenceLink?: string;
};
