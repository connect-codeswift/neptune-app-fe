import type {
  AcceptInvitationRequestDto,
  EnableMfaRequestDto,
  ForgotPasswordRequestDto,
  LoginRequestDto,
  RegisterRequestDto,
  ResetPasswordRequestDto,
} from "@/dtos/req/auth-request.dto";
import type { ApiEnvelopeDto } from "@/dtos/res/api-envelope.dto";
import type {
  LoginResponseDto,
  MfaSetupResponseDto,
} from "@/dtos/res/auth-response.dto";
import {
  readAccessWindowFromAuthPayload,
  setCachedAccessWindow,
  unwrapAuthPayload,
} from "@/lib/access-window";
import { buildRegisterRequest } from "@/lib/build-register-request";
import http, {
  refreshAccessToken,
  setAccessToken,
  setRefreshToken,
} from "@/lib/axios";
import type { OnboardingPersistedState } from "@/lib/onboarding-storage";
import type { SignupPersistedState } from "@/lib/signup-storage";

const AUTH_REGISTER_PATH = "/Auth/register";
const AUTH_LOGIN_PATH = "/Auth/login";
const AUTH_RESET_PASSWORD_PATH = "/Auth/verify-otp"; // it is actually reset password
const AUTH_FORGOT_PASSWORD_PATH = "/Auth/forgot-password";
const AUTH_LOGOUT_PATH = "/Auth/logout";
const USER_ACCEPT_INVITATION_PATH = "/User/accept-invitation";
const AUTH_MFA_SETUP_PATH = "/Auth/mfa/setup";
const AUTH_MFA_ENABLE_PATH = "/Auth/mfa/enable";
const AUTH_MFA_DISMISS_PATH = "/Auth/mfa/dismiss";
const AUTH_SELECT_SITE_PATH = "/Auth/select-site";

function readLoginTokens(data: unknown): LoginResponseDto | null {
  const payload = unwrapAuthPayload(data);

  if (!payload) {
    return null;
  }

  const accessToken = payload.accessToken ?? payload.AccessToken;
  const refreshToken = payload.refreshToken ?? payload.RefreshToken;

  if (typeof accessToken !== "string" || accessToken === "") {
    return null;
  }

  const accessWindow = readAccessWindowFromAuthPayload(payload);

  return {
    accessToken,
    refreshToken: typeof refreshToken === "string" ? refreshToken : "",
    ...(accessWindow
      ? {
          accessDaysRemaining: accessWindow.daysRemaining,
          accessExpiresAt: accessWindow.accessExpiresAt,
        }
      : {}),
  };
}

async function registerUser(payload: RegisterRequestDto) {
  await http.post(AUTH_REGISTER_PATH, payload);
}

async function loginUser(credentials: LoginRequestDto) {
  const { data } = await http.post<unknown>(AUTH_LOGIN_PATH, credentials);
  const tokens = readLoginTokens(data);

  if (!tokens) {
    throw new Error(
      `Login succeeded but returned no accessToken. Response keys: ${Object.keys((typeof data === "object" && data !== null ? data : {}) as object).join(", ") || "(none)"}`,
    );
  }

  return tokens;
}

export async function authenticateUser(credentials: LoginRequestDto) {
  const tokens = await loginUser(credentials);

  // Fail loudly here: if the response shape ever drifts, `setAccessToken`
  // would otherwise be handed `undefined` and quietly *clear* the stored
  // token, leaving every later call to 401 with no clue as to why.
  if (typeof tokens?.accessToken !== "string" || tokens.accessToken === "") {
    throw new Error(
      `Login succeeded but returned no accessToken. Response keys: ${Object.keys(tokens ?? {}).join(", ") || "(none)"}`,
    );
  }

  setAccessToken(tokens.accessToken);
  setRefreshToken(tokens.refreshToken);

  const accessWindow = readAccessWindowFromAuthPayload(tokens);
  setCachedAccessWindow(accessWindow);

  return tokens;
}

export async function completeRegistration(
  signup: SignupPersistedState,
  onboarding: OnboardingPersistedState,
) {
  const payload = buildRegisterRequest(signup, onboarding);

  await registerUser(payload);

  return authenticateUser({
    email: signup.email,
    password: signup.password,
  });
}

export async function resetPassword(payload: ResetPasswordRequestDto) {
  await http.post(AUTH_RESET_PASSWORD_PATH, payload);
}

export async function forgotPassword(payload: ForgotPasswordRequestDto) {
  await http.post(AUTH_FORGOT_PASSWORD_PATH, payload);
}

/**
 * Finishes an invitation: sets the password on the pending user row and flips IsInvited off.
 *
 * The endpoint issues no session of its own, so we log in immediately afterwards with the
 * password just chosen. That token is what the optional MFA step needs — /Auth/mfa/setup and
 * /Auth/mfa/enable are both [Authorize]d, so without it there is nothing to attach the
 * authenticator to and the invitee would have to sign in a second time to add 2FA.
 */
export async function acceptInvitation(payload: AcceptInvitationRequestDto) {
  await http.post<ApiEnvelopeDto<string>>(USER_ACCEPT_INVITATION_PATH, payload);

  // A freshly accepted user always has MfaEnabled false, so login returns tokens
  // outright rather than an MFA challenge.
  return authenticateUser({ email: payload.email, password: payload.password });
}

export async function setupMfa() {
  const { data } = await http.post<MfaSetupResponseDto>(AUTH_MFA_SETUP_PATH);

  return data;
}

export async function enableMfa(payload: EnableMfaRequestDto) {
  await http.post(AUTH_MFA_ENABLE_PATH, payload);
}

/** "Not now" on the optional MFA offer, so later logins stop asking. */
export async function dismissMfaPrompt() {
  await http.post(AUTH_MFA_DISMISS_PATH);
}

/**
 * Moves the session to another site the user is assigned to.
 *
 * The API answers with a replacement token pair rather than a flag, because the site the rest
 * of the app is scoped to lives in the access token's SiteId claim. Both tokens are swapped
 * here: keeping the old refresh token would let the next renewal quietly hand back a token for
 * the previous site.
 */
export async function selectSite(siteId: number) {
  const { data } = await http.post<unknown>(AUTH_SELECT_SITE_PATH, { siteId });
  const payload = unwrapAuthPayload(data);

  const accessToken = payload?.accessToken ?? payload?.AccessToken;
  const refreshToken = payload?.refreshToken ?? payload?.RefreshToken;

  if (typeof accessToken !== "string" || accessToken === "") {
    throw new Error("Site switch succeeded but returned no access token.");
  }

  setAccessToken(accessToken);

  if (typeof refreshToken === "string" && refreshToken !== "") {
    setRefreshToken(refreshToken);
  }

  const switchedSiteId = payload?.siteId ?? payload?.SiteId;
  const switchedSiteName = payload?.siteName ?? payload?.SiteName;

  return {
    siteId: typeof switchedSiteId === "number" ? switchedSiteId : siteId,
    siteName: typeof switchedSiteName === "string" ? switchedSiteName : null,
  };
}

export async function logout() {
  await http.post(AUTH_LOGOUT_PATH);
}

/**
 * Exchange the stored refresh token for a new access token.
 * Returns null when there's no usable refresh token — the caller should
 * treat that as "session over" and send the user back to login.
 */
export async function refreshToken() {
  return refreshAccessToken();
}
