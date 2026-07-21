import type {
  ForgotPasswordRequestDto,
  LoginRequestDto,
  RegisterRequestDto,
  ResetPasswordRequestDto,
} from "@/dtos/req/auth-request.dto";
import type { LoginResponseDto } from "@/dtos/res/auth-response.dto";
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

export async function registerUser(payload: RegisterRequestDto) {
  await http.post(AUTH_REGISTER_PATH, payload);
}

export async function loginUser(credentials: LoginRequestDto) {
  const { data } = await http.post<LoginResponseDto>(
    AUTH_LOGIN_PATH,
    credentials,
  );

  return data;
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
