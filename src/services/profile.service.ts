import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";
import http from "@/lib/axios";

export type UserAvatarResponseDto = Readonly<{
  profileUrl: string | null;
}>;

export type UserProfileResponseDto = Readonly<{
  id: number;
  fullName: string | null;
  contactNo: string | null;
  jobTitle: string | null;
}>;

/** Partial update — omitted fields are left alone, empty strings clear the value. */
export type UpdateMyProfilePayload = Readonly<{
  fullName?: string;
  contactNo?: string;
  jobTitle?: string;
}>;

const USER_AVATAR_PATH = "/users/me/avatar";

const USER_ME_PATH = "/users/me";

export async function uploadAvatar(profileUrl: string) {
  const { data } = await http.post<ApiEnvelopeDto<UserAvatarResponseDto>>(
    USER_AVATAR_PATH,
    { profileUrl },
  );

  return data;
}

export async function removeAvatar() {
  const { data } =
    await http.delete<ApiEnvelopeDto<UserAvatarResponseDto>>(USER_AVATAR_PATH);

  return data;
}

/** PUT /users/me — the signed-in user editing their own details. */
export async function updateMyProfile(payload: UpdateMyProfilePayload) {
  const { data } = await http.put<ApiEnvelopeDto<UserProfileResponseDto>>(
    USER_ME_PATH,
    payload,
  );

  return data;
}
