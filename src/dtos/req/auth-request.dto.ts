import { z } from "zod";

export const subcompanyRequestSchema = z.object({
  id: z.number().int().nonnegative().optional(),
  industryType: z.string().trim().min(1, "Industry is required."),
  companySize: z.string().trim().nullable().optional(),
  companyName: z.string().trim().min(1, "Site name is required."),
  location: z.string().trim().min(1, "Location is required."),
});

/** Matches backend `UserDto` for POST /Auth/register */
export const registerRequestSchema = z.object({
  id: z.number().int().nonnegative().optional(),
  fullName: z.string().trim().min(1, "Full name is required.").max(50),
  email: z.email("Enter a valid email address.").max(50),
  isDemo: z.boolean().default(false),
  passwordHash: z.string().min(8, "Password must be at least 8 characters."),
  roleId: z.number().int().nonnegative(),
  organizationId: z.number().int().nonnegative(),
  organizationName: z.string().trim().min(1, "Organization name is required."),
  activatedModules: z.string().trim().min(1, "Select at least one module."),
  subcompany: z
    .array(subcompanyRequestSchema)
    .min(1, "At least one site is required."),
});

export const signupFormSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required."),
    email: z.email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
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
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
});

// =====================================================

export type SubcompanyRequestDto = z.infer<typeof subcompanyRequestSchema>;
export type RegisterRequestDto = z.infer<typeof registerRequestSchema>;
export type SignupFormDto = z.infer<typeof signupFormSchema>;
export type LoginRequestDto = z.infer<typeof loginRequestSchema>;
export type ResetPasswordRequestDto = z.infer<
  typeof resetPasswordRequestSchema
>;
export type ForgotPasswordRequestDto = z.infer<
  typeof forgotPasswordRequestSchema
>;

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
