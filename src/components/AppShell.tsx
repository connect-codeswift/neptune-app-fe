"use client";

import { AskNeptuneAiButton } from "@/components/neptune-ai/AskNeptuneAiButton";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { OrganizationLimitsBanner } from "@/components/OrganizationLimitsBanner";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useSessionBootstrap } from "@/hooks/use-session-bootstrap";
import { getAccessToken } from "@/lib/axios";
import { safeAppNavigate } from "@/lib/safe-app-navigation";
import { Icon } from "@iconify/react";

/* The mobile drawer scrim is pinned to `bg-black/40`. `--ehs-overlay` is slate
   at the same alpha, not black, and no token carries black at 0.4. */

/* Whether the desktop rail is collapsed to its icon-only mini form. Persisted
   because a rail you closed that reopens on the next route change is worse
   than no button at all. Desktop only — below lg the rail is already an
   off-canvas drawer with its own open/close, and this preference is ignored.

   localStorage is an external store, so it is read through
   `useSyncExternalStore` rather than copied into state by an effect: that keeps
   the server and hydration snapshots explicit, and syncs the rail across tabs
   for free. */
const SIDEBAR_COLLAPSED_KEY = "neptune-sidebar-collapsed";

const collapsedListeners = new Set<() => void>();
let cachedCollapsed: boolean | null = null;

function readStoredCollapsed(): boolean {
  if (globalThis.window === undefined) {
    return false;
  }

  try {
    return globalThis.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
  } catch {
    // Storage blocked (private mode, locked-down profile). The toggle still
    // works for this session; it just isn't remembered.
    return false;
  }
}

/** Called on every render, so the read is cached rather than hitting storage. */
function getCollapsedSnapshot(): boolean {
  cachedCollapsed ??= readStoredCollapsed();
  return cachedCollapsed;
}

/** The rail is always expanded in server HTML — there is no request-time hint. */
function getCollapsedServerSnapshot(): boolean {
  return false;
}

function subscribeCollapsed(onStoreChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    // A null key means the whole store was cleared (e.g. logout).
    if (event.key !== null && event.key !== SIDEBAR_COLLAPSED_KEY) {
      return;
    }

    cachedCollapsed = null;
    onStoreChange();
  };

  collapsedListeners.add(onStoreChange);
  globalThis.addEventListener("storage", onStorage);

  return () => {
    collapsedListeners.delete(onStoreChange);
    globalThis.removeEventListener("storage", onStorage);
  };
}

function setStoredCollapsed(collapsed: boolean) {
  cachedCollapsed = collapsed;

  try {
    globalThis.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  } catch {
    // As above — session-only is an acceptable degradation.
  }

  for (const listener of collapsedListeners) {
    listener();
  }
}

export type AppShellProps = Readonly<{
  children: ReactNode;
}>;

