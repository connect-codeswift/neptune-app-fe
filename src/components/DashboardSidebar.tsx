"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import Link, { useLinkStatus } from "next/link";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Text } from "@/components/Text";
import { NeptuneLoader } from "@/components/ui/NeptuneLoader";
import { useLogout } from "@/hooks/use-logout";
import { useSessionBootstrap } from "@/hooks/use-session-bootstrap";
import type { AppNavItem } from "@/lib/app-nav";
import {
  formatAccessWindowExpiry,
  formatAccessWindowRemaining,
  type AccessWindowState,
} from "@/lib/access-window";

export type SidebarProps = Readonly<{
  className?: string;
  /**
   * Dismisses the mobile drawer. Absent on the desktop rail, which is always
   * on screen and has nothing to close.
   */
  onClose?: () => void;
}>;

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Pending dot for a nav link, shown while its navigation is in flight.
 *
 * Only 3 of the app's ~112 routes ship a loading.tsx, so for nearly every
 * sidebar item the click produced no feedback at all until the new page
 * swapped in — the "I clicked and nothing happened" gap. `useLinkStatus` is
 * Next's hook for exactly that case (a dynamic destination with no route-level
 * fallback); it must live inside the <Link>, which is why this is a separate
 * component rather than a flag on the parent.
 */
function SidebarNavLinkPending() {
  const { pending } = useLinkStatus();

  if (!pending) {
    return null;
  }

  return (
    <span
      className="border-ehs-normal-blue/30 border-t-ehs-normal-blue size-3.5 shrink-0 animate-spin rounded-full border-[1.5px] motion-reduce:animate-none"
      aria-hidden="true"
    />
  );
}

