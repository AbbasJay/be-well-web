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
  // Initialize state from localStorage if available
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  });
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        
        if (storedToken) {
          // Verify token is valid
          const response = await fetch('/api/check-auth', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          const data = await response.json();
          
          if (data.isAuthenticated) {
            setToken(storedToken);
            setIsLoggedIn(true);
          } else {
            // If token is invalid, clear it
            localStorage.removeItem('token');
            setToken(null);
            setIsLoggedIn(false);
          }
        } else {
          setToken(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setToken(null);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (token: string) => {
    setToken(token);
    setIsLoggedIn(true);
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setToken(null);
    setIsLoggedIn(false);
    localStorage.removeItem('token');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>;
  }

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
