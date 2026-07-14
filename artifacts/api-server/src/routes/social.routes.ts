import { Router } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import { authenticate } from "../middleware/auth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
  createCommunitySchema,
  communityDiscoverySchema,
  inviteEmailSchema,
  sendFriendRequestSchema,
  userSearchSchema,
} from "../validators/social.validator.js";
import * as socialService from "../services/social.service.js";

const router = Router();
const routeParam = (value: string | string[] | undefined): string => {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.length > 0) return value[0] as string;
  return "";
};

router.get("/social/search/users", authenticate, validateQuery(userSearchSchema), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { q, limit, cursor } = req.query as unknown as { q: string; limit: number; cursor?: string };
    const data = await socialService.searchUsers(authReq.user!.id, q, limit, cursor);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get("/social/friends", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await socialService.getFriends(authReq.user!.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/social/friend-requests", authenticate, validateBody(sendFriendRequestSchema), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await socialService.sendFriendRequest(authReq.user!.id, req.body.recipientId);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get("/social/friend-requests", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await socialService.getFriendRequests(authReq.user!.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/social/friend-requests/:id/accept", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await socialService.handleFriendRequest(authReq.user!.id, routeParam(req.params.id), "accept");
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/social/friend-requests/:id/decline", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await socialService.handleFriendRequest(authReq.user!.id, routeParam(req.params.id), "decline");
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/social/friend-requests/:id/cancel", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await socialService.handleFriendRequest(authReq.user!.id, routeParam(req.params.id), "cancel");
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.delete("/social/friends/:friendId", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await socialService.removeFriend(authReq.user!.id, routeParam(req.params.friendId));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/social/friends/:friendId/block", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await socialService.updateFriendPreference(authReq.user!.id, routeParam(req.params.friendId), {
      blockedAt: new Date(),
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/social/friends/:friendId/unblock", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await socialService.updateFriendPreference(authReq.user!.id, routeParam(req.params.friendId), {
      blockedAt: null,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/social/friends/:friendId/preferences", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await socialService.updateFriendPreference(authReq.user!.id, routeParam(req.params.friendId), {
      isMuted: req.body?.isMuted,
      isFavorite: req.body?.isFavorite,
      isPinned: req.body?.isPinned,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get("/social/invites/dashboard", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await socialService.getInviteDashboard(authReq.user!.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/social/invites/email", authenticate, validateBody(inviteEmailSchema), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await socialService.inviteByEmail(authReq.user!.id, req.body.email);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/social/invites/email/:id/resend", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await socialService.resendEmailInvite(authReq.user!.id, routeParam(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/social/invites/email/:id/cancel", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await socialService.cancelEmailInvite(authReq.user!.id, routeParam(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/social/communities", authenticate, validateBody(createCommunitySchema), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await socialService.createCommunity(authReq.user!.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get("/social/communities/discover", authenticate, validateQuery(communityDiscoverySchema), async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const query = req.query as unknown as {
      q?: string;
      category?: string;
      visibility?: "PUBLIC" | "PRIVATE" | "INVITE_ONLY";
      sort?: "trending" | "newest" | "members";
      cursor?: string;
      limit: number;
    };
    const data = await socialService.discoverCommunities(authReq.user!.id, query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post("/social/communities/:id/join", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await socialService.joinCommunity(authReq.user!.id, routeParam(req.params.id));
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get("/social/profiles/:id", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await socialService.getPublicProfile(authReq.user!.id, { id: routeParam(req.params.id) });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get("/social/profiles/username/:username", authenticate, async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const data = await socialService.getPublicProfile(authReq.user!.id, { username: routeParam(req.params.username) });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;

