import { FieldValue, Timestamp } from 'firebase/firestore';

export interface Friend {
  id: string;
  email: string;
  userName: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'in-hangout';
  lastSeen?: Timestamp;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserEmail: string;
  fromUserName: string;
  toUserEmail?: string; // Added for sent requests display
  toUserName?: string;  // Added for sent requests display
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp | FieldValue;
  respondedAt?: Timestamp | FieldValue;
}

export interface UserProfile {
  id: string;
  email: string;
  userName: string;
  avatar?: string;
  friends: string[];
  friendRequests: {
    sent: string[];
    received: string[];
  };
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}