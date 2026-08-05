import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ForgotPasswordRequestDto,
  LoginRequestDto,
  ResetPasswordRequestDto,
} from "@/dtos/req/auth-request.dto";
import { isApiError } from "@/lib/axios";
import type { OnboardingPersistedState } from "@/lib/onboarding-storage";
import type { SignupPersistedState } from "@/lib/signup-storage";
import { sessionQueryKeys } from "@/hooks/use-session-bootstrap";
import {
  authenticateUser,
  completeRegistration,
  forgotPassword,
  resetPassword,
} from "@/services/auth.service";

type CompleteRegistrationVariables = Readonly<{
  signup: SignupPersistedState;
  onboarding: OnboardingPersistedState;
}>;

export function useCompleteRegistrationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ signup, onboarding }: CompleteRegistrationVariables) =>
      completeRegistration(signup, onboarding),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sessionQueryKeys.all });
    },
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequestDto) => authenticateUser(credentials),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sessionQueryKeys.all });
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordRequestDto) => forgotPassword(payload),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordRequestDto) => resetPassword(payload),
  });
}

export function getMutationErrorMessage(error: unknown, fallback: string) {
  if (isApiError(error)) {
    return error.message;
  }

  return fallback;
}
