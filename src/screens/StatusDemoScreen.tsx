import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusButtons } from "../components/ui/Button/StatusButton";
import { useAuth } from "../context/AuthContext";

export const StatusDemoScreen: React.FC = () => {
  const { user, isAuthenticated, signInAnonymously } = useAuth();
  const [toUserId, setToUserId] = useState("user123"); // Demo user ID
  const [sessionId, setSessionId] = useState("session456"); // Demo session ID
  const [messageText, setMessageText] = useState("");
  const [useSessionId, setUseSessionId] = useState(true);

  const handleStatusCreated = (documentId: string) => {
    console.log("Status document created with ID:", documentId);
    Alert.alert("Success", `Status document created: ${documentId}`);
  };

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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Status Demo</Text>
      <Text style={styles.subtitle}>
        User: {user?.uid} ({user?.isAnonymous ? "Anonymous" : "Authenticated"})
      </Text>

      {/* Configuration Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuration</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Target User ID:</Text>
          <TextInput
            style={styles.input}
            value={toUserId}
            onChangeText={setToUserId}
            placeholder="Enter target user ID"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Session ID:</Text>
          <TextInput
            style={styles.input}
            value={sessionId}
            onChangeText={setSessionId}
            placeholder="Enter session ID"
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Use Session ID (vs User ID):</Text>
          <Switch value={useSessionId} onValueChange={setUseSessionId} />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Optional Message:</Text>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Enter optional message"
            multiline
          />
        </View>
      </View>

      {/* Status Buttons Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Buttons</Text>

        <View style={styles.buttonRow}>
          <StatusButtons.Arriving
            toUserId={useSessionId ? undefined : toUserId}
            sessionId={useSessionId ? sessionId : undefined}
            messageText={messageText || undefined}
            onStatusCreated={handleStatusCreated}
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <Text style={styles.instructions}>
          1. Configure the target user ID or session ID above{"\n"}
          2. Optionally add a message{"\n"}
          3. Tap any status button to create a Firestore document{"\n"}
          4. Check the Firebase Console to verify the document was created{"\n"}
          5. Check the console logs for document IDs
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
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
