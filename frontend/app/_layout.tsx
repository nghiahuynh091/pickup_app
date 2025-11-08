import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
// import * as TaskManager from "expo-task-manager";

import { useEffect } from "react";

// Fixed imports - use individual imports for now
import { AuthProvider, StatusProvider } from "@/src";
import { FriendsProvider } from "@/src/context/FriendsContext";
import { SessionProvider } from "@/src/context/SessionContext";

import { NotificationProvider } from "@/context/NotificationContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import * as firebase from "@/src/db/config";
import "react-native-reanimated";

console.log(
  "Firebase initialized!",
  firebase.app.name ? `Success: ${firebase.app.name}` : "Failed"
);
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
      <FriendsProvider>
        <StatusProvider>
          <SessionProvider>
            <NotificationProvider>
              <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
              >
                <Stack>
                  <Stack.Screen
                    name="(auth)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </ThemeProvider>
            </NotificationProvider>
          </SessionProvider>
        </StatusProvider>
      </FriendsProvider>
    </AuthProvider>
  );
}
