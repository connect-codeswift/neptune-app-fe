import { useQuery } from "@tanstack/react-query";
import { getUserDropdown } from "@/services/user.service";

export function useUserDropdownQuery() {
  return useQuery({
    queryKey: ["user", "dropdown"] as const,
    queryFn: () => getUserDropdown(),
  });
}
