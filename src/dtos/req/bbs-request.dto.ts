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

/** Query params for GET /api/bbs/observations. */
export type GetBbsObservationsParams = Readonly<{
  /**
   * Observation type filter — "Safe" or "At-Risk". Empty string means All: the
   * server reads blank as "no filter". The hyphen is safe to send; the API
   * strips separators before matching the "AtRisk" it stores.
   */
  observe: string;
  /**
   * Free-text search. The server matches it against the observation id, its
   * date, location, behavior category and observer name.
   */
  search?: string;
  /**
   * Behavior category filter. Omit (or leave undefined) when the UI is on
   * "All".
   */
  categoryId?: number;
  pageNumber: number;
  pageSize: number;
}>;
