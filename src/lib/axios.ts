import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

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

  if (globalThis.window !== undefined && process.env.NODE_ENV === "development") {
    return "/api";
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

function toApiError(error: AxiosError<{ message?: string }>): ApiError {
  return {
    message:
      error.response?.data?.message ??
      error.message ??
      "Something went wrong. Please try again.",
    status: error.response?.status,
    data: error.response?.data,
  };
}

export function isApiError(error: unknown): error is HttpError {
  return error instanceof HttpError;
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
    (error: AxiosError<{ message?: string }>) =>
      Promise.reject(new HttpError(toApiError(error))),
  );

  return client;
}

const http = createHttpClient();

export default http;
