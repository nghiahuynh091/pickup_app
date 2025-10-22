import React, { createContext, useContext, useEffect, useState } from "react";

import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../db/config";

import { AuthService } from "../services/AuthService";
import { AuthContextType, AuthProviderProps } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const isAuthenticated = !!user;
  const isAnonymous = user?.isAnonymous || false;

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user?.uid || "No user");
      setUser(user);

      // Fetch username if user is signed in
      if (user) {
        // For anonymous users, use a default name
        if (user.isAnonymous) {
          setUsername("Anonymous User");
        } else {
          // For authenticated users, you could fetch from Firestore user document
          // For now, use display name or email
          setUsername(user.displayName || user.email || "User");
        }
      } else {
        setUsername(null);
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInAnonymously = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await AuthService.signInAnonymously();
      // User state will be updated by onAuthStateChanged listener
    } catch (error: any) {
      console.error("Sign in error:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await AuthService.signInWithEmail(email, password);
      // User state will be updated by onAuthStateChanged listener
    } catch (error: any) {
      console.error("Email sign in error:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await AuthService.signUpWithEmail(email, password, "User Name");
      // User state will be updated by onAuthStateChanged listener
    } catch (error: any) {
      console.error("Email sign up error:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await AuthService.signOut();
      // User state will be updated to null by onAuthStateChanged listener
    } catch (error: any) {
      console.error("Sign out error:", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    username,
    isLoading,
    isAuthenticated,
    isAnonymous,
    signInAnonymously,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    error,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
