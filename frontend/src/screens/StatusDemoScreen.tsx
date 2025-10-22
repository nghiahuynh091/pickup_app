import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";

import { SafeAreaView } from "react-native";
import { StatusList } from "../components";

export const StatusDemoScreen: React.FC = () => {
  const { user, isAuthenticated, signInAnonymously } = useAuth();
  const [toUserId, setToUserId] = useState(false); // Demo user ID
  const [sessionId, setSessionId] = useState(""); // Demo session ID
  const [userFilter, setUserFilter] = useState("");
  const [sentMessage, setSentMessage] = useState(false);
  const [receivedMessage, setReceivedMessage] = useState(false);

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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.title}>Real-Time Status Demo</Text>

          {!isAuthenticated && (
            <View style={styles.authSection}>
              <Text style={styles.authText}>
                Please sign in to create statuses:
              </Text>
              <TouchableOpacity
                style={[styles.signInButton]}
                onPress={handleSignIn}
              >
                <Text style={styles.signInButtonText}>Sign In Anonymously</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {isAuthenticated && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Filter Controls</Text>

              <View style={styles.filterControls}>
                <View style={styles.filterOption}>
                  <Text style={styles.filterLabel}>Sent Messages</Text>
                  <Switch value={sentMessage} onValueChange={setSentMessage} />
                </View>

                <View style={styles.filterOption}>
                  <Text style={styles.filterLabel}>
                    Received Messages ({user?.displayName || "N/A"})
                  </Text>
                  <Switch
                    value={receivedMessage}
                    onValueChange={setReceivedMessage}
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <StatusList
                sessionId={sessionId || undefined}
                userId={user?.uid || undefined}
                sentMessageQuery={sentMessage && isAuthenticated}
                receivedMessageQuery={receivedMessage && isAuthenticated}
                showControls={true}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
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
  scrollView: {
    flex: 1,
  },
  authSection: {
    marginTop: 16,
    alignItems: "center",
  },
  authText: {
    textAlign: "center",
    marginBottom: 12,
    color: "#666",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  filterControls: {
    gap: 12,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  filterLabel: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
});
