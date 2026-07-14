import { z } from "zod";

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getAccessToken(): string | null {
  return localStorage.getItem("genzverse_access_token");
}

function getRefreshToken(): string | null {
  return localStorage.getItem("genzverse_refresh_token");
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("genzverse_access_token", accessToken);
  localStorage.setItem("genzverse_refresh_token", refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("genzverse_access_token");
  localStorage.removeItem("genzverse_refresh_token");
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const CSRF_HEADER = "x-csrf-token";

let csrfToken: string | null = null;
let csrfFetchPromise: Promise<string> | null = null;

export function clearCsrfToken() {
  csrfToken = null;
}

export async function ensureCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  if (!csrfFetchPromise) {
    csrfFetchPromise = fetch("/api/csrf-token", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          throw new ApiError(res.status, "CSRF_FETCH_FAILED", "Failed to fetch CSRF token");
        }
        const json = await res.json();
        const token = (json.data?.csrfToken ?? json.csrfToken) as string | undefined;
        if (!token) {
          throw new ApiError(500, "CSRF_FETCH_FAILED", "CSRF token missing in response");
        }
        csrfToken = token;
        return token;
      })
      .finally(() => {
        csrfFetchPromise = null;
      });
  }
  return csrfFetchPromise;
}

async function buildRequestHeaders(
  options: RequestInit,
  skipCsrf = false,
): Promise<Headers> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = getAccessToken();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const method = (options.method ?? "GET").toUpperCase();
  if (!skipCsrf && !SAFE_METHODS.has(method) && !headers.has("Authorization")) {
    const token = await ensureCsrfToken();
    headers.set(CSRF_HEADER, token);
  }

  return headers;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  const headers = await buildRequestHeaders(
    {
      method: "POST",
      body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
    },
    false,
  );

  const res = await fetch("/api/auth/refresh", {
    method: "POST",
    headers,
    credentials: "include",
    body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const json = await res.json();
  const data = json.data ?? json;
  if (data.accessToken) {
    setTokens(data.accessToken, data.refreshToken ?? refreshToken ?? "");
    return data.accessToken as string;
  }
  return null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retryState: { auth?: boolean; csrf?: boolean } = { auth: true, csrf: true },
): Promise<T> {
  const headers = await buildRequestHeaders(options);

  const res = await fetch(path, {
    ...options,
    headers,
    credentials: "include",
  });

  const text = await res.text();
  let json: Record<string, unknown> = {};
  if (text) {
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      json = {};
    }
  }

  if (res.status === 401 && retryState.auth !== false) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, options, { auth: false, csrf: retryState.csrf });
    }
  }

  if (
    res.status === 403 &&
    retryState.csrf !== false &&
    (json as unknown as ApiErrorBody).error?.message?.toLowerCase().includes("csrf")
  ) {
    clearCsrfToken();
    return apiFetch<T>(path, options, { auth: retryState.auth, csrf: false });
  }

  if (!res.ok) {
    const err = json as unknown as ApiErrorBody;
    throw new ApiError(
      res.status,
      err.error?.code ?? "ERROR",
      err.error?.message ?? res.statusText,
      err.error?.details,
    );
  }

  return (json.data ?? json) as T;
}

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  emailVerified: z.boolean().optional(),
  username: z.string().nullable().optional(),
  displayName: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
  xp: z.number(),
  level: z.number(),
  currentStreak: z.number().optional(),
  longestStreak: z.number().optional(),
  lifeScore: z.number().optional(),
  productivityScore: z.number().optional(),
  socialScore: z.number().optional(),
  learningScore: z.number().optional(),
  financeScore: z.number().optional(),
  styleScore: z.number().optional(),
  activityScore: z.number().optional(),
  onboardingCompleted: z.boolean(),
  interests: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  friendsCount: z.number().optional(),
  challengesCompleted: z.number().optional(),
  communitiesJoined: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;

