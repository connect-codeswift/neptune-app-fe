import { LogoIcon } from "@/components/LogoIcon";
import { Text } from "@/components/Text";

export type LogoProps = Readonly<{
  className?: string;
  variant?: "dark" | "light";
  text?: string;
}>;

export function Logo(props: Readonly<LogoProps>) {
  const { className = "", variant = "dark", text } = props;
  const textClassName =
    variant === "light" ? "text-ehs-light-text" : "text-ehs-darker";

  return (
    <div
      className={["flex items-center gap-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      <LogoIcon />
      <div className="flex flex-col justify-center">
        <Text
          as="span"
          className={[
            "text-base font-semibold tracking-tight",
            textClassName,
          ].join(" ")}
        >
          Neptune
        </Text>
        {text && (
          <Text as="p" className="text-ehs-muted-text text-[10px] leading-snug">
            {text}
          </Text>
        )}
      </div>
    </div>
  );
}
