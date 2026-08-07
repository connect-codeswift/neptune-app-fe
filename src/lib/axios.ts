import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  isOrgAccessExpiredMessage,
  readAccessWindowFromAuthPayload,
  redirectToLoginFromAppShell,
  setAuthRedirectMessage,
  setCachedAccessWindow,
} from "@/lib/access-window";

const ACCESS_TOKEN_KEY = "neptune-access-token";
const REFRESH_TOKEN_KEY = "neptune-refresh-token";

const configuredApiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

function getApiBaseUrl() {
  if (configuredApiBaseUrl.startsWith("/")) {
    if (globalThis.window !== undefined) {
      return configuredApiBaseUrl.replace(/\/$/, "");
    }

    const proxyTarget = process.env.API_PROXY_TARGET;
    if (proxyTarget) {
      return proxyTarget.replace(/\/$/, "");
    }

    return configuredApiBaseUrl.replace(/\/$/, "");
  }

  return configuredApiBaseUrl.replace(/\/$/, "");
}

const API_BASE_URL = getApiBaseUrl();

export type ApiError = Readonly<{
  message: string;
  status?: number;
  data?: unknown;
}>;

export class HttpError extends Error {
  readonly status?: number;
  readonly data?: unknown;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "HttpError";
    this.status = error.status;
    this.data = error.data;
  }
}

let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;

export function getAccessToken() {
  if (inMemoryAccessToken) {
    return inMemoryAccessToken;
  }

  if (globalThis.window === undefined) {
    return null;
  }

  return globalThis.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;

  if (globalThis.window === undefined) {
    return;
  }

  if (token) {
    globalThis.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return;
  }

  globalThis.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (inMemoryRefreshToken) {
    return inMemoryRefreshToken;
  }

  if (globalThis.window === undefined) {
    return null;
  }

  return globalThis.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string | null) {
  inMemoryRefreshToken = token;

  if (globalThis.window === undefined) {
    return;
  }

  if (token) {
    globalThis.localStorage.setItem(REFRESH_TOKEN_KEY, token);
    return;
  }

  globalThis.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function clearAuthTokens() {
  setAccessToken(null);
  setRefreshToken(null);
}

function attachAuthHeader(config: InternalAxiosRequestConfig) {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}

/** Pull a user-facing message from common API error envelopes (incl. ASP.NET validation). */
export function getApiErrorMessageFromData(data: unknown): string | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }

  const record = data as Record<string, unknown>;
  const errors = record.errors;

  if (typeof errors === "object" && errors !== null) {
    const messages = Object.values(errors as Record<string, unknown>).flatMap(
      (value) => {
        if (Array.isArray(value)) {
          return value.filter(
            (item): item is string => typeof item === "string" && !!item.trim(),
          );
        }

        if (typeof value === "string" && value.trim()) {
          return [value];
        }

        return [];
      },
    );

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  if (typeof record.message === "string" && record.message.trim()) {
    return record.message;
  }

  if (typeof record.Message === "string" && record.Message.trim()) {
    return record.Message;
  }

  if (typeof record.title === "string" && record.title.trim()) {
    return record.title;
  }

  return null;
}

function toApiError(
  error: AxiosError<{
    message?: string;
    Message?: string;
    title?: string;
    errors?: Record<string, string[]>;
  }>,
): ApiError {
  const data = error.response?.data;

  return {
    // The backend returns `message` on success-path envelopes, `Message` on ones
    // thrown by its exception middleware, and neither on [ApiController]'s
    // automatic model-validation 400 — that shape carries `errors` and `title`.
    message:
      getApiErrorMessageFromData(data) ??
      error.message ??
      "Something went wrong. Please try again.",
    status: error.response?.status,
    data,
  };
}

export function isApiError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

const AUTH_REFRESH_PATH = "/Auth/refresh-token";

/** Request config tagged so a refreshed request is only ever retried once. */
type RetriableRequestConfig = InternalAxiosRequestConfig & {
  retriedAfterRefresh?: boolean;
};

/** Read a token off the refresh envelope, tolerating either casing. */
function readToken(source: unknown, key: "accessToken" | "refreshToken") {
  if (typeof source !== "object" || source === null) {
    return null;
  }

  const record = source as Record<string, unknown>;
  const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
  const value = record[key] ?? record[pascalKey];

  return typeof value === "string" && value !== "" ? value : null;
}

async function requestNewAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();

  if (!refresh) {
    return null;
  }

  try {
    // Deliberately a bare axios call: going through `http` would re-enter the
    // response interceptor below and recurse if the refresh itself 401s.
    const { data } = await axios.post(
      `${API_BASE_URL}${AUTH_REFRESH_PATH}`,
      null,
      { params: { token: refresh }, timeout: 30_000 },
    );

    const payload =
      (data as Record<string, unknown> | null)?.dataModel ??
      (data as Record<string, unknown> | null)?.DataModel ??
      data;

    const accessToken = readToken(payload, "accessToken");

    if (!accessToken) {
      return null;
    }

    setAccessToken(accessToken);

    // The backend may rotate the refresh token; keep the newest one if so.
    const rotatedRefresh = readToken(payload, "refreshToken");
    if (rotatedRefresh) {
      setRefreshToken(rotatedRefresh);
    }

    const accessWindow = readAccessWindowFromAuthPayload(payload);
    setCachedAccessWindow(accessWindow);

    return accessToken;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.message ?? error.response?.data?.Message ?? "";

      if (
        error.response?.status === 401 &&
        typeof message === "string" &&
        isOrgAccessExpiredMessage(message)
      ) {
        setAuthRedirectMessage(message);
      }
    }

    return null;
  }
}

let refreshPromise: Promise<string | null> | null = null;

/**
 * Refresh the access token, coalescing concurrent callers onto one request so
 * a burst of 401s doesn't fire N refreshes.
 */
export function refreshAccessToken(): Promise<string | null> {
  refreshPromise ??= requestNewAccessToken().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

function createHttpClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json; charset=utf-8",
    },
    timeout: 30_000,
  });

  client.interceptors.request.use(attachAuthHeader);

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<{ message?: string; Message?: string }>) => {
      const config = error.config as RetriableRequestConfig | undefined;
      const isRefreshCall = config?.url?.includes(AUTH_REFRESH_PATH) ?? false;

      const shouldRefresh =
        error.response?.status === 401 &&
        config !== undefined &&
        config.retriedAfterRefresh !== true &&
        !isRefreshCall;

      if (shouldRefresh) {
        // Mark first: a failed retry must fall through instead of looping.
        config.retriedAfterRefresh = true;

        const token = await refreshAccessToken();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          return client(config);
        }

        // Refresh failed — the session is unrecoverable, so don't leave a
        // dead token behind to fail every subsequent request.
        clearAuthTokens();
        redirectToLoginFromAppShell();
      }

      return Promise.reject(new HttpError(toApiError(error)));
    },
  );

  return client;
}

const http = createHttpClient();
export default http;
