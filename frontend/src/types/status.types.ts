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

export interface StatusWithId extends StatusDocument {
  id: string;
}

export interface StatusQueryOptions {
  orderDirection?: "asc" | "desc";
  limitCount?: number;
  sentMessageQuery?: boolean;
  receivedMessageQuery?: boolean;
  filterByUser?: string;
  filterBySession?: string;
  startAfterDoc?: any;
}

export interface StatusContextType {
  statuses: StatusWithId[];
  isLoading: boolean;
  error: string | null;
  createStatus: (statusData: CreateStatusRequest) => Promise<string | null>;
  clearError: () => void;
  refreshStatuses: () => void;
  subscribeToAllStatuses: (options?: StatusQueryOptions) => void;
  subscribeToSessionStatuses: (sessionId: string, direction?: "asc" | "desc") => void;
  subscribeToUserStatuses: (userId: string, direction?: "asc" | "desc", sentMessageQuery?: boolean, receivedMessageQuery?: boolean) => void;
  unsubscribeFromStatuses: () => void;
  loadMoreStatuses: () => Promise<void>;
  hasMoreStatuses: boolean;
  orderDirection: "asc" | "desc";
  setOrderDirection: (direction: "asc" | "desc") => void;
  statusLimit: number;
  setStatusLimit: (limit: number) => void;
}

export interface StatusProviderProps {
  children: React.ReactNode;
}