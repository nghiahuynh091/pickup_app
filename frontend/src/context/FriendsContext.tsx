import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  acceptFriendRequest,
  createUserProfile,
  getUserFriends,
  getUserProfile,
  listenToFriendRequests,
  listenToSentFriendRequests,
  listenToUserFriends,
  rejectFriendRequest,
  removeFriend,
  searchUserByEmail,
  sendFriendRequest,
} from "../services/FriendsService";
import { Friend, FriendRequest, UserProfile } from "../types/friends.types";
import { useAuth } from "./AuthContext";

interface FriendsContextType {
  friends: Friend[];
  friendRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  userProfile: UserProfile | null;
  loading: boolean;

  // Actions
  searchUser: (email: string) => Promise<UserProfile | null>;
  sendRequest: (toUserId: string) => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string) => Promise<void>;
  removeFriendById: (friendId: string) => Promise<void>;
  refreshFriends: () => Promise<void>;
  initializeUserProfile: () => Promise<void>;
  forceClearAndRefresh: () => Promise<void>; // New method for cache clearing
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

interface FriendsProviderProps {
  children: ReactNode;
}

export const FriendsProvider: React.FC<FriendsProviderProps> = ({
  children,
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const userId = user?.uid;

  // Initialize user profile and load friends when user logs in
  useEffect(() => {
    if (userId) {
      initializeUserProfile();
    } else {
      // Clear data when user logs out
      setFriends([]);
      setFriendRequests([]);
      setSentRequests([]);
      setUserProfile(null);
      setLoading(false);
    }
  }, [userId]);

  // Listen to friend requests (received)
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = listenToFriendRequests(userId, setFriendRequests);
    return unsubscribe;
  }, [userId]);

  // Listen to sent friend requests
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = listenToSentFriendRequests(userId, setSentRequests);
    return unsubscribe;
  }, [userId]);

  // Listen to friends list changes
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = listenToUserFriends(userId, setFriends);
    return unsubscribe;
  }, [userId]);

  const initializeUserProfile = async () => {
    if (!userId || !user) return;

    try {
      setLoading(true);

      // Get or create user profile
      let profile = await getUserProfile(userId);

      if (!profile) {
        // Create profile if it doesn't exist
        await createUserProfile(
          userId,
          user.email || "",
          user.displayName || user.email?.split("@")[0] || "User"
        );
        profile = await getUserProfile(userId);
      }

      setUserProfile(profile);
      console.log("✅ User profile initialized");
    } catch (error) {
      console.error("Failed to initialize user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshFriends = async () => {
    if (!userId) return;

    try {
      const userFriends = await getUserFriends(userId);
      setFriends(userFriends);
      console.log("✅ Friends refreshed:", userFriends.length);
    } catch (error) {
      console.error("Failed to refresh friends:", error);
    }
  };

  const searchUser = async (email: string): Promise<UserProfile | null> => {
    try {
      const user = await searchUserByEmail(email);
      return user;
    } catch (error) {
      console.error("Failed to search user:", error);
      throw error;
    }
  };

  const sendRequest = async (toUserId: string) => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      await sendFriendRequest(userId, toUserId);
      console.log("✅ Friend request sent to:", toUserId);
      // No need to manually refresh - real-time listener will update sentRequests
    } catch (error) {
      console.error("Failed to send friend request:", error);
      throw error;
    }
  };

  const acceptRequest = async (requestId: string) => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      await acceptFriendRequest(requestId, userId);
      console.log("✅ Friend request accepted:", requestId);
      // No need to manually refresh - real-time listeners will update friends and requests
    } catch (error) {
      console.error("Failed to accept friend request:", error);
      throw error;
    }
  };

  const rejectRequest = async (requestId: string) => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      await rejectFriendRequest(requestId, userId);
      console.log("✅ Friend request rejected:", requestId);
      // No need to manually refresh - real-time listener will update requests
    } catch (error) {
      console.error("Failed to reject friend request:", error);
      throw error;
    }
  };

  const removeFriendById = async (friendId: string) => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      await removeFriend(userId, friendId);
      console.log("✅ Friend removed:", friendId);
      // No need to manually refresh - real-time listener will update friends
    } catch (error) {
      console.error("Failed to remove friend:", error);
      throw error;
    }
  };

  const forceClearAndRefresh = async () => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      console.log("🔄 Force clearing and refreshing friends data...");
      setLoading(true);

      // Clear all local state
      setFriends([]);
      setFriendRequests([]);
      setSentRequests([]);
      setUserProfile(null);

      // Re-initialize everything fresh from Firestore
      await initializeUserProfile();

      console.log("✅ Friends data force refreshed");
    } catch (error) {
      console.error("❌ Failed to force refresh friends:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: FriendsContextType = {
    friends,
    friendRequests,
    sentRequests,
    userProfile,
    loading,
    searchUser,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriendById,
    refreshFriends,
    initializeUserProfile,
    forceClearAndRefresh,
  };

  return (
    <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>
  );
};

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error("useFriends must be used within a FriendsProvider");
  }
  return context;
};
