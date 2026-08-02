import type { ReactNode } from "react";

/**
 * The command-center card surface (Figma node 6154:27540,
 * "Overlay+Border+OverlayBlur").
 *
 * Every dashboard card sits on this one surface so the ambient page gradient
 * reads through them consistently. The three shadows are, in order: the
 * contact shadow, the soft lift, and the inset top highlight that gives the
 * frosted edge — in Figma the highlight is a separate stacked layer, but as an
 * inset shadow it renders identically without the extra element.
 */
export type GlassCardProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

export const GLASS_SURFACE =
  "rounded-[20px] border border-white/90 bg-white/[0.62] backdrop-blur-[10px] " +
  "shadow-[0_1px_2px_0_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.14),inset_0_1px_0_1px_rgba(255,255,255,0.9)]";

export function GlassCard(props: Readonly<GlassCardProps>) {
  const { children, className = "" } = props;

  return (
    <article
      className={[
        GLASS_SURFACE,
        "flex min-w-0 flex-col gap-[10px] p-[19px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </article>
  );
}
