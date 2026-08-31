"use client";

import { NEPTUNE_AI_HREF } from "@/components/neptune-ai/neptune-ai-routes";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link, { useLinkStatus } from "next/link";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LogoMark } from "@/components/LogoMark";
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

/* The amber warning tile now runs on `--ehs-warning-surface` / `-border` / `-ink`,
   whose light values are the amber wash it used to hardcode. It had to become a
   token: Tailwind's amber-50/300/700 cannot flip, so on a dark rail the tile was
   a pale smudge with brown text.
   The skeleton bars use `--ehs-border-strong` at 40% == the slate-300/40 they
   had, which is deliberately lighter than the `--ehs-border` body bars. */

export type SidebarProps = Readonly<{
  className?: string;
  /**
   * Dismisses the mobile drawer. Absent on the desktop rail, which is always
   * on screen and has nothing to close.
   */
  onClose?: () => void;
  /**
   * Desktop mini-rail mode: icons only, labels and headings hidden. Every
   * style this flag changes is `lg:`-prefixed, so the mobile drawer renders
   * the full sidebar regardless — below lg "closed" already means off-canvas.
   */
  collapsed?: boolean;
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
      className="border-ehs-normal-blue/30 border-t-ehs-normal-blue size-3.5 shrink-0 animate-spin rounded-full border-2 motion-reduce:animate-none"
      aria-hidden="true"
    />
  );
}

