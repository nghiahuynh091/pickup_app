import { PushNotificationRequest } from "@/src/types/notification.types";
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from "expo-notifications";
import { Platform } from 'react-native';

export class NotificationService {
  static async registerForPushNotifications(): Promise<string | undefined> {
    try {
      // Set up Android notification channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Check if it's a physical device
      if (!Device.isDevice) {
        throw new Error('Must use physical device for push notifications');
      }

      // Check and request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted to get push token for push notification!');
      }

      // Get project ID from Expo config
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? 
        Constants?.easConfig?.projectId;
      
      if (!projectId) {
        throw new Error('Project ID not found');
      }

      // Get push token
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      
      console.log('📱 Expo Push Token:', pushTokenString);
      return pushTokenString;
    } catch (error) {
      console.error('❌ Error getting push token:', error);
      throw error;
    }
  }

  static async sendPushNotification(request: PushNotificationRequest): Promise<void> {
    try {
      const message = {
        to: request.to,
        sound: request.sound || 'default',
        title: request.title,
        body: request.body,
        data: request.data || {},
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Failed to send push notification: ${response.status}`);
      }
      
      console.log('✅ Push notification sent successfully');
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
      throw error;
    }
  }

  static scheduleLocalNotification = async (
    title: string,
    body: string,
    trigger?: Notifications.NotificationTriggerInput
  ) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
        },
        trigger: trigger || { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 },
      });
      
      console.log('✅ Local notification scheduled');
    } catch (error) {
      console.error('❌ Error scheduling local notification:', error);
      throw error;
    }
  };
}