import { z } from "zod";

export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128)
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

export const registerSchema = z
  .object({
    email: z.string().email().max(255),
    password: strongPasswordSchema,
    displayName: z.string().min(1).max(100).optional(),
    fullName: z.string().min(1).max(100).optional(),
    username: z
      .string()
      .min(3)
      .max(50)
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
      .optional(),
    inviteCode: z.string().trim().min(4).max(32).optional(),
    emailInviteToken: z.string().trim().min(8).max(255).optional(),
  })
  .transform((data) => ({
    email: data.email,
    password: data.password,
    displayName: data.displayName ?? data.fullName,
    username: data.username,
    inviteCode: data.inviteCode,
    emailInviteToken: data.emailInviteToken,
  }));

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: strongPasswordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
});

export const resendVerificationSchema = z.object({
  email: z.string().email(),
});

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  country: z.string().max(100).optional(),
  timezone: z.string().max(100).optional(),
  interests: z.array(z.string()).max(20).optional(),
  goals: z.array(z.string()).max(10).optional(),
  avatarUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
});

export const onboardingSchema = z.object({
  interests: z.array(z.string()).max(20).optional(),
  goals: z.array(z.string()).max(10).optional(),
  displayName: z.string().min(1).max(100).optional(),
});

export const uploadRequestSchema = z.object({
  purpose: z.enum(["avatar", "banner", "community", "challenge", "attachment"]),
  contentType: z.string().min(1),
  contentLength: z.number().int().positive(),
});

export const settingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  notifyFriendRequests: z.boolean().optional(),
  notifyCommunityInvites: z.boolean().optional(),
  notifySquadInvites: z.boolean().optional(),
  notifyComments: z.boolean().optional(),
  notifyLikes: z.boolean().optional(),
  notifyChallenges: z.boolean().optional(),
  notifyAiInsights: z.boolean().optional(),
  profileVisibility: z.enum(["public", "friends", "private"]).optional(),
  showOnlineStatus: z.boolean().optional(),
  allowFriendRequests: z.boolean().optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Accent must be a hex color")
    .optional(),
  language: z.string().max(10).optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
