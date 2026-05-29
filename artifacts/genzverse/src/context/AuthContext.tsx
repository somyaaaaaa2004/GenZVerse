import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useGetMe, getGetMeQueryKey, User } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("genzverse_token"));
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: user, isLoading: isUserLoading } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
      queryKey: getGetMeQueryKey(),
    },
  });

  const login = (newToken: string) => {
    // Write to localStorage immediately so customFetch picks it up before the refetch
    localStorage.setItem("genzverse_token", newToken);
    setToken(newToken);
    queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
  };

  const logout = () => {
    localStorage.removeItem("genzverse_token");
    setToken(null);
    queryClient.clear();
    setLocation("/");
  };

  // Keep localStorage in sync with token state (handles any other code paths)
  useEffect(() => {
    if (token) {
      localStorage.setItem("genzverse_token", token);
    } else {
      localStorage.removeItem("genzverse_token");
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token && !!user,
        user: user ?? null,
        isLoading: !!token && isUserLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
