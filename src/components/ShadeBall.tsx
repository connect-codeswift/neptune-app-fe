export type ShadeBallProps = Readonly<{
  positionAsClassName?: string;
  size?: number;
  blur?: number;
  className?: string;
}>;

export function ShadeBall(props: Readonly<ShadeBallProps>) {
  const {
    positionAsClassName = "",
    size = 400,
    blur = 40,
    className = "",
  } = props;

  return (
    <div
      aria-hidden="true"
      className={[
        "bg-ehs-normal-blue/12 pointer-events-none absolute -z-10 overflow-clip rounded-full",
        positionAsClassName,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width: size, height: size, filter: `blur(${blur}px)` }}
    />
  );
}
