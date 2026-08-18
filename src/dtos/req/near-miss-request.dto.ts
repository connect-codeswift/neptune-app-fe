/** Matches backend `PaginationDto` body for POST /api/NearMiss/GetAllNearMiss. */
export type GetAllNearMissRequestDto = {
  pageNumber: number;
  pageSize: number;
};

/** Matches backend body for POST /api/NearMiss/NearMiss. */
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
 * Edit body for the same POST /api/NearMiss/NearMiss endpoint — sending an `id`
 * updates the existing record instead of creating one.
 */
export type UpdateNearMissRequestDto = CreateNearMissRequestDto & {
  id: number;
};

/** Either shape accepted by POST /api/NearMiss/NearMiss. */
export type SaveNearMissRequestDto =
  | CreateNearMissRequestDto
  | UpdateNearMissRequestDto;
