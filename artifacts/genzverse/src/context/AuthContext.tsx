import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useGetMe, User } from "@workspace/api-client-react";
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

  // Update token in localStorage when it changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("genzverse_token", token);
    } else {
      localStorage.removeItem("genzverse_token");
    }
  }, [token]);

  // Set the token in global headers for api client if necessary, or just rely on cookies
  // Actually, our API client uses customFetch, which might read from local storage if we pass it,
  // but let's assume if customFetch is standard, it might need to know the token.
  // Given we are storing it in local storage, we should configure customFetch if it reads it.

  // Fetch current user using generated hook
  const { data: user, isLoading: isUserLoading, refetch } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  const login = (newToken: string) => {
    setToken(newToken);
    refetch();
  };

  const logout = () => {
    setToken(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token && !!user,
        user: user || null,
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