export const authApi = {
  async login(identifier: string, password: string, rememberMe = false) {
    const data = await apiFetch<{
      token: string;
      refreshToken: string;
      user: User;
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ identifier, password, rememberMe }),
    });
    setTokens(data.token, data.refreshToken);
    return data;
  },

  async establishSessionFromCookies() {
    const headers = await buildRequestHeaders({ method: "POST" }, false);
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers,
      credentials: "include",
    });
    if (!res.ok) {
      throw new ApiError(res.status, "SESSION_FAILED", "Failed to establish session");
    }
    const json = await res.json();
    const data = json.data ?? json;
    if (!data.accessToken || !data.refreshToken) {
      throw new ApiError(500, "SESSION_FAILED", "Invalid session response");
    }
    setTokens(data.accessToken, data.refreshToken);
    return data as { accessToken: string; refreshToken: string; user: User };
  },

  async signup(email: string, password: string, fullName?: string, inviteCode?: string, emailInviteToken?: string) {
    const data = await apiFetch<{
      token: string;
      refreshToken: string;
      user: User;
    }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName, inviteCode, emailInviteToken }),
    });
    setTokens(data.token, data.refreshToken);
    return data;
  },

  async me() {
    return apiFetch<User>("/api/auth/me");
  },

  async logout() {
    const refreshToken = getRefreshToken();
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
        body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
      });
    } finally {
      clearTokens();
      clearCsrfToken();
    }
  },

  async logoutAll() {
    try {
      await apiFetch("/api/auth/logout-all", { method: "POST" });
    } finally {
      clearTokens();
      clearCsrfToken();
    }
  },

  async forgotPassword(email: string) {
    return apiFetch<{ success: boolean; message: string }>(
      "/api/auth/forgot-password",
      { method: "POST", body: JSON.stringify({ email }) },
    );
  },

  async resetPassword(token: string, newPassword: string) {
    return apiFetch<{ success: boolean; message: string }>(
      "/api/auth/reset-password",
      { method: "POST", body: JSON.stringify({ token, newPassword }) },
    );
  },

  async verifyEmail(token: string, email: string) {
    return apiFetch<{ success: boolean; user: User }>(
      "/api/auth/verify-email",
      { method: "POST", body: JSON.stringify({ token, email }) },
    );
  },

  async resendVerification(email: string) {
    return apiFetch<{ success: boolean; message: string }>(
      "/api/auth/resend-verification",
      { method: "POST", body: JSON.stringify({ email }) },
    );
  },
};

