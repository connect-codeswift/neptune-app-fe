import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  AcceptInvitationRequestDto,
  ChangePasswordRequestDto,
  DisableMfaRequestDto,
  EnableMfaRequestDto,
  ForgotPasswordRequestDto,
  LoginRequestDto,
  ResetPasswordRequestDto,
  VerifyMfaRequestDto,
} from "@/dtos/req/auth-request.dto";
import { getApiErrorMessageFromData, isApiError } from "@/lib/axios";
import type { OnboardingPersistedState } from "@/lib/onboarding-storage";
import type { SignupPersistedState } from "@/lib/signup-storage";
import { sessionQueryKeys } from "@/hooks/use-session-bootstrap";
import {
  acceptInvitation,
  authenticateUser,
  changePassword,
  completeRegistration,
  disableMfa,
  dismissMfaPrompt,
  enableMfa,
  forgotPassword,
  resetPassword,
  setupMfa,
  verifyMfa,
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
    onSuccess: () => {
      // Deliberately not awaited. `mutateAsync` awaits whatever onSuccess
      // returns, and `invalidateQueries` resolves only once the active session
      // queries have refetched — so awaiting it here held the caller (and the
      // redirect to /dashboard) behind a network round trip that the dashboard
      // is perfectly able to wait on itself with its own skeletons.
      void queryClient.invalidateQueries({ queryKey: sessionQueryKeys.all });
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

export function useAcceptInvitationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AcceptInvitationRequestDto) =>
      acceptInvitation(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sessionQueryKeys.all });
    },
  });
}

/**
 * Step two of sign-in. Mirrors {@link useLoginMutation}: a session now exists, so anything
 * cached from the signed-out state has to go.
 */
export function useVerifyMfaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VerifyMfaRequestDto) => verifyMfa(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sessionQueryKeys.all });
    },
  });
}

export function useSetupMfaMutation() {
  return useMutation({ mutationFn: () => setupMfa() });
}

/**
 * Enabling and disabling both invalidate the session: `mfaEnabled` is read off
 * `GET /Auth/Org/me`, so without this the Security toggle would snap back to its old
 * position on the next render.
 */
export function useEnableMfaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EnableMfaRequestDto) => enableMfa(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sessionQueryKeys.all });
    },
  });
}

export function useDisableMfaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DisableMfaRequestDto) => disableMfa(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sessionQueryKeys.all });
    },
  });
}

/**
 * Deliberately does not invalidate the session: the API has just revoked every refresh token,
 * so refetching would race the sign-out the caller is about to perform.
 */
export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordRequestDto) => changePassword(payload),
  });
}

export function useDismissMfaPromptMutation() {
  return useMutation({ mutationFn: () => dismissMfaPrompt() });
}

export function getMutationErrorMessage(error: unknown, fallback: string) {
  if (isApiError(error)) {
    return getApiErrorMessageFromData(error.data) ?? error.message ?? fallback;
  }

  return fallback;
}
