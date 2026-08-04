/** One follow-up row in POST /api/walkandtalk. */
export type CreateWalkTalkFollowUpDto = {
  followUpTitle: string;
  assignToId: number;
  dueDate: string;
};

/** Payload for POST /api/walkandtalk. */
export type CreateWalkTalkRequestDto = {
  observer: string;
  date: string;
  location: string;
  topics: string[];
  notes: string;
  participants: string[];
  followUps: CreateWalkTalkFollowUpDto[];
};

/** Query params for GET /api/walkandtalk. */
export type GetWalkTalkSessionsParams = Readonly<{
  pageNumber: number;
  pageSize: number;
}>;
