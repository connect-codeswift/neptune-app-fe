/** Matches backend body for POST /api/Hazard/GetAllHazard. */
export type GetAllHazardRequestDto = {
  pageNumber: number;
  pageSize: number;
  siteId: number;
  userId: number;
};

/** Matches backend body for POST /api/Hazard/Hazards. */
export type CreateHazardRequestDto = {
  id?: number;
  type: string;
  location: string;
  description: string;
  /** Secure Cloudinary URL of the attached photo evidence. */
  image: string;
  /** User id of the person responsible for assessing and closing the hazard. */
  assignedTo: number;
  userId: number;
  siteId: number;
  isDrop: boolean;
};

/**
 * Edit body for the same POST /api/Hazard/Hazards endpoint — sending an `id`
 * updates the existing record instead of creating one.
 */
export type UpdateHazardRequestDto = {
  id: number;
  type: string;
  location: string;
  description: string;
  image: string;
  assignedTo: number;
  userId: number;
  siteId: number;
  isDrop: boolean;
  status: string;
};

/** Either shape accepted by POST /api/Hazard/Hazards. */
export type SaveHazardRequestDto =
  CreateHazardRequestDto | UpdateHazardRequestDto;
