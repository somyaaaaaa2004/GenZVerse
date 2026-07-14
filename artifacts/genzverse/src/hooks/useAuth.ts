import { useAuthStore } from "@/stores/authStore";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useAuthStore((s) => s.login);
  const signup = useAuthStore((s) => s.signup);
  const logout = useAuthStore((s) => s.logout);
  const logoutAll = useAuthStore((s) => s.logoutAll);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const setUser = useAuthStore((s) => s.setUser);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    logoutAll,
    refreshUser,
    setUser,
    setAuthToken: () => {
      /* legacy noop — tokens set via authApi */
    },
  };
}
