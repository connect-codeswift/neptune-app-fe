/** Matches backend body for POST /api/v1/hazards/search. */
export type GetAllHazardRequestDto = {
  pageNumber: number;
  pageSize: number;
  siteId: number;
  userId: number;
};

/** Matches backend body for POST /api/v1/hazards. */
export type CreateHazardRequestDto = {
  id?: number;
  type: string;
  location: string;
  description: string;
  /** Secure Cloudinary URL of the attached photo evidence. */
  image: string;
  userId: number;
  siteId: number;
  isDrop: boolean;
};

/**
 * Edit body for the same POST /api/v1/hazards endpoint — sending an `id`
 * updates the existing record instead of creating one.
 */
export type UpdateHazardRequestDto = {
  id: number;
  type: string;
  location: string;
  description: string;
  image: string;
  userId: number;
  siteId: number;
  isDrop: boolean;
  status: string;
};

/** Either shape accepted by POST /api/v1/hazards. */
export type SaveHazardRequestDto =
  CreateHazardRequestDto | UpdateHazardRequestDto;
