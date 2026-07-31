import type { GetUserDropdownResponseDto } from "@/dtos/res/user-response.dto";
import http from "@/lib/axios";

const USER_DROPDOWN_PATH = "/User/dropdown";

export async function getUserDropdown() {
  const { data } =
    await http.get<GetUserDropdownResponseDto>(USER_DROPDOWN_PATH);

  return data;
}
