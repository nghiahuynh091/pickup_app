// import Button from "@/components/Button";

import { ThemedText, ThemedView } from "@/src";

import { Alert, StyleSheet, TextInput, TouchableOpacity } from "react-native";
// import * as Updates from "expo-updates";

import { router } from "expo-router";
import React, { useState } from "react";

import { useAuth } from "@/src";

import { Button } from "@/src/components/ui";
function LoginProcess() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const {
    signInAnonymously,
    signInWithEmail,
    signUpWithEmail,
    isLoading,
    error,
  } = useAuth();

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
  const handleAnonymousLogin = async () => {
    await signInAnonymously()
      .then(() => {
        router.replace("/(tabs)");
      })
      .catch((error: any) => {
        Alert.alert("Anonymous Login Failed", error.message);
      });
  };

  const handleEmailLogin = async () => {
    try {
      await signInWithEmail(email, password);
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Login failed", err?.message || "Unknown error");
    }
  };

  const handleEmailSignUp = async () => {
    try {
      await signUpWithEmail(email, password);
      Alert.alert("Success", "Account created! Please sign in.");
      setIsSignUp(false);
    } catch (err: any) {
      Alert.alert("Sign up failed", err?.message || "Unknown error");
    }
  };
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>
        {isSignUp ? "Create Account" : "Welcome Back"}
      </ThemedText>

      {error && (
        <ThemedText style={styles.errorText}>{error.message}</ThemedText>
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        label={isSignUp ? "Sign Up" : "Login"}
        onPress={isSignUp ? handleEmailSignUp : handleEmailLogin}
        loading={isLoading}
        variant="primary"
        style={styles.button}
      />

      <Button
        label="Continue as Guest"
        onPress={handleAnonymousLogin}
        variant="outline"
        style={styles.button}
      />

      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <ThemedText style={styles.linkText}>
          {isSignUp
            ? "Already have an account? Sign in"
            : "Don't have an account? Sign up"}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
export default LoginProcess;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    marginBottom: 15,
  },
  linkText: {
    textAlign: "center",
    color: "#007AFF",
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 15,
  },
});
