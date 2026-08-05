type AppRouterLike = Readonly<{
  push: (href: string) => void;
  replace: (href: string) => void;
}>;

type SafeNavigateOptions = Readonly<{
  replace?: boolean;
}>;

const ROUTER_NOT_READY = "Router action dispatched before initialization";
const MAX_ATTEMPTS = 20;
const RETRY_DELAY_MS = 16;

function isRouterNotReadyError(error: unknown): boolean {
  return error instanceof Error && error.message.includes(ROUTER_NOT_READY);
}

function assignLocation(href: string, replace: boolean): void {
  if (replace) {
    window.location.replace(href);
    return;
  }

  window.location.assign(href);
}

/**
 * Navigates once the App Router action queue is ready (Next.js 16 / Turbopack).
 * Retries briefly when the queue has not initialized yet, then falls back to
 * a full document navigation.
 */
export function safeAppNavigate(
  router: AppRouterLike,
  href: string,
  options?: SafeNavigateOptions,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const replace = options?.replace ?? false;
  const method = replace ? "replace" : "push";
  let attempts = 0;

  const attempt = (): void => {
    try {
      router[method](href);
    } catch (error) {
      if (isRouterNotReadyError(error) && attempts < MAX_ATTEMPTS) {
        attempts += 1;
        window.setTimeout(attempt, RETRY_DELAY_MS);
        return;
      }

      assignLocation(href, replace);
    }
  };

  attempt();
}
