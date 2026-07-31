import type { ReactNode } from "react";

export type IncidentGlassCardProps = Readonly<{
  children: ReactNode;
  className?: string;
  paddingClassName?: string;
  incidentGlassCardClassName?: string;
}>;

const cardShellClass =
  "relative flex flex-col rounded-[20px] border border-white/90 bg-white/80 shadow-[0px_1px_2px_0px_rgba(15,23,42,0.04),0px_12px_32px_-12px_rgba(15,23,42,0.14)] backdrop-blur-[14px] before:pointer-events-none before:absolute before:inset-0 before:rounded-[20px] before:content-[''] before:shadow-[inset_0px_1px_0px_1px_rgba(255,255,255,0.9)]";

export function IncidentGlassCard(props: Readonly<IncidentGlassCardProps>) {
  const {
    children,
    className = "",
    paddingClassName = "p-5",
    incidentGlassCardClassName = "",
  } = props;

  return (
    <article
      className={[cardShellClass, paddingClassName, className]
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
