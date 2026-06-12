import { useMutation } from "@tanstack/react-query";
import type {
  ForgotPasswordRequestDto,
  LoginRequestDto,
  ResetPasswordRequestDto,
} from "@/dtos/req/auth-request.dto";
import { isApiError } from "@/lib/axios";
import type { OnboardingPersistedState } from "@/lib/onboarding-storage";
import type { SignupPersistedState } from "@/lib/signup-storage";
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
  return useMutation({
    mutationFn: ({ signup, onboarding }: CompleteRegistrationVariables) =>
      completeRegistration(signup, onboarding),
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: (credentials: LoginRequestDto) => authenticateUser(credentials),
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
