// src/context/SessionContext.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { locationService } from "../services/LocationService";
import {
  createHangout,
  listenToHangout,
  listenToUserHangouts,
  updateMyStatus,
} from "../services/SessionService";
import { socketService } from "../services/SocketService";
import { Hangout, Location, ParticipantStatus } from "../types/session.types";
import { useAuth } from "./AuthContext";

interface SessionContextType {
  activeHangout: Hangout | null;
  liveLocations: Record<string, Location>;
  myLocation: Location | null;
  isConnected: boolean;
  connectionStatus: string;
  isLocationTracking: boolean;

  // Actions
  startHangout: (
    friendId: string,
    destination: { name: string; lat: number; lng: number; address?: string }
  ) => Promise<string>;
  joinHangout: (hangoutId: string) => void;
  updateStatus: (status: ParticipantStatus) => Promise<void>;
  sendLocationUpdate: (location: Location) => void;
  endHangout: () => void;
  connectSocket: () => void;
  disconnectSocket: () => void;
  startLocationTracking: () => Promise<boolean>;
  stopLocationTracking: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
}) => {
  const [activeHangout, setActiveHangout] = useState<Hangout | null>(null);
  const [liveLocations, setLiveLocations] = useState<Record<string, Location>>(
    {}
  );
  const [myLocation, setMyLocation] = useState<Location | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [isLocationTracking, setIsLocationTracking] = useState(false);
  const [hangoutListener, setHangoutListener] = useState<(() => void) | null>(
    null
  );

  const { user } = useAuth();
  const userId = user?.uid;

  // Initialize socket connection
  useEffect(() => {
    if (userId) {
      connectSocket();
      setupHangoutListener();
    } else {
      disconnectSocket();
      if (hangoutListener) {
        hangoutListener();
        setHangoutListener(null);
      }
    }

    return () => {
      disconnectSocket();
      if (hangoutListener) {
        hangoutListener();
      }
    };
  }, [userId]);

  // Listen for hangouts the user is invited to
  const setupHangoutListener = () => {
    if (!userId) return;

    console.log("🔄 Setting up hangout listener for user:", userId);

    const unsubscribe = listenToUserHangouts(userId, (hangouts) => {
      console.log("📱 Received hangout updates:", hangouts);

      if (hangouts.length > 0) {
        // Find the most recent active hangout
        const latestHangout = hangouts.sort(
          (a, b) =>
            (b.createdAt as any)?.seconds - (a.createdAt as any)?.seconds
        )[0];

        console.log("🎯 Latest hangout:", latestHangout.id);

        // If we don't have an active hangout or it's different, join it
        if (!activeHangout || activeHangout.id !== latestHangout.id) {
          console.log("🚀 Auto-joining hangout:", latestHangout.id);
          setActiveHangout(latestHangout);

          // Join the socket room
          if (socketService.isConnected()) {
            socketService.joinHangout(latestHangout.id);
          }

          // Set up individual hangout listener for real-time updates
          const hangoutUnsubscribe = listenToHangout(
            latestHangout.id,
            (updatedHangout) => {
              setActiveHangout(updatedHangout);
            }
          );
        }
      } else {
        // No active hangouts
        if (activeHangout) {
          console.log("📤 No active hangouts, clearing current hangout");
          setActiveHangout(null);
          setLiveLocations({});
        }
      }
    });

    setHangoutListener(() => unsubscribe);
  };

  // Monitor connection status
  useEffect(() => {
    const checkConnection = () => {
      const connected = socketService.isConnected();
      setIsConnected(connected);
      setConnectionStatus(connected ? "connected" : "disconnected");
    };

    const interval = setInterval(checkConnection, 1000);
    return () => clearInterval(interval);
  }, []);

  const connectSocket = () => {
    try {
      socketService.connect();

      // Set up location update listener
      socketService.onNewLocationUpdate((data) => {
        setLiveLocations((prev) => ({
          ...prev,
          [data.userId]: data.location,
        }));
      });

      // Set up hangout invitation listener
      socketService.onHangoutInvitation((data) => {
        console.log(
          "📨 Received hangout invitation via socket:",
          data.hangoutId
        );
        // The Firestore listener will handle the actual joining
      });

      setConnectionStatus("connecting");
    } catch (error) {
      console.error("Failed to connect socket:", error);
      setConnectionStatus("error");
    }
  };

  const disconnectSocket = () => {
    socketService.disconnect();
    setIsConnected(false);
    setConnectionStatus("disconnected");
    setLiveLocations({});
  };

  const startHangout = async (
    friendId: string,
    destination: { name: string; lat: number; lng: number; address?: string }
  ): Promise<string> => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    try {
      const hangoutId = await createHangout(userId, friendId, destination);

      // Join the socket room
      socketService.joinHangout(hangoutId);

      // Notify other participants via socket
      socketService.notifyHangoutCreated(hangoutId, [userId, friendId]);

      // Listen to hangout updates
      const unsubscribe = listenToHangout(hangoutId, (hangout) => {
        setActiveHangout(hangout);
      });

      console.log("✅ Hangout created:", hangoutId);
      return hangoutId;
    } catch (error) {
      console.error("Failed to start hangout:", error);
      throw error;
    }
  };

  const joinHangout = (hangoutId: string) => {
    if (!socketService.isConnected()) {
      console.warn("Socket not connected, cannot join hangout");
      return;
    }

    // Join the socket room
    socketService.joinHangout(hangoutId);

    // Listen to hangout updates
    const unsubscribe = listenToHangout(hangoutId, (hangout) => {
      setActiveHangout(hangout);
    });

    console.log("✅ Joined hangout:", hangoutId);
  };

  const updateStatus = async (status: ParticipantStatus) => {
    if (!activeHangout || !userId) {
      console.warn("No active hangout or user not authenticated");
      return;
    }

    try {
      await updateMyStatus(activeHangout.id, userId, status);
      console.log("✅ Status updated to:", status);
    } catch (error) {
      console.error("Failed to update status:", error);
      throw error;
    }
  };

  const sendLocationUpdate = (location: Location) => {
    if (!activeHangout || !userId || !socketService.isConnected()) {
      console.warn(
        "Cannot send location update: missing hangout, user, or socket connection"
      );
      return;
    }

    socketService.sendLocationUpdate({
      hangoutId: activeHangout.id,
      userId,
      location,
    });
  };

  const endHangout = () => {
    if (activeHangout) {
      stopLocationTracking(); // Stop location tracking when hangout ends
      setActiveHangout(null);
      setLiveLocations({});
      socketService.removeLocationUpdateListener();
      console.log("✅ Hangout ended");
    }
  };

  const startLocationTracking = async (): Promise<boolean> => {
    if (isLocationTracking) {
      console.log("Location tracking already active");
      return true;
    }

    try {
      const success = await locationService.startLocationTracking(
        (location) => {
          setMyLocation(location);
          sendLocationUpdate(location);
        },
        {
          timeInterval: 3000, // Update every 3 seconds
          distanceInterval: 10, // Update every 10 meters
        }
      );

      setIsLocationTracking(success);
      if (success) {
        console.log("✅ Location tracking started");
      }
      return success;
    } catch (error) {
      console.error("Failed to start location tracking:", error);
      return false;
    }
  };

  const stopLocationTracking = () => {
    locationService.stopLocationTracking();
    setIsLocationTracking(false);
    console.log("✅ Location tracking stopped");
  };

  const value: SessionContextType = {
    activeHangout,
    liveLocations,
    myLocation,
    isConnected,
    connectionStatus,
    isLocationTracking,
    startHangout,
    joinHangout,
    updateStatus,
    sendLocationUpdate,
    endHangout,
    connectSocket,
    disconnectSocket,
    startLocationTracking,
    stopLocationTracking,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
