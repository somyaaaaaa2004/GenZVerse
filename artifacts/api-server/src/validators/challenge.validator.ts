import { z } from "zod";

export const challengeCreateSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(2000).optional(),
  imageUrl: z.string().url().optional(),
  icon: z.string().trim().max(100).optional(),
  bannerUrl: z.string().url().optional(),
  category: z.string().trim().min(2).max(50),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EXPERT"]).default("MEDIUM"),
  challengeType: z
    .enum([
      "ONE_TIME",
      "DAILY",
      "WEEKLY",
      "MONTHLY",
      "CUSTOM_DATE",
      "TIME_BASED",
      "PROGRESS_BASED",
      "MILESTONE_BASED",
      "COMPETITIVE",
      "COLLABORATIVE",
    ])
    .default("ONE_TIME"),
  visibility: z.enum(["PUBLIC", "PRIVATE", "FRIENDS_ONLY", "COMMUNITY_ONLY"]).default("PUBLIC"),
  goal: z.coerce.number().int().min(1).default(1),
  xpReward: z.coerce.number().int().min(0).max(10000).default(50),
  badgeReward: z.string().trim().max(100).optional(),
  rewardText: z.string().trim().max(1000).optional(),
  rules: z.array(z.string().trim().min(1).max(300)).max(20).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const challengeUpdateSchema = challengeCreateSchema.partial();

export const challengeListSchema = z.object({
  q: z.string().trim().max(255).optional(),
  category: z.string().trim().max(50).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EXPERT"]).optional(),
  challengeType: z
    .enum([
      "ONE_TIME",
      "DAILY",
      "WEEKLY",
      "MONTHLY",
      "CUSTOM_DATE",
      "TIME_BASED",
      "PROGRESS_BASED",
      "MILESTONE_BASED",
      "COMPETITIVE",
      "COLLABORATIVE",
    ])
    .optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "FRIENDS_ONLY", "COMMUNITY_ONLY"]).optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "BOOKMARKED", "CREATED"]).optional(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const challengeCheckinSchema = z.object({
  progress: z.coerce.number().int().min(1).default(1),
  note: z.string().trim().max(500).optional(),
  proofUrl: z.string().url().optional(),
});

export const challengeCommentSchema = z.object({
  content: z.string().trim().min(1).max(1000),
});

