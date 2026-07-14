import { z } from "zod";

export const userSearchSchema = z.object({
  q: z.string().trim().min(1).max(255),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const sendFriendRequestSchema = z.object({
  recipientId: z.string().uuid(),
});

export const inviteEmailSchema = z.object({
  email: z.string().email().max(255),
});

export const createCommunitySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/),
  description: z.string().max(1000).optional(),
  category: z.string().min(1).max(50),
  tags: z.array(z.string().max(30)).max(10).optional(),
  rules: z.array(z.string().max(500)).max(20).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "INVITE_ONLY"]).optional(),
});

export const communityDiscoverySchema = z.object({
  q: z.string().trim().max(255).optional(),
  category: z.string().trim().max(50).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "INVITE_ONLY"]).optional(),
  sort: z.enum(["trending", "newest", "members"]).default("trending"),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

