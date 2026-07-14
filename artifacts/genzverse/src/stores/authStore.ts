import { create } from "zustand";
import type { User } from "@/lib/api/client";
import { authApi, clearTokens, ensureCsrfToken } from "@/lib/api/client";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<User>;
  signup: (email: string, password: string, fullName?: string, inviteCode?: string, emailInviteToken?: string) => Promise<User>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

function hasToken() {
  return Boolean(localStorage.getItem("genzverse_access_token"));
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      await ensureCsrfToken();
    } catch {
      // CSRF bootstrap is retried on the next mutating request.
    }

    if (hasToken()) {
      try {
        const user = await authApi.me();
        set({ user, isAuthenticated: true, isLoading: false });
        return;
      } catch {
        clearTokens();
      }
    }

    try {
      const session = await authApi.establishSessionFromCookies();
      set({ user: session.user, isAuthenticated: true, isLoading: false });
      return;
    } catch {
      // No cookie-based session available.
    }

    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  login: async (identifier, password, rememberMe) => {
    const { user } = await authApi.login(identifier, password, rememberMe);
    set({ user, isAuthenticated: true, isLoading: false });
    return user;
  },

  signup: async (email, password, fullName, inviteCode, emailInviteToken) => {
    const { user } = await authApi.signup(email, password, fullName, inviteCode, emailInviteToken);
    set({ user, isAuthenticated: true, isLoading: false });
    return user;
  },

  logout: async () => {
    await authApi.logout();
    set({ user: null, isAuthenticated: false });
  },

  logoutAll: async () => {
    await authApi.logoutAll();
    set({ user: null, isAuthenticated: false });
  },

  refreshUser: async () => {
    if (!hasToken()) return;
    const user = await authApi.me();
    set({ user, isAuthenticated: true });
  },

  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
}));
