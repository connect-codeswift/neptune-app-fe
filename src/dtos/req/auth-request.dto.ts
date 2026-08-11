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
  sites: z
    .array(siteRequestSchema)
    .min(1, "At least one site is required."),
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
 */
const acceptInvitationRequestSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required.").max(50),
  contactNo: z.string().trim().max(30).optional(),
  siteId: z.number().int().nonnegative(),
  userId: z.number().int().nonnegative(),
  email: z.email("Enter a valid email address."),
  password: strongPasswordSchema,
});

const enableMfaRequestSchema = z.object({
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
