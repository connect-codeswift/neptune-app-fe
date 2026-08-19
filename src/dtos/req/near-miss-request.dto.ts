/** Matches backend `PaginationDto` body for POST /api/v1/near-misses/search. */
export type GetAllNearMissRequestDto = {
  pageNumber: number;
  pageSize: number;
};

/** Matches backend body for POST /api/v1/near-misses. */
export type CreateNearMissRequestDto = {
  id?: number;
  dateOfEvent: string;
  hazardType: string;
  location: string;
  whatHappened: string;
  contributingFactor: string[];
  isDrop: boolean;
  userId: number;
  siteId: number;
};

/**
 * Edit body for the same POST /api/v1/near-misses endpoint — sending an `id`
 * updates the existing record instead of creating one.
 */
export type UpdateNearMissRequestDto = CreateNearMissRequestDto & {
  id: number;
};

/** Either shape accepted by POST /api/v1/near-misses. */
export type SaveNearMissRequestDto =
  CreateNearMissRequestDto | UpdateNearMissRequestDto;
