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
  /** HazCom chemical id, set only when `type === "chemical"`. */
  chemicalId?: number | null;
  location: string;
  /** The site location register entry the reporter picked. */
  locationId: number | null;
  description: string;
  /** First of {@link attachments}; kept for the older single-photo contract. */
  image: string;
  /** Every attached photo evidence file, up to 10. */
  attachments: string[];
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
  /** The site location register entry, once the record has been saved against one. */
  locationId: number | null;
  description: string;
  image: string;
  attachments: string[];
  userId: number;
  siteId: number;
  isDrop: boolean;
  status: string;
};

/** Either shape accepted by POST /api/v1/hazards. */
export type SaveHazardRequestDto =
  CreateHazardRequestDto | UpdateHazardRequestDto;
