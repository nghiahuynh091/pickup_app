import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack, Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
// import * as TaskManager from "expo-task-manager";

import { useEffect } from "react";

// Fixed imports - use individual imports for now
import { AuthProvider, useAuth,LoadingScreen,StatusProvider } from "@/src";


import { NotificationProvider } from "@/context/NotificationContext";
import * as firebase from "@/src/db/config";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";


console.log('Firebase initialized!', firebase.app.name ? `Success: ${firebase.app.name}` : 'Failed');
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});



const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

// TaskManager.defineTask(
//   BACKGROUND_NOTIFICATION_TASK,
//   async ({ data, error, executionInfo }) => {
//     console.log("✅ Received a notification in the background!", {
//       data,
//       error,
//       executionInfo,
//     });
//     // Do something with the notification data
//   }
// );

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <StatusProvider>
        <NotificationProvider>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </ThemeProvider>
        </NotificationProvider>
      </StatusProvider>
    </AuthProvider>
  );
}
