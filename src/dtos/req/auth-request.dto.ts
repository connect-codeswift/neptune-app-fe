import { z } from "zod";
import {
  STRONG_PASSWORD_REGEX,
  WEAK_PASSWORD_MESSAGE,
} from "@/lib/password-strength";

const strongPasswordSchema = z
  .string()
  .regex(STRONG_PASSWORD_REGEX, WEAK_PASSWORD_MESSAGE);

const siteRequestSchema = z.object({
  id: z.number().int().nonnegative().optional(),
  industryType: z.string().trim().min(1, "Industry is required."),
  siteSize: z.string().trim().nullable().optional(),
  siteName: z.string().trim().min(1, "Site name is required."),
  location: z.string().trim().min(1, "Location is required."),
});

/** Matches backend `UserDto` for POST /Auth/register */
const registerRequestSchema = z.object({
  id: z.number().int().nonnegative().optional(),
  fullName: z.string().trim().min(1, "Full name is required.").max(50),
  email: z.email("Enter a valid email address.").max(50),
  isDemo: z.boolean().default(false),
  passwordHash: strongPasswordSchema,
  roleId: z.number().int().nonnegative(),
  organizationId: z.number().int().nonnegative(),
  organizationName: z.string().trim().min(1, "Organization name is required."),
  activatedModules: z.string().trim().min(1, "Select at least one module."),
  sites: z.array(siteRequestSchema).min(1, "At least one site is required."),
});

const signupFormSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required."),
    email: z.email("Enter a valid email address."),
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
    acceptTerms: z.literal(true, {
      error: "You must accept the terms to continue.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const loginRequestSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const forgotPasswordRequestSchema = z.object({
  email: z.email("Enter a valid email address."),
});

const resetPasswordRequestSchema = z.object({
  email: z.email("Enter a valid email address."),
  otp: z.string().min(1, "OTP is required."),
  newPassword: strongPasswordSchema,
});

/**
 * Must stay {@link strongPasswordSchema}. `AcceptInvitationDto` on the backend rejects a
 * mismatch with a bare 400 carrying no usable message, so the two rules have to agree
 * exactly — this schema used to be stricter to mirror an older backend rule.
 *
 * `siteId`, `userId` and `email` are gone: the invite link used to carry them in the query
 * string, where `userId` was a sequential integer and the email was known to whoever sent
 * the invite — guessing an id set that person's password. All three now come from the
 * token's own row. The token is single-use and expires after 7 days.
 */
const acceptInvitationRequestSchema = z.object({
  token: z.string().trim().min(1, "This invitation link is missing its token."),
  fullName: z.string().trim().min(1, "Full name is required.").max(50),
  contactNo: z.string().trim().max(30).optional(),
  profileUrl: z.string().trim().optional(),
  password: strongPasswordSchema,
});

const AUTHENTICATOR_CODE_MESSAGE =
  "Enter the 6-digit code from your authenticator app.";

const authenticatorCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, AUTHENTICATOR_CODE_MESSAGE);

const enableMfaRequestSchema = z.object({
  code: authenticatorCodeSchema,
});

/** Step two of sign-in — the challenge token from login plus a code from the app. */
const verifyMfaRequestSchema = z.object({
  mfaToken: z.string().trim().min(1, "This sign-in attempt has expired."),
  code: authenticatorCodeSchema,
});

/**
 * Turning 2FA off. The API decides which credential it requires — the password for a normal
 * account, an authenticator code for an SSO-only one — so both are optional here and the form
 * sends whichever it collected. Requiring the password in this schema would make the SSO case
 * unsubmittable.
 */
const disableMfaRequestSchema = z
  .object({
    currentPassword: z.string().optional(),
    code: authenticatorCodeSchema.optional(),
  })
  .refine((data) => Boolean(data.currentPassword) || Boolean(data.code), {
    message: "Confirm it's you before turning off two-factor authentication.",
    path: ["currentPassword"],
  });

/**
 * Changing your own password while signed in.
 *
 * `newPassword` must stay on {@link strongPasswordSchema} — the same rule the API applies. The
 * "must differ" check is also enforced server-side; it is repeated here only to save a round
 * trip.
 */
const changePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from your current one.",
    path: ["newPassword"],
  });

// =====================================================

export type SiteRequestDto = z.infer<typeof siteRequestSchema>;
/** @deprecated Use {@link SiteRequestDto} */
export type SubcompanyRequestDto = SiteRequestDto;
export type RegisterRequestDto = z.infer<typeof registerRequestSchema>;
export type SignupFormDto = z.infer<typeof signupFormSchema>;
export type LoginRequestDto = z.infer<typeof loginRequestSchema>;
export type ResetPasswordRequestDto = z.infer<
  typeof resetPasswordRequestSchema
>;
export type ForgotPasswordRequestDto = z.infer<
  typeof forgotPasswordRequestSchema
>;
export type AcceptInvitationRequestDto = z.infer<
  typeof acceptInvitationRequestSchema
>;
export type EnableMfaRequestDto = z.infer<typeof enableMfaRequestSchema>;
export type VerifyMfaRequestDto = z.infer<typeof verifyMfaRequestSchema>;
export type DisableMfaRequestDto = z.infer<typeof disableMfaRequestSchema>;
export type ChangePasswordFormDto = z.infer<typeof changePasswordRequestSchema>;
/** What the API takes — the form's `confirmPassword` never leaves the browser. */
export type ChangePasswordRequestDto = Readonly<{
  currentPassword: string;
  newPassword: string;
}>;

// =====================================================

export function parseRegisterRequest(data: unknown): RegisterRequestDto {
  return registerRequestSchema.parse(data);
}

export function safeParseSignupForm(data: unknown) {
  return signupFormSchema.safeParse(data);
}

export function safeParseLoginRequest(data: unknown) {
  return loginRequestSchema.safeParse(data);
}

export function safeParseResetPasswordRequest(data: unknown) {
  return resetPasswordRequestSchema.safeParse(data);
}

export function safeParseForgotPasswordRequest(data: unknown) {
  return forgotPasswordRequestSchema.safeParse(data);
}

export function safeParseAcceptInvitationRequest(data: unknown) {
  return acceptInvitationRequestSchema.safeParse(data);
}

export function safeParseEnableMfaRequest(data: unknown) {
  return enableMfaRequestSchema.safeParse(data);
}

export function safeParseVerifyMfaRequest(data: unknown) {
  return verifyMfaRequestSchema.safeParse(data);
}

export function safeParseDisableMfaRequest(data: unknown) {
  return disableMfaRequestSchema.safeParse(data);
}

export function safeParseChangePasswordRequest(data: unknown) {
  return changePasswordRequestSchema.safeParse(data);
}
