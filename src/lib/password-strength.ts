export const PASSWORD_STRENGTH_SEGMENTS = 5;

/** Matches backend UserDto password rule (letter + digit + symbol, 8+ chars). */
export const STRONG_PASSWORD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const WEAK_PASSWORD_MESSAGE =
  "Password must be at least 8 characters and include a letter, a number and a symbol.";

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

  if (/[A-Za-z]/.test(password)) {
    score++;
  }

  if (/\d/.test(password)) {
    score++;
  }

  if (/[^A-Za-z\d]/.test(password)) {
    score++;
  }

  if (isStrongPassword(password)) {
    score++;
  }

  return Math.min(score, PASSWORD_STRENGTH_SEGMENTS);
}
