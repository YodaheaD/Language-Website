"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthUser {
  authenticated: boolean;
  userId?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/session-check`, {
        method: "GET",
        credentials: "include", // Important for sending cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      
      if (response.ok && data.authenticated) {
        setUser({ authenticated: true, userId: data.userId });
      } else {
        setUser({ authenticated: false });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser({ authenticated: false });
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    checkAuthStatus();
  };

  const logout = async () => {
    try {
      // Call your logout endpoint if you have one
      await fetch(`/api/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser({ authenticated: false });
    }
  };

  const refetch = () => {
    checkAuthStatus();
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    user,
    isLoading,
    login,
    logout,
    refetch,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper hook to check if user is authenticated
export function useIsAuthenticated(): boolean {
  const { user } = useAuth();
  return user?.authenticated ?? false;
}

// Helper hook to get user ID
export function useUserId(): number | undefined {
  const { user } = useAuth();
  return user?.userId;
}