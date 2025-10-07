export interface NotificationContextType {
  expoPushToken: string | null;
  notification: any | null; // Using any for now, will be properly typed later
  error: Error | null;
  sendNotification: (title: string, body: string) => Promise<void>;
  clearNotification: () => void;
}

export interface NotificationProviderProps {
  children: React.ReactNode;
}

export interface PushNotificationRequest {
  to: string;
  sound?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}