/** Payload for POST /api/bbs. */
export type CreateBbsObservationRequestDto = {
  observe: string;
  behaviorCategoryId: number;
  location: string;
  description: string;
  photoUrl: string;
};
