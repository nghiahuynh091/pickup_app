// import Button from "@/components/Button";

import { ThemedText, ThemedView, useNotification } from "@/src";

import { Platform,
        TextInput,
        Alert, 
        SafeAreaView, 
        StatusBar, 
        StyleSheet,
        TouchableOpacity
     } from "react-native";
// import * as Updates from "expo-updates";

import React, { useState } from "react";
import { router } from "expo-router";

import { useAuth} from "@/src";
import { AuthProvider } from "@/src";

import { Button } from "@/src/components/ui";
function LoginProcess() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {signInAnonymously, isLoading, error } = useAuth();

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
    await signInAnonymously().then(() => {
            router.replace("/(tabs)");
        }
    ).catch((error: any) => {
        Alert.alert('Anonymous Login Failed', error.message)
    })
}
  return (

    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Welcome Back</ThemedText>
      
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

      {/* <Button
        label="Login"
        onPress={handleEmailLogin}
        loading={isLoading}
        variant="primary"
        style={styles.button}
      /> */}

      <Button
        label="Continue as Guest"
        onPress={handleAnonymousLogin}
        variant="outline"
        style={styles.button}
      />

      <TouchableOpacity >
        <ThemedText style={styles.linkText}>
          Don't have an account? Sign up
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
export default function LoginScreen(){
    return(
        <AuthProvider>
            <LoginProcess></LoginProcess>
        </AuthProvider>
    )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    marginBottom: 15,
  },
  linkText: {
    textAlign: 'center',
    color: '#007AFF',
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
});