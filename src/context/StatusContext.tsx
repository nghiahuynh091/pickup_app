import { DocumentSnapshot, Unsubscribe } from "firebase/firestore";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  StatusQueryOptions,
  StatusService,
  StatusWithId,
} from "../services/StatusService";
import {
  CreateStatusRequest,
  StatusContextType,
  StatusProviderProps,
} from "../types";

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const useStatus = () => {
  const context = useContext(StatusContext);
  if (!context) {
    throw new Error("useStatus must be used within a StatusProvider");
  }
  return context;
};

export const StatusProvider: React.FC<StatusProviderProps> = ({ children }) => {
  const [statuses, setStatuses] = useState<StatusWithId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [unsubscribe, setUnsubscribe] = useState<Unsubscribe | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMoreStatuses, setHasMoreStatuses] = useState(true);
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("desc");
  const [statusLimit, setStatusLimit] = useState(20);

  const createStatus = useCallback(
    async (statusData: CreateStatusRequest): Promise<string | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const documentId = await StatusService.createStatus(statusData);
        return documentId;
      } catch (error: any) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create status";
        setError(errorMessage);
        console.error("Error in createStatus:", errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Subscribe to all statuses with real-time updates
  const subscribeToAllStatuses = useCallback(
    (options: StatusQueryOptions = {}) => {
      // Unsubscribe from previous listener
      unsubscribeFromStatuses();

      setIsLoading(true);
      setError(null);

      const unsubscribeFunc = StatusService.subscribeToStatuses(
        (newStatuses) => {
          setStatuses(newStatuses);
          setIsLoading(false);
          console.log(
            "Real-time update: received",
            newStatuses.length,
            "statuses"
          );
        },
        {
          orderDirection,
          limitCount: statusLimit,
          ...options,
        }
      );

      setUnsubscribe(() => unsubscribeFunc);
    },
    [orderDirection, statusLimit]
  );

  // Subscribe to session-specific statuses
  const subscribeToSessionStatuses = useCallback(
    (sessionId: string, direction: "asc" | "desc" = "desc") => {
      unsubscribeFromStatuses();

      setIsLoading(true);
      setError(null);

      const unsubscribeFunc = StatusService.subscribeToSessionStatuses(
        sessionId,
        (newStatuses) => {
          setStatuses(newStatuses);
          setIsLoading(false);
          console.log(
            "Real-time update: received",
            newStatuses.length,
            "session statuses"
          );
        },
        direction,
        statusLimit
      );

      setUnsubscribe(() => unsubscribeFunc);
    },
    [statusLimit]
  );

  // Subscribe to user-specific statuses
  const subscribeToUserStatuses = useCallback(
    (
      userId: string,
      direction: "asc" | "desc" = "desc",
      sentMessageQuery?: boolean,
      receivedMessageQuery?: boolean
    ) => {
      unsubscribeFromStatuses();

      setIsLoading(true);
      setError(null);
      console.log(userId);

      const unsubscribeFunc = StatusService.subscribeToUserStatuses(
        userId,
        (newStatuses) => {
          setStatuses(newStatuses);
          setIsLoading(false);
          console.log(
            "Real-time update: received",
            newStatuses.length,
            "user statuses"
          );
        },
        direction,
        statusLimit,
        sentMessageQuery,
        receivedMessageQuery
      );

      setUnsubscribe(() => unsubscribeFunc);
    },
    [statusLimit]
  );

  // Unsubscribe from current listener
  const unsubscribeFromStatuses = useCallback(() => {
    if (unsubscribe) {
      unsubscribe();
      setUnsubscribe(null);
      console.log("Unsubscribed from status updates");
    }
  }, [unsubscribe]);

  // Load more statuses (pagination)
  const loadMoreStatuses = useCallback(async () => {
    if (!hasMoreStatuses || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);

      const { statuses: newStatuses, lastDoc: newLastDoc } =
        await StatusService.fetchStatusesPaginated({
          orderDirection,
          limitCount: statusLimit,
          startAfterDoc: lastDoc,
        });

      if (newStatuses.length === 0) {
        setHasMoreStatuses(false);
      } else {
        setStatuses((prev) => [...prev, ...newStatuses]);
        setLastDoc(newLastDoc);
      }
    } catch (error: any) {
      setError(error.message || "Failed to load more statuses");
    } finally {
      setIsLoading(false);
    }
  }, [hasMoreStatuses, isLoading, orderDirection, statusLimit, lastDoc]);

  // Refresh statuses
  const refreshStatuses = useCallback(() => {
    setStatuses([]);
    setLastDoc(null);
    setHasMoreStatuses(true);
    subscribeToAllStatuses();
  }, [subscribeToAllStatuses]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromStatuses();
    };
  }, [unsubscribeFromStatuses]);

  const clearError = () => {
    setError(null);
  };

  const contextValue: StatusContextType = {
    statuses,
    isLoading,
    error,
    createStatus,
    clearError,
    refreshStatuses,
    subscribeToAllStatuses,
    subscribeToSessionStatuses,
    subscribeToUserStatuses,
    unsubscribeFromStatuses,
    loadMoreStatuses,
    hasMoreStatuses,
    orderDirection,
    setOrderDirection,
    statusLimit,
    setStatusLimit,
  };

  return (
    <StatusContext.Provider value={contextValue}>
      {children}
    </StatusContext.Provider>
  );
};
