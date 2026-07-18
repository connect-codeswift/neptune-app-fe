import type { CreateNearMissRequestDto } from "@/dtos/req/near-miss-request.dto";
import type { CreateNearMissResponseDto } from "@/dtos/res/near-miss-response.dto";
import http, { getAccessToken } from "@/lib/axios";

const NEAR_MISS_CREATE_PATH = "/NearMiss/NearMiss";

export async function createNearMiss(payload: CreateNearMissRequestDto) {
  const token = getAccessToken();

  const { data } = await http.post<CreateNearMissResponseDto>(
    NEAR_MISS_CREATE_PATH,
    payload,
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  );

  return data;
}
