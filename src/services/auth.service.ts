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

const AUTH_REGISTER_PATH = "/auth/register";
const AUTH_LOGIN_PATH = "/auth/login";
const AUTH_RESET_PASSWORD_PATH = "/auth/verify-otp"; // it is actually reset password
const AUTH_FORGOT_PASSWORD_PATH = "/auth/forgot-password";
const AUTH_LOGOUT_PATH = "/auth/logout";
const USER_ACCEPT_INVITATION_PATH = "/users/accept-invitation";
const AUTH_MFA_SETUP_PATH = "/auth/mfa/setup";
const AUTH_MFA_ENABLE_PATH = "/auth/mfa/enable";
const AUTH_MFA_DISMISS_PATH = "/auth/mfa/dismiss";
const AUTH_SELECT_SITE_PATH = "/auth/select-site";

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

/** Stores a token pair and its access window as the live session. */
function persistSession(tokens: LoginResponseDto) {
  setAccessToken(tokens.accessToken);
  setRefreshToken(tokens.refreshToken);
  setCachedAccessWindow(readAccessWindowFromAuthPayload(tokens));

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

  return persistSession(tokens);
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

/** The invited address, when the endpoint echoes it back. */
function readAcceptedEmail(data: unknown): string | null {
  const payload = unwrapAuthPayload(data);
  const email = payload?.email ?? payload?.Email;

  return typeof email === "string" && email.trim() !== "" ? email.trim() : null;
}

/**
 * Finishes an invitation: sets the password on the pending user row and flips IsInvited off.
 *
 * Returns the session it managed to establish, or `null` if it could not — the caller decides
 * between offering 2FA and sending the user to sign in.
 *
 * Getting a session here is what makes the optional MFA step possible at all: /Auth/mfa/setup
 * and /Auth/mfa/enable are both [Authorize]d, so with no token there is nothing to attach an
 * authenticator to and the invitee would have to sign in a second time to add 2FA.
 *
 * It used to be simple — log in with `payload.email` and the password just chosen. The token
 * refactor took `email` out of the request, and the endpoint is documented only as returning
 * 200, so there is no longer a guaranteed way to name the account we just set up. Hence the
 * three-way probe: a token pair in the response is used directly, an echoed email is logged in
 * with, and neither means the account is fine but unauthenticated. Collapse this back to one
 * path once the response shape is pinned down.
 */
export async function acceptInvitation(payload: AcceptInvitationRequestDto) {
  const { data } = await http.post<ApiEnvelopeDto<unknown>>(
    USER_ACCEPT_INVITATION_PATH,
    payload,
  );

  const issuedTokens = readLoginTokens(data);
  if (issuedTokens) {
    return persistSession(issuedTokens);
  }

  const email = readAcceptedEmail(data);
  if (email) {
    // A freshly accepted user always has MfaEnabled false, so login returns tokens
    // outright rather than an MFA challenge.
    return authenticateUser({ email, password: payload.password });
  }

  return null;
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
