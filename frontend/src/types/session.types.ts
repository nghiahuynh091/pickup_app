// src/types/hangout.types.ts
import { Timestamp } from 'firebase/firestore';

export interface Location {
  lat: number;
  lng: number;
}

export interface Destination extends Location {
  name: string;
  address?: string;
}

export type ParticipantStatus = 'Idle' | 'On My Way' | '5 Mins Left' | 'Arrived';

export interface ParticipantInfo {
  status: ParticipantStatus;
  updatedAt: Timestamp;
}

export interface Hangout {
  id: string; // The Firestore document ID
  participants: string[]; // Array of user UIDs
  participantInfo: Record<string, ParticipantInfo>; // A map of UID to their info
  destination: Destination;
  createdAt: Timestamp;
  isActive: boolean;
}


// src/types/auth.types.ts
export interface User {
  userId: string;
  email: string;
  userName: string;
  friends?: string[];
  pushToken?: string;
}
