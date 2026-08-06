import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sessionQueryKeys } from "@/hooks/use-session-bootstrap";
import { removeAvatar, uploadAvatar } from "@/services/profile.service";
import { getUserById } from "@/services/user.service";

export const profileQueryKeys = {
  all: ["profile"] as const,
  avatar: (userId: number) => ["profile", "avatar", userId] as const,
};

export function useProfileAvatarQuery(userId: number) {
  return useQuery({
    queryKey: profileQueryKeys.avatar(userId),
    queryFn: async () => {
      const user = await getUserById(userId);
      return user?.profileUrl ?? null;
    },
    enabled: userId > 0,
    staleTime: 60_000,
  });
}

export function useUploadProfileAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sessionQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.all });
    },
  });
}

export function useRemoveProfileAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeAvatar,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sessionQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.all });
    },
  });
}
