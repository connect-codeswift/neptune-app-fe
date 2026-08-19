import type { ReactNode } from "react";

export type IncidentGlassCardProps = Readonly<{
  children: ReactNode;
  className?: string;
  paddingClassName?: string;
  incidentGlassCardClassName?: string;
}>;

// Aligned with GLASS_SURFACE's thinner pane (white/50, blur-xl) so the two
// card systems read as one material now that AppShell paints ambient colour
// behind every page. The 80%-white fill predated that ground and read opaque.
const cardShellClass =
  "relative flex flex-col rounded-5 border border-ehs-hairline/70 bg-ehs-surface/50 shadow-(--ehs-shadow-card) backdrop-blur-xl before:pointer-events-none before:absolute before:inset-0 before:rounded-5 before:content-['']";

export function IncidentGlassCard(props: Readonly<IncidentGlassCardProps>) {
  const {
    children,
    className = "",
    paddingClassName = "p-5",
    incidentGlassCardClassName = "",
  } = props;

  return (
    <article
      className={[
        cardShellClass,
        // Same entrance and hover response as GlassCard, so incidents, PPE,
        // audits and the rest move like the dashboard rather than sitting
        // still next to it. Both utilities self-disable under
        // prefers-reduced-motion; `className` still wins, being appended last.
        //
        // NOTE: this shell duplicates GlassCard's surface rather than reusing
        // GLASS_SURFACE — worth unifying, at which point this line goes away.
        "animate-card-rise card-lift",
        paddingClassName,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={`relative z-1 flex h-full min-w-0 flex-col ${incidentGlassCardClassName}`}
      >
        {children}
      </div>
    </article>
  );
}
