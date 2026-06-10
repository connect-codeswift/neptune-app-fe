import type { LoginRequestDto, RegisterRequestDto } from "@/dtos/req/auth-request.dto";
import type { LoginResponseDto } from "@/dtos/res/auth-response.dto";
import { buildRegisterRequest } from "@/lib/build-register-request";
import http, { setAccessToken } from "@/lib/axios";
import type { OnboardingPersistedState } from "@/lib/onboarding-storage";
import type { SignupPersistedState } from "@/lib/signup-storage";

const AUTH_REGISTER_PATH = "/Auth/register";
const AUTH_LOGIN_PATH = "/Auth/login";

type CompleteRegistrationOptions = Readonly<{
  preferMobileModules?: boolean;
}>;

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

export async function completeRegistration(
  signup: SignupPersistedState,
  onboarding: OnboardingPersistedState,
  options?: CompleteRegistrationOptions,
) {
  const payload = buildRegisterRequest(signup, onboarding, options);

  await registerUser(payload);

  const tokens = await loginUser({
    email: signup.email,
    password: signup.password,
  });

  setAccessToken(tokens.accessToken);

  return tokens;
}
