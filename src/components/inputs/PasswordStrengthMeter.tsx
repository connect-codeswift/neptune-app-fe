import {
  getPasswordStrengthScore,
  PASSWORD_STRENGTH_SEGMENTS,
} from "@/lib/password-strength";

type PasswordStrengthMeterProps = Readonly<{
  password: string;
}>;

function getFilledSegmentClass(score: number): string {
  if (score <= 2) {
    return "bg-ehs-red";
  }

  if (score === 3) {
    return "bg-ehs-yellow";
  }

  return "bg-ehs-green";
}

export function PasswordStrengthMeter({
  password,
}: PasswordStrengthMeterProps) {
  const score = getPasswordStrengthScore(password);
  const filledClass = getFilledSegmentClass(score);

  return (
    <>
      <meter
        value={score}
        min={0}
        max={PASSWORD_STRENGTH_SEGMENTS}
        className="sr-only"
      >
        Password strength
      </meter>
      <div className="grid grid-cols-5 gap-1.5" aria-hidden="true">
        {Array.from({ length: PASSWORD_STRENGTH_SEGMENTS }, (_, index) => (
          <div
            key={index}
            className={[
              "h-1 rounded-full transition-colors",
              index < score ? filledClass : "bg-ehs-border",
            ].join(" ")}
          />
        ))}
      </div>
    </>
  );
}
