import type { CreateBbsObservationRequestDto } from "@/dtos/req/bbs-request.dto";
import type {
  CreateBbsObservationResponseDto,
  GetBehaviorCategoriesResponseDto,
} from "@/dtos/res/bbs-response.dto";
import http from "@/lib/axios";

const BBS_PATH = "/bbs";
const BEHAVIOR_CATEGORIES_PATH = "/bbs/behavior-categories";

export async function getBehaviorCategories() {
  const { data } = await http.get<GetBehaviorCategoriesResponseDto>(
    BEHAVIOR_CATEGORIES_PATH,
  );

  return data;
}

export async function createBbsObservation(
  payload: CreateBbsObservationRequestDto,
) {
  const { data } = await http.post<CreateBbsObservationResponseDto>(
    BBS_PATH,
    payload,
  );

  return data;
}
