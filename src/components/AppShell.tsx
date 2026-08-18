"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { OrganizationLimitsBanner } from "@/components/OrganizationLimitsBanner";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { useSessionBootstrap } from "@/hooks/use-session-bootstrap";
import { getAccessToken } from "@/lib/axios";
import { safeAppNavigate } from "@/lib/safe-app-navigation";
import { Icon } from "@iconify/react";

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
    <div className="flex min-h-dvh min-w-0 flex-col lg:ml-68 lg:flex-row">
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
      <header className="backdrop-blur-3.5 sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-[rgba(15,23,42,0.08)] bg-white/80 px-4 py-3.5 lg:hidden">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="text-ehs-gray hover:bg-ehs-light-bg inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(15,23,42,0.08)]"
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
        inert={!isDesktop && !sidebarOpen}
        className={[
          "fixed top-0 left-0 z-50 h-dvh w-68 max-w-[calc(100%-3rem)] p-2 transition-transform duration-300 lg:max-w-none lg:translate-x-0 lg:p-4 lg:pr-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* lg only: these exist purely as colour for the glass rail to
            refract. The mobile sheet is opaque, so below lg they are three
            full-size blur-3xl layers painting every frame behind something
            you cannot see through. */}
        <div
          className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
          aria-hidden="true"
        >
          <div className="bg-ehs-normal-blue/20 absolute -top-16 -left-12 size-56 rounded-full blur-3xl" />
          <div className="absolute top-[38%] -right-16 size-56 rounded-full bg-cyan-300/25 blur-3xl" />
          <div className="bg-ehs-normal-blue/15 absolute -bottom-12 left-[10%] size-56 rounded-full blur-3xl" />
        </div>
        <DashboardSidebar onClose={closeSidebar} />
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
    </div>
  );
}
