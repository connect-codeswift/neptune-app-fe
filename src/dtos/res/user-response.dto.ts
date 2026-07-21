import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";

/**
 * One entry of GET /api/User/dropdown. The backend's exact key names aren't
 * pinned down yet, so the common spellings are all optional here and
 * `toAssigneeOptions` picks whichever is present.
 */
export type UserDropdownItemDto = {
  id?: number | string;
  subCompId?: number | string;
  userId?: number | string;
  value?: number | string;
  name?: string;
  fullName?: string;
  userName?: string;
  label?: string;
  email?: string;
};

/** Matches backend response for GET /api/User/dropdown. */
export type GetUserDropdownResponseDto = ApiEnvelopeDto<
  UserDropdownItemDto[] | null
>;
