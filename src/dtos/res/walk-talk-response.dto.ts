import type { ApiEnvelopeDto, PagedDataDto } from "@/dtos/res/api-envelope.dto";

/** One participant from GET /api/walkandtalk/participants (shape may expand). */
export type WalkTalkParticipantDto = Record<string, unknown>;

/** Matches backend response for GET /api/walkandtalk/participants. */
export type GetWalkTalkParticipantsResponseDto = ApiEnvelopeDto<
  WalkTalkParticipantDto[] | null
>;

/** Participant nested on GET /api/walkandtalk/{id}. */
export type WalkTalkSessionParticipantDto = {
  id: number;
  name: string;
  createdAt?: string;
};

/** Follow-up nested on GET /api/walkandtalk/{id}. */
export type WalkTalkSessionFollowUpDto = {
  id: number;
  followUpTitle: string;
  assignToId: number;
  assignToName?: string;
  dueDate: string;
  status?: string;
};

/** One session row from GET /api/walkandtalk. */
export type WalkTalkSessionDto = {
  id: number;
  observer: string;
  date: string;
  location: string;
  topics: string[];
  notes?: string;
  userId?: number;
  userName?: string;
  createdAt?: string;
  siteId?: number;
  participants?: WalkTalkSessionParticipantDto[];
  followUps?: WalkTalkSessionFollowUpDto[];
};

/** Matches backend response for GET /api/walkandtalk. */
export type GetWalkTalkSessionsResponseDto = ApiEnvelopeDto<
  PagedDataDto<WalkTalkSessionDto> | WalkTalkSessionDto[] | null
>;

/** Matches backend response for GET /api/walkandtalk/{id}. */
export type GetWalkTalkSessionByIdResponseDto = ApiEnvelopeDto<
  WalkTalkSessionDto | null
>;

/** dataModel shape for GET /api/walkandtalk/dashboard-counts. */
export type WalkTalkDashboardCountsDto = {
  totalObservationsCount: number;
  totalWalkAndTalkCount: number;
};

/** Matches backend response for GET /api/walkandtalk/dashboard-counts. */
export type GetWalkTalkDashboardCountsResponseDto = ApiEnvelopeDto<
  WalkTalkDashboardCountsDto | null
>;

/** One finding from GET /api/walkandtalk/top-findings. */
export type WalkTalkTopFindingDto = {
  topic: string;
  count: number;
};

/** Matches backend response for GET /api/walkandtalk/top-findings. */
export type GetWalkTalkTopFindingsResponseDto = ApiEnvelopeDto<
  WalkTalkTopFindingDto[] | null
>;

/** One week bucket from GET /api/walkandtalk/graph. */
export type WalkTalkGraphPointDto = {
  weekStart: string;
  count: number;
};

/** dataModel shape for GET /api/walkandtalk/graph. */
export type WalkTalkGraphDto = {
  graph: WalkTalkGraphPointDto[];
  weeks: number;
};

/** Matches backend response for GET /api/walkandtalk/graph. */
export type GetWalkTalkGraphResponseDto = ApiEnvelopeDto<
  WalkTalkGraphDto | null
>;

/** Matches backend response for POST /api/walkandtalk. */
export type CreateWalkTalkResponseDto = ApiEnvelopeDto<unknown>;
