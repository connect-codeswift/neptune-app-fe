import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";
import http from "@/lib/axios";

export type UserAvatarResponseDto = Readonly<{
  profileUrl: string | null;
}>;

const AUTH_AVATAR_UPLOAD_PATH = "/Auth/avatar/upload";
const AUTH_AVATAR_PATH = "/Auth/avatar";

export async function uploadAvatar(profileUrl: string) {
  const { data } = await http.post<ApiEnvelopeDto<UserAvatarResponseDto>>(
    AUTH_AVATAR_UPLOAD_PATH,
    { profileUrl },
  );

  return data;
}

export async function removeAvatar() {
  const { data } = await http.delete<ApiEnvelopeDto<UserAvatarResponseDto>>(
    AUTH_AVATAR_PATH,
  );

  return data;
}
