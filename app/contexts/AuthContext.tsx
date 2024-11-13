"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type AuthContextType = {
  isLoggedIn: boolean;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const login = async (token: string) => {
    setToken(token);
    setIsLoggedIn(true);
    if (typeof window !== "undefined") {
      document.cookie = `token=${token}; path=/`;
    }
  };

  const logout = () => {
    setToken(null);
    setIsLoggedIn(false);
    if (typeof window !== "undefined") {
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, token, login, logout }}>
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
