import { User } from "firebase/auth";

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAnonymous: boolean;
    signInAnonymously: () => Promise<void>;
    error: Error | null;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

// export interface PushNotificationRequest {
//   to: string;
//   sound?: string;
//   title: string;
//   body: string;
//   data?: Record<string, any>;
// }