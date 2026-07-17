export const PASSWORD_STRENGTH_SEGMENTS = 5;

export function getPasswordStrengthScore(password: string): number {
  if (!password) {
    return 0;
  }

  let score = 0;

  if (password.length >= 8) {
    score++;
  }

  if (password.length >= 12) {
    score++;
  }

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  }

  if (/\d/.test(password)) {
    score++;
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score++;
  }

  return Math.min(score, PASSWORD_STRENGTH_SEGMENTS);
}
