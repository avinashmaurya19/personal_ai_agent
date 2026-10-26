"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { api, UserProfileItem, AuthTokenResponse } from "@/lib/api-client";

interface AuthContextType {
  user: UserProfileItem | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<AuthTokenResponse>;
  register: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<AuthTokenResponse>;
  loginWithGoogle: (accessToken: string) => Promise<AuthTokenResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfileItem | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      // If unauthorized with a saved token, clear it
      if (api.getAuthToken()) {
        api.logout();
        setToken(null);
      }
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const existingToken = api.getAuthToken();
    setToken(existingToken);

    // Initial user load (works with JWT token or dev owner fallback)
    refreshUser().finally(() => {
      setIsLoading(false);
    });
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setToken(res.access_token);
    setUser(res.user);
    setIsAuthModalOpen(false);
    return res;
  };

  const register = async (
    email: string,
    password: string,
    fullName?: string
  ) => {
    const res = await api.register(email, password, fullName);
    setToken(res.access_token);
    setUser(res.user);
    setIsAuthModalOpen(false);
    return res;
  };

  const loginWithGoogle = async (accessToken: string) => {
    const res = await api.loginWithGoogle(accessToken);
    setToken(res.access_token);
    setUser(res.user);
    setIsAuthModalOpen(false);
    return res;
  };

  const logout = () => {
    api.logout();
    setToken(null);
    setUser(null);
    // Reload dev owner profile if in development, or keep null
    refreshUser();
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