function SidebarNavLink(
  props: Readonly<{
    item: AppNavItem;
    active: boolean;
    onNavigate?: () => void;
    collapsed?: boolean;
  }>,
) {
  const { item, active, onNavigate, collapsed = false } = props;

  // The Chat entry lights up in the assistant's own teal wash rather than the route-active
  // pill — per its design node, and so the one brand entry reads differently from modules.
  const activeClass =
    item.href === NEPTUNE_AI_HREF
      ? "bg-ehs-normal-blue/18 text-ehs-normal-blue font-bold"
      : "bg-ehs-light-blue text-ehs-darker";

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      // On the mini rail the label is display:none, which drops it from the
      // accessibility tree too — so the link carries its name explicitly, and
      // `title` gives sighted users the hover tooltip in its place.
      aria-label={collapsed ? item.label : undefined}
      title={collapsed ? item.label : undefined}
      className={[
        // py-2.5 on touch so the row clears a comfortable tap target; the
        // desktop rail is pointed at with a cursor and can stay compact.
        "text4 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors lg:py-2",
        collapsed ? "lg:justify-center lg:px-0 lg:py-2.5" : "",
        active
          ? activeClass
          : // Darker on the mobile sheet: there it sits over a blurred,
            // arbitrarily-coloured page instead of the desktop rail's calm
            // ground, and ehs-gray washed out against it. ehs-slate is the
            // designed one-step-darker companion, so this stays on palette.
            "text-ehs-slate lg:text-ehs-gray hover:bg-ehs-light-bg lg:hover:bg-ehs-surface/35",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon
        icon={item.icon}
        className={[
          "size-4.5 shrink-0",
          collapsed ? "lg:size-5" : "",
          active ? "text-ehs-normal-blue" : "text-ehs-muted-text",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden="true"
      />
      {/* Fades out, then hides — `transition-discrete` lets `display` flip at
          the end of the fade instead of on the first frame. Without it the
          label vanished instantly while the rail spent 300ms narrowing around
          it, which is the pop that made collapsing look broken. Browsers
          without discrete transitions fall back to that instant hide. */}
      <span
        className={[
          "min-w-0 flex-1 truncate",
          "transition-[opacity,display] transition-discrete duration-200 ease-linear motion-reduce:transition-none",
          collapsed
            ? "lg:hidden lg:opacity-0"
            : "lg:opacity-100 lg:starting:opacity-0",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {item.label}
      </span>
      <SidebarNavLinkPending />
      {item.badge === undefined ? null : (
        <span
          className={[
            "text7 text-ehs-muted-text shrink-0",
            "transition-[opacity,display] transition-discrete duration-150 ease-linear motion-reduce:transition-none",
            collapsed
              ? "lg:hidden lg:opacity-0"
              : "lg:opacity-100 lg:starting:opacity-0",
          ]
            .filter(Boolean)
            .join(" ")}
        >
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
          <div className="bg-ehs-border-strong/40 mx-3 h-2.5 w-16 animate-pulse rounded" />
          {Array.from({ length: 3 }).map((__, itemIndex) => (
            <div
              key={itemIndex}
              className="bg-ehs-border-strong/40 mx-2 h-9 animate-pulse rounded-lg"
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
        className="bg-ehs-border-strong/40 h-9 w-9 shrink-0 animate-pulse rounded-lg"
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="bg-ehs-border-strong/40 h-3.5 w-24 animate-pulse rounded" />
        <div className="bg-ehs-border-strong/40 h-3 w-32 animate-pulse rounded" />
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
/**
 * The access-window notice in the sidebar footer.
 *
 * Three states, one shape. The tone carries the whole difference — panel tint, edge, icon chip
 * and headline ink all move together — so the notice never reads as a different component when
 * it escalates.
 *
 * Everything is a token rather than a literal because this box has to work on both the near-white
 * sidebar and the near-black one. Amber is the case that forced the issue: written as Tailwind's
 * amber-50/300/700 it was a pale wash with brown text, which on a dark rail is a smudge.
 */
function SidebarAccessWindow(
  props: Readonly<{ accessWindow: AccessWindowState }>,
) {
  const { accessWindow } = props;
  const days = accessWindow.daysRemaining;
  const hasExpired = days <= 0;
  const isUrgent = days <= 7;

  const expiredTone = {
    panel: "border-ehs-red/30 bg-ehs-red/8",
    chip: "bg-ehs-red/15 text-ehs-red",
    title: "text-ehs-red",
    rule: "border-ehs-red/20",
  };
  const urgentTone = {
    panel: "border-ehs-warning-border bg-ehs-warning-surface",
    chip: "bg-ehs-warning-ink/15 text-ehs-warning-ink",
    title: "text-ehs-warning-ink",
    rule: "border-ehs-warning-border",
  };
  const calmTone = {
    panel: "border-ehs-border bg-ehs-surface/50",
    chip: "bg-ehs-normal-blue/12 text-ehs-normal-blue",
    title: "text-ehs-darker",
    rule: "border-ehs-border",
  };

  const urgentOrCalm = isUrgent ? urgentTone : calmTone;
  const tone = hasExpired ? expiredTone : urgentOrCalm;

  return (
    <div className="shrink-0 px-4 pt-1 pb-1">
      <div
        role="status"
        className={`rounded-2.5 flex flex-col gap-2 border px-3 py-2.75 ${tone.panel}`}
      >
        <div className="flex items-start gap-2.5">
          {/* The icon sits in a chip rather than loose against the text: at 14px an outline glyph
              on a tinted panel has almost no presence, and the chip gives it a shape to hold. */}
          <span
            className={`inline-flex size-7 shrink-0 items-center justify-center rounded-lg ${tone.chip}`}
            aria-hidden="true"
          >
            <Icon
              icon={
                hasExpired ? "mdi:alert-circle-outline" : "mdi:clock-outline"
              }
              className="size-4"
            />
          </span>

          <div className="flex min-w-0 flex-col gap-0.5">
            <Text as="span" className={`text5 leading-tight ${tone.title}`}>
              {formatAccessWindowRemaining(days)}
            </Text>
            <Text as="span" className="text8 text-ehs-muted-text leading-tight">
              {`Ends ${formatAccessWindowExpiry(accessWindow.accessExpiresAt)}`}
            </Text>
          </div>
        </div>

        {isUrgent ? (
          /* Divided off rather than stacked as a third line of meta: it is the one thing here
             the reader can act on, and it should not read as more small print. */
          <Text
            as="p"
            className={`text8 text-ehs-gray border-t pt-2 leading-tight ${tone.rule}`}
          >
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
    collapsed?: boolean;
  }>,
) {
  const { displayName, initials, profileUrl, email, collapsed = false } = props;

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
          className="bg-ehs-normal-blue text-ehs-on-accent text7 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          aria-hidden="true"
        >
          {initials}
        </div>
      )}
      <div className={collapsed ? "min-w-0 lg:hidden" : "min-w-0"}>
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
  const { className = "", onClose, collapsed = false } = props;
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
        "border-ehs-border bg-ehs-surface lg:border-ehs-hairline/60 lg:bg-ehs-surface/45 lg:backdrop-blur-2xl",
        "shadow-(--ehs-shadow-shell)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={["shrink-0 px-5 pt-5", collapsed ? "lg:px-3" : ""]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="relative flex items-center justify-between lg:justify-center">
          {/* The wordmark cannot fit the mini rail, so it shows the trident
              mark alone - same asset the favicon uses. Both stay mounted; the
              breakpoint prefix picks which one shows. */}
          <Logo className={collapsed ? "lg:hidden" : ""} />
          {collapsed ? (
            <span
              className="hidden h-6 items-center lg:flex"
              role="img"
              aria-label="Neptune"
            >
              {/* The vector mark, not the favicon bitmap: it draws with
                  currentColor, so it follows the theme the same way the
                  wordmark does — the black PNG vanished on a dark rail. */}
              <LogoMark className="text-ehs-dark-bg size-5.5" decorative />
            </span>
          ) : null}
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
          className="border-ehs-border lg:border-ehs-hairline/60 mt-4 w-full border-t"
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
          className={[
            "flex min-h-0 flex-1 scrollbar-none flex-col gap-6 overflow-y-auto overscroll-contain px-4 py-5",
            collapsed ? "lg:gap-3 lg:px-2" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {isLoading ? (
            <SidebarNavSkeleton />
          ) : (
            navGroups.map((group, groupIndex) => (
              // Title alone is not unique — the design repeats the NEPTUNE AI heading.
              <div
                key={`${group.title}-${String(groupIndex)}`}
                className="flex flex-col gap-1"
              >
                {/* On the mini rail a heading has no room, but the grouping
                    still earns its keep - a hairline where each heading was
                    keeps Safety from bleeding into Compliance. */}
                {collapsed && groupIndex > 0 ? (
                  <div
                    className="border-ehs-hairline/60 mx-2 mb-2 hidden border-t lg:block"
                    aria-hidden="true"
                  />
                ) : null}
                <Text
                  as="p"
                  className={[
                    "text6 text-ehs-muted-text px-3 pb-1",
                    "transition-[opacity,display] transition-discrete duration-150 ease-linear motion-reduce:transition-none",
                    collapsed
                      ? "lg:hidden lg:opacity-0"
                      : "lg:opacity-100 lg:starting:opacity-0",
                  ]
                    .filter(Boolean)
                    .join(" ")}
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
                      collapsed={collapsed}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </nav>
        <div
          className="from-ehs-surface lg:from-ehs-surface/70 pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-linear-to-t to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* Hidden on the mini rail rather than shrunk: reduced to a bare icon
          the countdown loses the one thing it exists to say. It returns the
          moment the rail expands. */}
      {accessWindow ? (
        <div className={collapsed ? "contents lg:hidden" : "contents"}>
          <SidebarAccessWindow accessWindow={accessWindow} />
        </div>
      ) : null}

      <div
        className={[
          "border-ehs-border lg:border-ehs-hairline/40 shrink-0 border-t px-4 py-4",
          collapsed ? "lg:px-2 lg:py-3" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className={[
            "flex items-center gap-1",
            collapsed ? "lg:flex-col lg:gap-2" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {isUserReady ? (
            <Link
              href="/dashboard/my-profile"
              onClick={onClose}
              aria-label={collapsed ? "My profile" : undefined}
              title={collapsed ? user.displayName : undefined}
              className={[
                "flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-2 transition-colors",
                collapsed ? "lg:flex-initial lg:justify-center lg:p-1.5" : "",
                profileActive
                  ? "bg-ehs-light-blue text-ehs-darker"
                  : "hover:bg-ehs-light-bg lg:hover:bg-ehs-surface/35",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={profileActive ? "page" : undefined}
            >
              <SidebarUserFooter
                displayName={user.displayName}
                initials={user.initials}
                profileUrl={user.profileUrl}
                email={user.email}
                collapsed={collapsed}
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
            className="text-ehs-muted-text hover:text-ehs-red hover:bg-ehs-light-bg lg:hover:bg-ehs-surface/50 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
