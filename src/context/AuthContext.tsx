import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../db/config";

import { AuthService } from "../services/AuthService";
import { AuthContextType, AuthProviderProps } from "../types";


const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error(
      "useAuth must be used within a AuthProvider"
    );
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const isAuthenticated = !!user;
  const isAnonymous = user?.isAnonymous || false;

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user?.uid || 'No user');
      setUser(user);
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
        console.error('Sign in error:', error);
        setError(error);
    } finally {
        setIsLoading(false);
    }
  };


  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    isAnonymous,
    signInAnonymously,
    error,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};