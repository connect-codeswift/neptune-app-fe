import { LogoIcon } from "@/components/LogoIcon";

export type LogoProps = Readonly<{
  className?: string;
  variant?: "dark" | "light";
}>;

export function Logo(props: Readonly<LogoProps>) {
  const { className = "", variant = "dark" } = props;

  return (
    <div
      className={["inline-flex items-center justify-center", className]
        .filter(Boolean)
        .join(" ")}
    >
      <LogoIcon variant={variant} className="h-6 w-auto" />
    </div>
  );
}
