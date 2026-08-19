/** Payload for POST /api/bbs. */
export type CreateBbsObservationRequestDto = {
  observe: string;
  behaviorCategoryId: number;
  location: string;
  description: string;
  photoUrl: string;
};

/** Payload for PUT /api/v1/bbs/observations/{id}. */
export type UpdateBbsObservationRequestDto = {
  id: number;
  observe: string;
  behaviorCategoryId: number;
  location: string;
  description: string;
  photoUrl: string;
};

/** Query params for GET /api/bbs. */
export type GetBbsObservationsParams = Readonly<{
  /** Free-text search; empty string when the search bar is blank. */
  observe: string;
  /**
   * Behavior category filter. Omit (or leave undefined) when the UI is on
   * "All".
   */
  categoryId?: number;
  pageNumber: number;
  pageSize: number;
}>;