export function AppShell(props: Readonly<AppShellProps>) {
  const { children } = props;
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Drives `inert` on the off-canvas drawer. Starts false so the server and
  // the first client render agree; the media query resolves on mount.
  const [isDesktop, setIsDesktop] = useState(false);
  const isCollapsed = useSyncExternalStore(
    subscribeCollapsed,
    getCollapsedSnapshot,
    getCollapsedServerSnapshot,
  );
  /*
   * Transitions stay off through hydration and are armed one frame after it.
   *
   * They have to start off: the collapsed state is read from localStorage, so
   * the first client render corrects the width away from the server's
   * always-expanded HTML. Animating that correction sweeps the rail shut in
   * front of someone who had already collapsed it.
   *
   * They used to be armed by the toggle handler instead, which put the
   * transition class and the new width in the SAME commit — and a transition
   * cannot run when the property is only introduced alongside the value
   * change. So the first collapse jumped and every one after it animated. That
   * inconsistency is what read as broken. One frame after mount is late enough
   * for the hydration correction to have painted and early enough that no
   * interaction can beat it.
   */
  const [animationsArmed, setAnimationsArmed] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  // The access window now lives in the sidebar under the nav, not across
  // the top of every page.
  const { organizationLimits } = useSessionBootstrap();

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setAnimationsArmed(true);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  const toggleCollapsed = useCallback(() => {
    setStoredCollapsed(!getCollapsedSnapshot());
  }, []);

  // The rail, the content margin and the toggle button all move together, so
  // they share one flag and one duration/easing. Anything that drifts here
  // shows up as the page edge tearing away from the rail mid-slide.
  //
  // 200ms linear is shadcn's sidebar spec, and linear is the right call for
  // this specific motion: three separate elements slide in parallel, and any
  // eased curve makes a mismatch between them legible as one edge pulling
  // ahead of another. Linear also avoids the decelerating tail that reads as
  // the rail hesitating just before it lands.
  const railAnimates = animationsArmed;

  // Ctrl/Cmd+B, the shortcut every editor-shaped app uses for this. Desktop
  // only: below lg the rail is a drawer, and a keyboard is unlikely anyway.
  useEffect(() => {
    if (!isDesktop) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        !(event.ctrlKey || event.metaKey) ||
        event.key.toLowerCase() !== "b"
      ) {
        return;
      }

      // Firefox opens its bookmarks sidebar on this chord.
      event.preventDefault();
      toggleCollapsed();
    };

    globalThis.document.addEventListener("keydown", onKeyDown);
    return () => {
      globalThis.document.removeEventListener("keydown", onKeyDown);
    };
  }, [isDesktop, toggleCollapsed]);

  useEffect(() => {
    if (!getAccessToken()) {
      safeAppNavigate(router, "/login", { replace: true });
    }
  }, [router]);

  // Crossing into the desktop breakpoint promotes the drawer to a permanent
  // rail; leaving it open would strand the scroll lock and the backdrop.
  useEffect(() => {
    const desktop = globalThis.matchMedia("(min-width: 64rem)");

    const sync = () => {
      setIsDesktop(desktop.matches);
      if (desktop.matches) {
        setSidebarOpen(false);
      }
    };

    sync();
    desktop.addEventListener("change", sync);
    return () => desktop.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSidebar();
      }
    };

    // Without the lock the page scrolls behind the sheet, so dismissing it
    // drops you somewhere other than where you opened it.
    const { body } = globalThis.document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    globalThis.document.addEventListener("keydown", onKeyDown);

    sidebarRef.current
      ?.querySelector<HTMLElement>("[data-sidebar-close]")
      ?.focus();

    return () => {
      body.style.overflow = previousOverflow;
      globalThis.document.removeEventListener("keydown", onKeyDown);
    };
  }, [sidebarOpen, closeSidebar]);

  return (
    <div
      className={[
        "flex min-h-dvh min-w-0 flex-col lg:flex-row",
        // Only ever one margin class, never `lg:ml-68` plus an override —
        // two utilities at equal specificity would be settled by stylesheet
        // order rather than by intent.
        isCollapsed ? "lg:ml-24" : "lg:ml-68",
        animationsArmed
          ? "transition-[margin] duration-600 ease-linear motion-reduce:transition-none"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Ambient ground for the whole app: the body is flat ehs-light-bg, and
          glass surfaces only read as glass with colour behind them to blur.
          Fixed so it doesn't scroll with content; z-0 with content above. */}
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="bg-ehs-normal-blue/12 absolute -top-32 right-[10%] size-112 rounded-full blur-3xl" />
        <div className="absolute top-[35%] left-[30%] size-104 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="bg-ehs-normal-blue/10 absolute right-[25%] -bottom-24 size-96 rounded-full blur-3xl" />
      </div>
      {/* Mobile top navigation header. Sticky so the menu button is still
          reachable once you have scrolled down a long incident list. */}
      <header className="backdrop-blur-3.5 border-ehs-border-ink/8 bg-ehs-surface/80 sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b px-4 py-3.5 lg:hidden">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="text-ehs-gray hover:bg-ehs-light-bg border-ehs-border-ink/8 inline-flex h-9 w-9 items-center justify-center rounded-lg border"
          aria-label="Open navigation menu"
          aria-expanded={sidebarOpen}
          aria-controls="app-sidebar"
        >
          <Icon icon="mdi:menu" className="text-xl" />
        </button>
        <div className="text-ehs-dark-bg text-sm font-bold">Neptune EHS</div>
      </header>

      {/* Backdrop for mobile slide-out sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container. Transparent, not bg-ehs-light-bg: the sidebar is
          now glass, and an opaque wrapper behind it would blank the blur. The
          blobs are what the glass refracts — behind the aside, in front of
          the page. */}
      {/* dvh, not vh: on mobile browsers 100vh is the toolbar-less height, so
          the panel ran past the bottom of the screen and took the user footer
          and its log-out button with it. The inset lives here as padding so
          the panel itself can just fill this box. max-w keeps a sliver of the
          page visible on narrow phones, which is what makes it read as a
          sheet over the page rather than a new screen. */}
      <div
        id="app-sidebar"
        ref={sidebarRef}
        // Mobile-only: the collapsed desktop rail is a working icon strip,
        // not a hidden one, so its links stay in the tab order there.
        inert={!isDesktop && !sidebarOpen}
        className={[
          "fixed top-0 left-0 z-50 h-dvh max-w-[calc(100%-3rem)] p-2 lg:max-w-none lg:translate-x-0 lg:p-4 lg:pr-0",
          railAnimates
            ? "transition-[width,transform] duration-100 ease-linear motion-reduce:transition-none"
            : "",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          // Collapsing narrows the rail to an icon strip rather than sliding
          // it away — navigation stays one click deep. Width is lg-only in
          // effect: below lg the drawer is off-canvas either way.
          isCollapsed ? "w-68 lg:w-24" : "w-68",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* lg only: these exist purely as colour for the glass rail to
            refract. The mobile sheet is opaque, so below lg they are three
            full-size blur-3xl layers painting every frame behind something
            you cannot see through.

            Two geometries, one palette: the sizes and offsets are tuned to
            the 17rem rail, and clipped to the 6rem mini rail they mostly fall
            outside the strip — leaving the glass with nothing to refract, so
            the closed rail read flat white while the open one read tinted.
            The collapsed set is the same three colours scaled and re-anchored
            onto the strip. */}
        <div
          className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
          aria-hidden="true"
        >
          <div
            className={[
              "bg-ehs-normal-blue/20 absolute rounded-full blur-3xl",
              isCollapsed
                ? "-top-10 -left-8 size-32"
                : "-top-16 -left-12 size-56",
            ].join(" ")}
          />
          <div
            className={[
              "absolute rounded-full bg-cyan-300/25 blur-3xl",
              isCollapsed
                ? "top-[38%] -right-8 size-32"
                : "top-[38%] -right-16 size-56",
            ].join(" ")}
          />
          <div
            className={[
              "bg-ehs-normal-blue/15 absolute rounded-full blur-3xl",
              isCollapsed
                ? "-bottom-8 -left-6 size-32"
                : "-bottom-12 left-[10%] size-56",
            ].join(" ")}
          />
        </div>
        <DashboardSidebar onClose={closeSidebar} collapsed={isCollapsed} />
      </div>

      {/* `relative` so the content column stacks above the fixed ambient
          layer while its glass cards still blur the blobs behind them. */}
      {/* Subtracting the mobile header rather than a flat 100dvh: a full
          viewport here plus the 3.5rem header made every page scroll by the
          height of the header even when it had nothing to scroll. */}
      <div className="relative flex min-h-[calc(100dvh-3.5rem)] min-w-0 flex-1 flex-col overflow-x-hidden px-1.5 pt-4 lg:min-h-dvh">
        {organizationLimits ? (
          <OrganizationLimitsBanner
            limits={organizationLimits}
            className="mb-2 shrink-0"
          />
        ) : null}
        {children}
      </div>

      {/* The rail toggle. One button rather than a close-here / reopen-there
          pair: it stays mounted across both states, so keyboard focus never
          gets dropped, and there is only one control to find. Sits outside
          the sliding wrapper and straddles the rail's right edge in both
          states — 17rem expanded, 6rem for the icon rail. */}
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={isCollapsed ? "Expand navigation" : "Collapse navigation"}
        aria-expanded={!isCollapsed}
        aria-controls="app-sidebar"
        title={`${isCollapsed ? "Expand" : "Collapse"} navigation (Ctrl+B)`}
        className={[
          "border-ehs-hairline/60 bg-ehs-surface/70 text-ehs-muted-text hover:text-ehs-darker hover:bg-ehs-surface focus-visible:ring-ehs-normal-blue/40 fixed top-1/2 z-50 hidden size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border shadow-(--ehs-shadow-card) backdrop-blur-xl focus-visible:ring-2 focus-visible:outline-none lg:inline-flex",
          isCollapsed ? "left-20" : "left-64",
          // One transition-property utility at a time: stacking
          // `transition-colors` with the arbitrary list would leave stylesheet
          // order to decide which wins, and the `left` slide could lose.
          animationsArmed
            ? "transition-[left,color,background-color] duration-400 ease-linear motion-reduce:transition-none"
            : "transition-colors",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Icon
          icon={isCollapsed ? "mdi:chevron-right" : "mdi:chevron-left"}
          className="size-5"
          aria-hidden="true"
        />
      </button>

      {/* Fixed to the viewport, so it stays put while the content column scrolls. */}
      <AskNeptuneAiButton />
    </div>
  );
}
