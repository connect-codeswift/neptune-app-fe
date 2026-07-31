export const PASSWORD_STRENGTH_SEGMENTS = 5;

/** Matches backend RegularExpression for strong passwords. */
export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const WEAK_PASSWORD_MESSAGE = "Weak password";

export function isStrongPassword(password: string): boolean {
  return STRONG_PASSWORD_REGEX.test(password);
}

export function getPasswordStrengthScore(password: string): number {
  if (!password) {
    return 0;
  }

  let score = 0;

  if (password.length >= 8) {
    score++;
  }

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  }

  if (/\d/.test(password)) {
    score++;
  }

  if (/[@$!%*?&]/.test(password)) {
    score++;
  }

  if (isStrongPassword(password)) {
    score++;
  }

  return Math.min(score, PASSWORD_STRENGTH_SEGMENTS);
}
