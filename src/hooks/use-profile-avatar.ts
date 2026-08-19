import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sessionQueryKeys } from "@/hooks/use-session-bootstrap";
import { myProfileQueryKey } from "@/hooks/use-user-queries";
import {
  removeAvatar,
  updateMyProfile,
  uploadAvatar,
} from "@/services/profile.service";
import { getUserById } from "@/services/user.service";

const profileQueryKeys = {
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
      // The profile form seeds its phone field from here; without this the field would go on
      // showing the pre-save number until the cache expired.
      await queryClient.invalidateQueries({ queryKey: myProfileQueryKey });
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

/** Saving the account settings profile card. Refreshes the session so the sidebar picks up
 *  a renamed user or a new job title without a reload. */
export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sessionQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.all });
    },
  });
}
