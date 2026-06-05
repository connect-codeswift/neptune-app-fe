const blurOrbClass =
  "bg-ehs-normal-blue/12 pointer-events-none absolute size-[400px] rounded-full blur-[280px]";

export type BlurOrbProps = Readonly<{
  className?: string;
}>;

/** 400×400 normal-blue orb at 12% opacity with 280px uniform blur. */
export function BlurOrb(props: Readonly<BlurOrbProps>) {
  const { className = "" } = props;

  return (
    <div
      aria-hidden="true"
      className={[blurOrbClass, className].filter(Boolean).join(" ")}
    />
  );
}
