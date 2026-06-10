import { useMutation } from "@tanstack/react-query";
import type { LoginRequestDto } from "@/dtos/req/auth-request.dto";
import { isApiError } from "@/lib/axios";
import type { OnboardingPersistedState } from "@/lib/onboarding-storage";
import type { SignupPersistedState } from "@/lib/signup-storage";
import { completeRegistration, authenticateUser } from "@/services/auth.service";

type CompleteRegistrationVariables = Readonly<{
  signup: SignupPersistedState;
  onboarding: OnboardingPersistedState;
  preferMobileModules?: boolean;
}>;

export function useCompleteRegistrationMutation() {
  return useMutation({
    mutationFn: ({
      signup,
      onboarding,
      preferMobileModules,
    }: CompleteRegistrationVariables) =>
      completeRegistration(signup, onboarding, { preferMobileModules }),
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: (credentials: LoginRequestDto) => authenticateUser(credentials),
  });
}

export function getMutationErrorMessage(error: unknown, fallback: string) {
  if (isApiError(error)) {
    return error.message;
  }

  return fallback;
}