function SidebarNavLink(
  props: Readonly<{
    item: AppNavItem;
    active: boolean;
    onNavigate?: () => void;
  }>,
) {
  const { item, active, onNavigate } = props;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={[
        // py-2.5 on touch so the row clears a comfortable tap target; the
        // desktop rail is pointed at with a cursor and can stay compact.
        "text4 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors lg:py-2",
        active
          ? "bg-ehs-light-blue text-ehs-darker"
          : // Darker on the mobile sheet: there it sits over a blurred,
            // arbitrarily-coloured page instead of the desktop rail's calm
            // ground, and ehs-gray washed out against it. ehs-slate is the
            // designed one-step-darker companion, so this stays on palette.
            "text-ehs-slate lg:text-ehs-gray hover:bg-ehs-light-bg lg:hover:bg-white/35",
      ].join(" ")}
    >
      <Icon
        icon={item.icon}
        className={[
          "size-4.5 shrink-0",
          active ? "text-ehs-normal-blue" : "text-ehs-muted-text",
        ].join(" ")}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      <SidebarNavLinkPending />
      {item.badge === undefined ? null : (
        <span className="text7 text-ehs-muted-text shrink-0">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function SidebarNavSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-4 py-5">
      {Array.from({ length: 4 }).map((_, groupIndex) => (
        <div key={groupIndex} className="flex flex-col gap-2">
          <div className="mx-3 h-2.5 w-16 animate-pulse rounded bg-slate-300/40" />
          {Array.from({ length: 3 }).map((__, itemIndex) => (
            <div
              key={itemIndex}
              className="mx-2 h-9 animate-pulse rounded-lg bg-slate-300/40"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function SidebarUserSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-2">
      <div
        className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-slate-300/40"
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="h-3.5 w-24 animate-pulse rounded bg-slate-300/40" />
        <div className="h-3 w-32 animate-pulse rounded bg-slate-300/40" />
      </div>
    </div>
  );
}

/**
 * Remaining trial window, sat under the nav.
 *
 * It used to be a full-width banner across the top of every page, which spent
 * the most valuable strip of the screen on a sentence that does not change from
 * one day to the next. Down here it is a status line rather than an alert: read
 * once, then ignored until the number gets small.
 *
 * Which is why the copy escalates instead of the placement — "Contact CodeSwift"
 * only appears in the last week, when it is finally something to act on.
 */
function SidebarAccessWindow(
  props: Readonly<{ accessWindow: AccessWindowState }>,
) {
  const { accessWindow } = props;
  const days = accessWindow.daysRemaining;
  const hasExpired = days <= 0;
  const isUrgent = days <= 7;

  const tone = hasExpired
    ? {
        box: "border-ehs-red/25 bg-ehs-red/[0.06]",
        icon: "text-ehs-red",
        title: "text-ehs-red",
      }
    : isUrgent
      ? {
          box: "border-amber-300/50 bg-amber-50/70",
          icon: "text-amber-600",
          title: "text-amber-700",
        }
      : {
          box: "border-ehs-border bg-ehs-light-bg/60",
          icon: "text-ehs-muted-text",
          title: "text-ehs-darker",
        };

  return (
    <div className="shrink-0 px-4 pt-1 pb-1">
      <div
        role="status"
        className={`flex flex-col gap-0.5 rounded-xl border px-3 py-2.5 ${tone.box}`}
      >
        <div className="flex items-center gap-1.5">
          <Icon
            icon={hasExpired ? "mdi:alert-circle-outline" : "mdi:clock-outline"}
            className={`size-3.5 shrink-0 ${tone.icon}`}
            aria-hidden="true"
          />
          <Text as="span" className={`text5 ${tone.title}`}>
            {formatAccessWindowRemaining(days)}
          </Text>
        </div>

        <Text as="p" className="text8 text-ehs-muted-text pl-5">
          {`Ends ${formatAccessWindowExpiry(accessWindow.accessExpiresAt)}`}
        </Text>

        {isUrgent ? (
          <Text as="p" className="text8 text-ehs-muted-text pl-5">
            Contact CodeSwift to extend
          </Text>
        ) : null}
      </div>
    </div>
  );
}

function SidebarUserFooter(
  props: Readonly<{
    displayName: string;
    initials: string;
    profileUrl: string | null;
    email: string | null;
  }>,
) {
  const { displayName, initials, profileUrl, email } = props;

  return (
    <>
      {profileUrl ? (
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={profileUrl}
            alt=""
            fill
            sizes="36px"
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className="bg-ehs-normal-blue text-ehs-light-text text7 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          aria-hidden="true"
        >
          {initials}
        </div>
      )}
      <div className="min-w-0">
        <Text as="p" className="text4 text-ehs-darker truncate">
          {displayName}
        </Text>
        <Text as="p" className="text8 text-ehs-muted-text truncate">
          {email ?? ""}
        </Text>
      </div>
    </>
  );
}

export function DashboardSidebar(props: Readonly<SidebarProps>) {
  const { className = "", onClose } = props;
  const pathname = usePathname();
  const { navGroups, isLoading, isUserReady, user, accessWindow } =
    useSessionBootstrap();
  const { signOut, isLoggingOut } = useLogout();
  const profileActive = isActivePath(pathname, "/dashboard/my-profile");

  return (
    <aside
      className={[
        // Glass from lg up, solid below it. The recipe — thin white pane,
        // heavy blur, hairline border, inset top highlight — only reads as
        // frosted when there is something worth refracting behind it, which
        // on the desktop rail is AppShell's blobs. The mobile sheet floats
        // over whatever page you happened to be on, so the same 45% white
        // just picked up that page's colour and made the nav muddy.
        //
        // Fills its container rather than sizing itself: the inset and the
        // viewport height live on AppShell's drawer wrapper, so the panel is
        // the same component whether it's the desktop rail or the mobile
        // sheet. min-h-0 lets the nav below actually scroll instead of
        // pushing the footer off the bottom.
        "relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-3xl border",
        "border-ehs-border bg-white lg:border-white/60 lg:bg-white/45 lg:backdrop-blur-2xl",
        "shadow-[0_1px_2px_0_rgba(15,23,42,0.04),0_24px_48px_-16px_rgba(15,23,42,0.18),inset_0_1px_0_1px_rgba(255,255,255,0.85)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="shrink-0 px-5 pt-5">
        <div className="relative flex items-center justify-between">
          <Logo />
          {onClose ? (
            <button
              type="button"
              data-sidebar-close=""
              onClick={onClose}
              aria-label="Close navigation menu"
              className="text-ehs-muted-text hover:text-ehs-darker hover:bg-ehs-light-bg absolute -right-1 inline-flex size-9 items-center justify-center rounded-lg transition-colors lg:hidden"
            >
              <Icon icon="mdi:close" className="size-5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        {/* White hairline rather than the app border token — on glass a grey
            rule reads as a smudge. On the solid sheet it is the inverse: a
            white rule on white is no rule at all. */}
        <div
          className="border-ehs-border mt-4 w-full border-t lg:border-white/60"
          aria-hidden="true"
        />
      </div>

      {/* The nav is the only part that scrolls, and its scrollbar is hidden,
          so a short viewport used to cut a group off mid-list with no hint
          there was more — a heading stranded above the trial card. The fade
          is that hint. */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <nav
          aria-label="Main"
          className="flex min-h-0 flex-1 scrollbar-none flex-col gap-6 overflow-y-auto overscroll-contain px-4 py-5"
        >
          {isLoading ? (
            <SidebarNavSkeleton />
          ) : (
            navGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-1">
                <Text
                  as="p"
                  className="text6 text-ehs-muted-text px-3 pb-1"
                >
                  {group.title}
                </Text>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => (
                    <SidebarNavLink
                      key={`${group.title}-${item.label}-${item.href}`}
                      item={item}
                      active={isActivePath(pathname, item.href)}
                      onNavigate={onClose}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </nav>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-white to-transparent lg:from-white/70"
          aria-hidden="true"
        />
      </div>

      {accessWindow ? (
        <SidebarAccessWindow accessWindow={accessWindow} />
      ) : null}

      <div className="border-ehs-border shrink-0 border-t px-4 py-4 lg:border-white/40">
        <div className="flex items-center gap-1">
          {isUserReady ? (
            <Link
              href="/dashboard/my-profile"
              onClick={onClose}
              className={[
                "flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-2 transition-colors",
                profileActive
                  ? "bg-ehs-light-blue text-ehs-darker"
                  : "hover:bg-ehs-light-bg lg:hover:bg-white/35",
              ].join(" ")}
              aria-current={profileActive ? "page" : undefined}
            >
              <SidebarUserFooter
                displayName={user.displayName}
                initials={user.initials}
                profileUrl={user.profileUrl}
                email={user.email}
              />
            </Link>
          ) : (
            <SidebarUserSkeleton />
          )}

          <button
            type="button"
            onClick={() => void signOut()}
            disabled={isLoggingOut || !isUserReady}
            aria-label={isLoggingOut ? "Signing out" : "Log out"}
            title={isLoggingOut ? "Signing out…" : "Log out"}
            className="text-ehs-muted-text hover:text-ehs-red hover:bg-ehs-light-bg inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 lg:hover:bg-white/50"
          >
            <Icon
              icon={isLoggingOut ? "mdi:loading" : "mdi:logout"}
              className={[
                "size-4.5",
                isLoggingOut ? "animate-spin motion-reduce:animate-none" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Portalled to <body> rather than rendered here: this aside sits inside
          a translated container, and a transformed ancestor becomes the
          containing block for fixed positioning — so a full-screen overlay
          rendered in place would be clipped to the width of the sidebar.
          Covers the sign-out round trip, and with it any last frame of the
          session being torn down. */}
      {isLoggingOut && globalThis.document !== undefined
        ? createPortal(
            <NeptuneLoader fullScreen label="Signing you out…" />,
            globalThis.document.body,
          )
        : null}
    </aside>
  );
}
