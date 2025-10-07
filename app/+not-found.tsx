import { Link, Stack } from "expo-router";
import { StyleSheet } from "react-native";

import {ThemedText, ThemedView} from "@/src";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">This screen doesn't exist.</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2528",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#fff",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
