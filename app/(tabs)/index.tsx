// import Button from "@/components/Button";

import { ThemedText, ThemedView, useNotification } from "@/src";
import { Platform, SafeAreaView, StatusBar, StyleSheet } from "react-native";
// import * as Updates from "expo-updates";
import * as Notifications from "expo-notifications";

import { Button } from "@/src";

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
      <SafeAreaView style={{ flex: 1 }}>
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

        <ThemedText type="subtitle">Latest notification:</ThemedText>
        <ThemedText>{notification?.request.content.title}</ThemedText>
        <ThemedText>
          {JSON.stringify(notification?.request.content.data, null, 2)}
        </ThemedText>
      </SafeAreaView>

      <ThemedView
        style={{
          flex: 1 / 3,
          alignItems: "center",
        }}
      >
        <SafeAreaView>
          <Button
            label="Arriving"
            variant="secondary"
            onPress={async () =>
              await sendNotification("Bạn mình ơi!", "Tôi đang đến lè")
            }
          />
          <Button
            label="5-min-left"
            variant="ghost"
            onPress={async () =>
              await sendNotification(
                "Bạn mình ơi!",
                "Chờ thêm 5p nữa thôi làm gì căng"
              )
            }
          ></Button>
          <Button
            label="Here"
            onPress={async () =>
              await sendNotification("Bạn mình ơi!", "Xuống lẹ đi pà")
            }
          ></Button>
        </SafeAreaView>
      </ThemedView>

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
    backgroundColor: "#25292e",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
    paddingTop: 28,
  },
  footContainer: {
    alignItems: "center",
  },
});
