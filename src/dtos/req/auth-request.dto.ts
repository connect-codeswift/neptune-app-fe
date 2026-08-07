import { z } from "zod";
import {
  STRONG_PASSWORD_REGEX,
  WEAK_PASSWORD_MESSAGE,
} from "@/lib/password-strength";

export const strongPasswordSchema = z
  .string()
  .regex(STRONG_PASSWORD_REGEX, WEAK_PASSWORD_MESSAGE);

export const siteRequestSchema = z.object({
  id: z.number().int().nonnegative().optional(),
  industryType: z.string().trim().min(1, "Industry is required."),
  siteSize: z.string().trim().nullable().optional(),
  siteName: z.string().trim().min(1, "Site name is required."),
  location: z.string().trim().min(1, "Location is required."),
});

/** @deprecated Use {@link siteRequestSchema} */
export const subcompanyRequestSchema = siteRequestSchema;

/** Matches backend `UserDto` for POST /Auth/register */
export const registerRequestSchema = z.object({
  id: z.number().int().nonnegative().optional(),
  fullName: z.string().trim().min(1, "Full name is required.").max(50),
  email: z.email("Enter a valid email address.").max(50),
  isDemo: z.boolean().default(false),
  passwordHash: strongPasswordSchema,
  roleId: z.number().int().nonnegative(),
  organizationId: z.number().int().nonnegative(),
  organizationName: z.string().trim().min(1, "Organization name is required."),
  activatedModules: z.string().trim().min(1, "Select at least one module."),
  sites: z
    .array(siteRequestSchema)
    .min(1, "At least one site is required."),
});

export const signupFormSchema = z
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

export const loginRequestSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const forgotPasswordRequestSchema = z.object({
  email: z.email("Enter a valid email address."),
});

export const resetPasswordRequestSchema = z.object({
  email: z.email("Enter a valid email address."),
  otp: z.string().min(1, "OTP is required."),
  newPassword: strongPasswordSchema,
});

/**
 * Deliberately NOT {@link strongPasswordSchema}. `AcceptInvitationDto` on the backend
 * enforces a stricter, different rule than every other password endpoint: it demands an
 * upper AND a lower case letter, and restricts symbols to `@$!%*?&`. A password this app's
 * shared rule accepts (say `neptune1#`) is rejected there by model validation, which
 * returns a bare 400 with no usable message — so the rules have to match exactly.
 */
export const INVITE_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const INVITE_PASSWORD_MESSAGE =
  "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number and one of @ $ ! % * ? &.";

export const acceptInvitationRequestSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required.").max(50),
  contactNo: z.string().trim().max(30).optional(),
  siteId: z.number().int().nonnegative(),
  userId: z.number().int().nonnegative(),
  email: z.email("Enter a valid email address."),
  password: z.string().regex(INVITE_PASSWORD_REGEX, INVITE_PASSWORD_MESSAGE),
});

export const enableMfaRequestSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your authenticator app."),
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

// =====================================================

export function parseRegisterRequest(data: unknown): RegisterRequestDto {
  return registerRequestSchema.parse(data);
}

export function safeParseRegisterRequest(data: unknown) {
  return registerRequestSchema.safeParse(data);
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