export const userApi = {
  async updateProfile(data: Record<string, unknown>) {
    const res = await apiFetch<{ data: User }>("/api/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return (res as unknown as User).id ? (res as unknown as User) : res.data;
  },

  async completeOnboarding(data: {
    interests?: string[];
    goals?: string[];
    displayName?: string;
  }) {
    const res = await apiFetch<User>("/api/users/onboarding", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res;
  },

  async getSettings() {
    return apiFetch<Record<string, unknown>>("/api/users/settings");
  },

  async updateSettings(data: Record<string, unknown>) {
    return apiFetch<Record<string, unknown>>("/api/users/settings", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async requestUploadUrl(
    purpose: string,
    contentType: string,
    contentLength: number,
  ) {
    return apiFetch<{
      uploadUrl: string | null;
      publicUrl: string | null;
      key: string;
    }>("/api/users/upload-url", {
      method: "POST",
      body: JSON.stringify({ purpose, contentType, contentLength }),
    });
  },

  async deleteAccount() {
    return apiFetch("/api/users/me", { method: "DELETE" });
  },
};

export const dashboardApi = {
  async getOverview() {
    return apiFetch<Record<string, unknown>>("/api/dashboard/overview");
  },
  async getStats() {
    return apiFetch<Record<string, number>>("/api/dashboard/stats");
  },

  async getActivity() {
    return apiFetch<
      Array<{
        id: string;
        type: string;
        description: string;
        xpEarned: number | null;
        createdAt: string;
      }>
    >("/api/dashboard/activity");
  },

  async getNotifications() {
    return apiFetch<
      Array<{
        id: string;
        type: string;
        title: string;
        body: string | null;
        read: boolean;
        createdAt: string;
      }>
    >("/api/notifications");
  },
};

export const dataApi = {
  async getSquads(page = 1, limit = 20) {
    return apiFetch<{ data: unknown[]; pagination: unknown }>(
      `/api/squads?page=${page}&limit=${limit}`,
    );
  },

  async getFeaturedSquads() {
    const res = await apiFetch<{ data: unknown[] } | unknown[]>(
      "/api/squads/featured",
    );
    return Array.isArray(res) ? res : res.data;
  },

  async getCommunities(page = 1, limit = 20) {
    return apiFetch<{ data: unknown[]; pagination: unknown }>(
      `/api/communities?page=${page}&limit=${limit}`,
    );
  },

  async getFeaturedCommunities() {
    const res = await apiFetch<{ data: unknown[] } | unknown[]>(
      "/api/communities/featured",
    );
    return Array.isArray(res) ? res : res.data;
  },

  async getChallenges(page = 1, limit = 20) {
    return apiFetch<{ items: unknown[]; nextCursor: string | null }>(
      `/api/challenges?limit=${limit}${page > 1 ? `&page=${page}` : ""}`,
    );
  },
};

export const challengeApi = {
  async list(params: {
    q?: string;
    category?: string;
    difficulty?: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
    challengeType?: string;
    status?: "ACTIVE" | "COMPLETED" | "BOOKMARKED" | "CREATED";
    cursor?: string;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.category) query.set("category", params.category);
    if (params.difficulty) query.set("difficulty", params.difficulty);
    if (params.challengeType) query.set("challengeType", params.challengeType);
    if (params.status) query.set("status", params.status);
    if (params.cursor) query.set("cursor", params.cursor);
    query.set("limit", String(params.limit ?? 20));
    return apiFetch<{ items: Array<Record<string, unknown>>; nextCursor: string | null }>(
      `/api/challenges?${query.toString()}`,
    );
  },
  async create(data: Record<string, unknown>) {
    return apiFetch("/api/challenges", { method: "POST", body: JSON.stringify(data) });
  },
  async detail(id: string) {
    return apiFetch<Record<string, unknown>>(`/api/challenges/${id}`);
  },
  async join(id: string) {
    return apiFetch(`/api/challenges/${id}/join`, { method: "POST" });
  },
  async leave(id: string) {
    return apiFetch(`/api/challenges/${id}/leave`, { method: "POST" });
  },
  async checkin(id: string, payload: { progress: number; note?: string; proofUrl?: string }) {
    return apiFetch(`/api/challenges/${id}/checkin`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  async bookmark(id: string) {
    return apiFetch(`/api/challenges/${id}/bookmark`, { method: "POST" });
  },
  async like(id: string) {
    return apiFetch(`/api/challenges/${id}/like`, { method: "POST" });
  },
  async duplicate(id: string) {
    return apiFetch(`/api/challenges/${id}/duplicate`, { method: "POST" });
  },
  async pause(id: string) {
    return apiFetch(`/api/challenges/${id}/pause`, { method: "POST" });
  },
  async resume(id: string) {
    return apiFetch(`/api/challenges/${id}/resume`, { method: "POST" });
  },
  async remove(id: string) {
    return apiFetch(`/api/challenges/${id}`, { method: "DELETE" });
  },
  async comment(id: string, content: string) {
    return apiFetch(`/api/challenges/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },
};

export const profileApi = {
  async getProfile() {
    return apiFetch<{
      user: User;
      friends: Array<{
        id: string;
        username: string | null;
        displayName: string | null;
        avatarUrl: string | null;
        isOnline: boolean;
      }>;
      achievements: Array<{
        id: string;
        name: string;
        description: string | null;
        earnedAt: string;
      }>;
      recentActivity: Array<{
        id: string;
        type: string;
        description: string;
        createdAt: string;
      }>;
    }>("/api/profile");
  },

  async getFriends() {
    return apiFetch<
      Array<{
        id: string;
        username: string | null;
        displayName: string | null;
        avatarUrl: string | null;
        isOnline: boolean;
      }>
    >("/api/profile/friends");
  },

  async getSessions() {
    return apiFetch<
      Array<{
        id: string;
        userAgent: string | null;
        ipAddress: string | null;
        createdAt: string;
        expiresAt: string;
      }>
    >("/api/profile/sessions");
  },

  async getLifeWrapped() {
    return apiFetch<Record<string, unknown>>("/api/life-wrapped");
  },

  async getLeaderboard(period = "weekly") {
    return apiFetch<unknown[]>(`/api/leaderboard?period=${period}`);
  },
};

export const aiApi = {
  async getMessages() {
    return apiFetch<
      Array<{ id: string; role: string; content: string; createdAt: string }>
    >("/api/ai/messages");
  },

  async sendMessage(content: string) {
    return apiFetch<{
      userMessage: string;
      assistantMessage: { id: string; role: string; content: string };
      suggestions?: string[];
    }>("/api/ai/messages", {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },

  async clearMessages() {
    return apiFetch("/api/ai/messages", { method: "DELETE" });
  },

  async getInsights() {
    return apiFetch<{
      goals: string[];
      interests?: string[];
      currentStreak: number;
      lifeScore: number;
      productivityScore: number;
      weeklyActivityCount: number;
      level?: number;
      xp?: number;
      recommendations?: {
        challenges: Array<{ title: string; category: string }>;
        communities: Array<{ name: string; category: string }>;
      };
    }>("/api/ai/insights");
  },
};

export const outfitApi = {
  async list(params: { styleTag?: string; cursor?: string; limit?: number } = {}) {
    const q = new URLSearchParams();
    if (params.styleTag) q.set("styleTag", params.styleTag);
    if (params.cursor) q.set("cursor", params.cursor);
    q.set("limit", String(params.limit ?? 20));
    return apiFetch<{
      items: Array<{
        id: string;
        title: string;
        brand: string | null;
        description: string | null;
        imageUrl: string;
        styleTag: string;
        price: number | null;
        likeCount: number;
        shareCount: number;
        commentCount: number;
        liked: boolean;
        bookmarked: boolean;
        createdAt: string;
        user: { id: string; username: string | null; displayName: string | null; avatarUrl: string | null };
      }>;
      nextCursor: string | null;
    }>(`/api/outfits?${q.toString()}`);
  },
  async dna() {
    return apiFetch<Array<{ label: string; pct: number; color: string }>>("/api/outfits/dna");
  },
  async trending() {
    return apiFetch<Array<{ name: string; count: number }>>("/api/outfits/trending");
  },
  async like(id: string) {
    return apiFetch<{ liked: boolean }>(`/api/outfits/${id}/like`, { method: "POST" });
  },
  async bookmark(id: string) {
    return apiFetch<{ bookmarked: boolean }>(`/api/outfits/${id}/bookmark`, { method: "POST" });
  },
  async share(id: string, platform: string) {
    return apiFetch<{ url: string; shareCount: number }>(`/api/outfits/${id}/share`, {
      method: "POST",
      body: JSON.stringify({ platform }),
    });
  },
  async comments(id: string) {
    return apiFetch<
      Array<{
        id: string;
        content: string;
        createdAt: string;
        user: { id: string; username: string | null; displayName: string | null; avatarUrl: string | null };
      }>
    >(`/api/outfits/${id}/comments`);
  },
  async comment(id: string, content: string) {
    return apiFetch(`/api/outfits/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  },
};

export const publicApi = {
  async getStats() {
    return apiFetch<{
      userCount: number;
      communityCount: number;
      challengeCount: number;
      squadCount: number;
    }>("/api/public/stats");
  },
};

export const socialApi = {
  async searchUsers(q: string, cursor?: string, limit = 20) {
    const params = new URLSearchParams({ q, limit: String(limit) });
    if (cursor) params.set("cursor", cursor);
    return apiFetch<{
      items: Array<{
        id: string;
        avatarUrl: string | null;
        displayName: string | null;
        username: string | null;
        mutualFriends: number;
        mutualCommunities: number;
        xp: number | null;
        level: number;
        status: string;
        isOnline: boolean;
        lastSeenAt: string | null;
        relationship: "NONE" | "FRIEND" | "REQUEST_SENT" | "REQUEST_RECEIVED";
        incomingRequestId: string | null;
        outgoingRequestId: string | null;
      }>;
      nextCursor: string | null;
    }>(`/api/social/search/users?${params.toString()}`);
  },
  async sendFriendRequest(recipientId: string) {
    return apiFetch("/api/social/friend-requests", {
      method: "POST",
      body: JSON.stringify({ recipientId }),
    });
  },
  async getFriendRequests() {
    return apiFetch<{
      incoming: Array<{ id: string; sender: { id: string; username: string | null; displayName: string | null; avatarUrl: string | null; level: number; xp: number } }>;
      outgoing: Array<{ id: string; recipient: { id: string; username: string | null; displayName: string | null; avatarUrl: string | null; level: number; xp: number } }>;
    }>("/api/social/friend-requests");
  },
  async acceptFriendRequest(id: string) {
    return apiFetch(`/api/social/friend-requests/${id}/accept`, { method: "POST" });
  },
  async declineFriendRequest(id: string) {
    return apiFetch(`/api/social/friend-requests/${id}/decline`, { method: "POST" });
  },
  async cancelFriendRequest(id: string) {
    return apiFetch(`/api/social/friend-requests/${id}/cancel`, { method: "POST" });
  },
  async getFriends() {
    return apiFetch<Array<{
      id: string;
      username: string | null;
      displayName: string | null;
      avatarUrl: string | null;
      level: number;
      xp: number | null;
      streak: number | null;
      isOnline: boolean;
      lastSeenAt: string | null;
      isMuted: boolean;
      isFavorite: boolean;
      isPinned: boolean;
    }>>("/api/social/friends");
  },
  async updateFriendPreferences(friendId: string, patch: { isMuted?: boolean; isFavorite?: boolean; isPinned?: boolean }) {
    return apiFetch(`/api/social/friends/${friendId}/preferences`, {
      method: "POST",
      body: JSON.stringify(patch),
    });
  },
  async removeFriend(friendId: string) {
    return apiFetch(`/api/social/friends/${friendId}`, { method: "DELETE" });
  },
  async blockFriend(friendId: string) {
    return apiFetch(`/api/social/friends/${friendId}/block`, { method: "POST" });
  },
  async unblockFriend(friendId: string) {
    return apiFetch(`/api/social/friends/${friendId}/unblock`, { method: "POST" });
  },
  async getInviteDashboard() {
    return apiFetch<{
      inviteLink: string;
      inviteCode: string;
      stats: {
        totalSent: number;
        pending: number;
        accepted: number;
        rejected: number;
        expired?: number;
        referralXp: number;
      };
      history: Array<{ id: string; email: string; status: string; createdAt: string }>;
      acceptedUsers: Array<{
        id: string;
        username: string | null;
        displayName: string | null;
        createdAt: string;
        avatarUrl?: string | null;
      }>;
    }>("/api/social/invites/dashboard");
  },
  async inviteByEmail(email: string) {
    return apiFetch<{
      emailSent: boolean;
      previewUrl?: string;
      message: string;
      link: string;
    }>("/api/social/invites/email", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },
  async resendInvite(id: string) {
    return apiFetch<{ emailSent: boolean; message: string; previewUrl?: string }>(
      `/api/social/invites/email/${id}/resend`,
      { method: "POST" },
    );
  },
  async cancelInvite(id: string) {
    return apiFetch(`/api/social/invites/email/${id}/cancel`, { method: "POST" });
  },
  async createCommunity(data: {
    name: string;
    slug: string;
    description?: string;
    category: string;
    tags?: string[];
    rules?: string[];
    visibility?: "PUBLIC" | "PRIVATE" | "INVITE_ONLY";
  }) {
    return apiFetch("/api/social/communities", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  async discoverCommunities(params: {
    q?: string;
    category?: string;
    visibility?: "PUBLIC" | "PRIVATE" | "INVITE_ONLY";
    sort?: "trending" | "newest" | "members";
    cursor?: string;
    limit?: number;
  }) {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.category) search.set("category", params.category);
    if (params.visibility) search.set("visibility", params.visibility);
    if (params.sort) search.set("sort", params.sort);
    if (params.cursor) search.set("cursor", params.cursor);
    search.set("limit", String(params.limit ?? 20));
    return apiFetch<{
      items: Array<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        imageUrl: string | null;
        category: string;
        memberCount: number;
        tags: string[];
        visibility: "PUBLIC" | "PRIVATE" | "INVITE_ONLY";
        isFeatured: boolean;
        joined: boolean;
      }>;
      nextCursor: string | null;
    }>(`/api/social/communities/discover?${search.toString()}`);
  },
  async joinCommunity(communityId: string) {
    return apiFetch<{ membership: { id: string; status: string }; requiresApproval: boolean }>(
      `/api/social/communities/${communityId}/join`,
      { method: "POST" },
    );
  },
  async getPublicProfileById(id: string) {
    return apiFetch(`/api/social/profiles/${id}`);
  },
  async getPublicProfileByUsername(username: string) {
    return apiFetch(`/api/social/profiles/username/${encodeURIComponent(username)}`);
  },
};
