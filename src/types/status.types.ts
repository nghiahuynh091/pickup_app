export interface StatusDocument {
  id?: string; // Firestore document ID
  fromUserId: string;
  toUserId?: string; // Optional - for direct messages
  sessionId?: string; // Optional - for group/session statuses
  statusType: StatusType;
  messageText?: string; // Optional message
  timestamp: Date;
  coords?: {
    latitude: number;
    longitude: number;
  };
}

export type StatusType = 'arriving' | '5-min-left' | 'arrived';

export interface CreateStatusRequest {
  toUserId?: string;
  sessionId?: string;
  statusType: StatusType;
  messageText?: string;
  coords?: {
    latitude: number;
    longitude: number;
  };
}

export interface StatusContextType {
  isLoading: boolean;
  error: string | null;
  createStatus: (statusData: CreateStatusRequest) => Promise<string | null>;
  clearError: () => void;
}

export interface StatusProviderProps {
  children: React.ReactNode;
}