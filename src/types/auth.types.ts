import { User } from "firebase/auth";

export interface UserDocument {
  id?: string; // Firestore document ID
  userId: string;
  user_email: string | null;
  user_name?: string;
  created_date: Date;
}

export interface AuthContextType {
    user: User | null;
    username: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAnonymous: boolean;
    signInAnonymously: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
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