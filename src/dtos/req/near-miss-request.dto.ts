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
