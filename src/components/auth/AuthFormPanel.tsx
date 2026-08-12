import type { ReactNode } from "react";
import { LogoIcon } from "@/components/LogoIcon";
import { ShadeBall } from "@/components/ShadeBall";

/**
 * The auth card's own glass, not GLASS_SURFACE: the dashboard surface is
 * tuned for cards over the app's ambient gradient, and at 62% white on this
 * near-white page it reads as a plain card. Glass only reads as glass when
 * there is colour behind it to blur, so this pane is thinner (45% white,
 * heavier blur) and the panel paints soft colour blobs behind it below.
 */
const authGlassClass =
  "rounded-3xl border border-white/60 bg-white/45 backdrop-blur-2xl " +
  "shadow-[0_1px_2px_0_rgba(15,23,42,0.04),0_24px_48px_-16px_rgba(15,23,42,0.18),inset_0_1px_0_1px_rgba(255,255,255,0.85)]";

export type AuthFormPanelProps = Readonly<{
  title: string;
  subtitle: string;
  /** SSO buttons, divider and form — everything inside the glass card. */
  children: ReactNode;
  /** The cross-link below the card ("Don't have an account? …"). */
  footer?: ReactNode;
  /**
   * Rendered before the background, for a full-screen cover such as the
   * sign-in loader. Kept outside the centred column so it isn't clipped.
   */
  overlay?: ReactNode;
}>;

/**
 * The form side of every auth screen — sign in, sign up, forgot and reset
 * password.
 *
 * Shared rather than copied so the four screens cannot drift apart again. They
 * had: three different grounds (one on a nested div with an inline style), two
 * different max-widths, two different ShadeBall blurs, a glass card on sign-in
 * only, and a mobile logo on sign-in only — so on a phone three of the four
 * screens showed no Neptune mark at all. Each screen now supplies only its own
 * heading, fields and footer link.
 */
export function AuthFormPanel(props: Readonly<AuthFormPanelProps>) {
  const { title, subtitle, children, footer, overlay } = props;

  return (
    <div className="bg-ehs-light-bg relative flex h-full items-center justify-center px-4 py-8 lg:px-8">
      {overlay}

      <ShadeBall positionAsClassName="-top-37.5 -right-37.5" blur={80} />
      <ShadeBall
        positionAsClassName="-bottom-37.5 -left-37.5"
        blur={80}
      />

      {/* Colour for the glass to blur: without these, the pane sits on a
          near-white ground and reads as a plain card. Placed to break across
          the card's edges, where refraction is most visible. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="bg-ehs-normal-blue/25 absolute top-[24%] left-1/2 size-80 -translate-x-[85%] rounded-full blur-3xl" />
        <div className="absolute top-[58%] left-1/2 size-80 -translate-x-[8%] rounded-full bg-cyan-300/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-120 flex-col gap-6">
        {/* The brand panel is hidden below lg, which left phones with no logo
            anywhere on the page — this is the mobile-only signature. */}
        <LogoIcon variant="dark" className="mx-auto h-5 w-auto lg:hidden" />

        {/* Not <GlassCard>: the shared component carries hover-lift, and a
            form shouldn't lift under the cursor like a clickable card. The
            rise entrance alone is welcome here. */}
        <div
          className={`${authGlassClass} animate-card-rise flex flex-col gap-6 p-7 sm:p-10`}
        >
          <div className="flex flex-col gap-1.5">
            <h2 className="text-ehs-darker text-2xl font-bold tracking-tight lg:text-3xl">
              {title}
            </h2>
            <p className="text-ehs-muted-text text-sm">{subtitle}</p>
          </div>

          {children}
        </div>

        {footer}
      </div>
    </div>
  );
}
