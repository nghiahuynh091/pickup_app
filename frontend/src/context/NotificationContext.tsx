import * as Notifications from "expo-notifications";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { NotificationService } from "@/src/services/push-notifications/NotificationService";
import { 
  NotificationContextType, 
  NotificationProviderProps 
} from "@/src/types/notification.types";

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<any | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Register for push notifications
    NotificationService.registerForPushNotifications()
      .then((token) => setExpoPushToken(token || null))
      .catch((error) => setError(error));

    // Set up notification listeners
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("🔔 Notification Received: ", notification);
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("🔔 Notification Response: ", response);
        // Handle the notification response here
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const sendNotification = async (title: string, body: string) => {
    if (!expoPushToken) {
      throw new Error('No push token available');
    }
    
    try {
      await NotificationService.sendPushNotification({
        to: expoPushToken,
        title,
        body,
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const contextValue: NotificationContextType = {
    expoPushToken,
    notification,
    error,
    sendNotification,
    clearNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};