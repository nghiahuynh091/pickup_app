// import Button from "@/components/Button";

import { useNotification } from "@/src";
import { ThemedText, ThemedView } from "@/src/components";
import { Platform, SafeAreaView, StatusBar, StyleSheet } from "react-native";
// import * as Updates from "expo-updates";
import { useAuth } from "@/src";
import { Button, StatusButtons } from "@/src/components/ui";
import * as Notifications from "expo-notifications";
import { useState } from "react";

import { Alert, Text, TouchableOpacity, View } from "react-native";

async function schedulePushNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "You've got mail! Holaaaaaaaa 📬",
      body: "Here is the notification body",
      data: { data: "goes here", test: { test1: "more data" } },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
    },
  });
}
export default function Index() {
  const { notification, expoPushToken, error, sendNotification } =
    useNotification();
  const handleStatusCreated = (documentId: string) => {
    console.log("Status created with ID:", documentId);
    // You can add additional logic here, like updating local state
  };

  const { user, isAuthenticated, signInAnonymously } = useAuth();
  const [toUserId, setToUserId] = useState("user123"); // Demo user ID
  const [sessionId, setSessionId] = useState("session456"); // Demo session ID
  const [messageText, setMessageText] = useState("");
  const [useSessionId, setUseSessionId] = useState(false);

  const handleSignIn = async () => {
    try {
      await signInAnonymously();
      Alert.alert("Success", "Signed in anonymously!");
    } catch (error) {
      Alert.alert("Error", "Failed to sign in");
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Status Demo</Text>
        <Text style={styles.subtitle}>
          Please sign in to test status functionality
        </Text>
        <TouchableOpacity style={[styles.signInButton]} onPress={handleSignIn}>
          <Text style={styles.signInButtonText}>Sign In Anonymously</Text>
        </TouchableOpacity>
      </View>
    );
  }
  // const { currentlyRunning, isUpdateAvailable, isUpdatePending } =
  //   Updates.useUpdates();

  // const [dummyState, setDummyState] = useState(0);

  // if (error) {
  //   return <ThemedText>Error: {error.message}</ThemedText>;
  // }

  // useEffect(() => {
  //   if (isUpdatePending) {
  //     // Update has successfully downloaded; apply it now
  //     // Updates.reloadAsync();
  //     // setDummyState(dummyState + 1);
  //     // Alert.alert("Update downloaded and applied");

  //     dummyFunction();
  //   }
  // }, [isUpdatePending]);

  // const dummyFunction = async () => {
  //   try {
  //     await Updates.reloadAsync();
  //   } catch (e) {
  //     Alert.alert("Error");
  //   }

  //   // UNCOMMENT TO REPRODUCE EAS UPDATE ERROR
  //   // } finally {
  //   //   setDummyState(dummyState + 1);
  //   //   console.log("dummyFunction");
  //   // }
  // };

  // If true, we show the button to download and run the update

  // const showDownloadButton = isUpdateAvailable;

  // Show whether or not we are running embedded code or an update

  // const runTypeMessage = currentlyRunning.isEmbeddedLaunch
  //   ? "This app is running from built-in code"
  //   : "This app is running an update";

  return (
    <ThemedView
      style={{
        flex: 1,
        padding: 10,
        paddingTop: Platform.OS == "android" ? StatusBar.currentHeight : 10,
      }}
    >
      <SafeAreaView style={styles.section}>
        {/* <ThemedText>{runTypeMessage}</ThemedText> */}
        {/* <Button
          onPress={() => Updates.checkForUpdateAsync()}
          title="Check manually for updates"
        />
        {showDownloadButton ? (
          <Button
            onPress={() => Updates.fetchUpdateAsync()}
            title="Download and run update"
          />
        ) : null} */}
        <Text style={styles.title}>Status Demo</Text>
        <Text style={styles.subtitle}>
          User: {user?.uid} ({user?.isAnonymous ? "Anonymous" : "Authenticated"}
          )
        </Text>
        <ThemedText type="subtitle">Latest notification:</ThemedText>
        <ThemedText>{notification?.request.content.title}</ThemedText>
        <ThemedText>
          {JSON.stringify(notification?.request.content.data, null, 2)}
        </ThemedText>
      </SafeAreaView>


      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Buttons</Text>

        <View style={styles.buttonRow}>
          <StatusButtons.Arriving
            toUserId={useSessionId ? undefined : toUserId}
            sessionId={useSessionId ? sessionId : undefined}
            messageText={messageText || undefined}
            onStatusCreated={() => sendNotification("Message from your friend", "Tao ddang toi ne")}
          />

          <StatusButtons.FiveMinLeft
            toUserId={useSessionId ? undefined : toUserId}
            sessionId={useSessionId ? sessionId : undefined}
            messageText={messageText || undefined}
            onStatusCreated={handleStatusCreated}
          />
        </View>

        <View style={styles.buttonRow}>
          <StatusButtons.Arrived
            toUserId={useSessionId ? undefined : toUserId}
            sessionId={useSessionId ? sessionId : undefined}
            messageText={messageText || undefined}
            onStatusCreated={handleStatusCreated}
          />
        </View>
      </View>




      {/* Instructions */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <Text style={styles.instructions}>
          1. Configure the target user ID or session ID above{"\n"}
          2. Optionally add a message{"\n"}
          3. Tap any status button to create a Firestore document{"\n"}
          4. Check the Firebase Console to verify the document was created{"\n"}
          5. Check the console logs for document IDs
        </Text>
      </View> */}
      <Button
        label="Press to test notification"
        onPress={async () => {
          await schedulePushNotification();
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "f5f5f5",
    // alignItems: "center",
  },
  imageContainer: {
    flex: 1,
    paddingTop: 28,
  },
  footContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    backgroundColor: "#ffffff7d",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  instructions: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
  },
  signInButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
