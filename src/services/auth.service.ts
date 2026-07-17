import type {
  ForgotPasswordRequestDto,
  LoginRequestDto,
  RegisterRequestDto,
  ResetPasswordRequestDto,
} from "@/dtos/req/auth-request.dto";
import type { LoginResponseDto } from "@/dtos/res/auth-response.dto";
import { buildRegisterRequest } from "@/lib/build-register-request";
import http, { setAccessToken, setRefreshToken } from "@/lib/axios";
import type { OnboardingPersistedState } from "@/lib/onboarding-storage";
import type { SignupPersistedState } from "@/lib/signup-storage";

const AUTH_REGISTER_PATH = "/Auth/register";
const AUTH_LOGIN_PATH = "/Auth/login";
const AUTH_RESET_PASSWORD_PATH = "/Auth/verify-otp"; // it is actually reset password
const AUTH_FORGOT_PASSWORD_PATH = "/Auth/forgot-password";
const AUTH_LOGOUT_PATH = "/Auth/logout";
const AUTH_REFRESH_TOKEN_PATH = "/Auth/refresh-token";

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

export async function refreshToken() {
  await http.post(AUTH_REFRESH_TOKEN_PATH);
}
