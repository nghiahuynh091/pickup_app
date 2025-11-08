import { useSession } from "@/src/context/SessionContext";
import { socketService } from "@/src/services/SocketService";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConnectionScreen() {
  const {
    isConnected,
    connectionStatus,
    activeHangout,
    liveLocations,
    connectSocket,
    disconnectSocket,
    startHangout,
    joinHangout,
    sendLocationUpdate,
    updateStatus,
    endHangout,
  } = useSession();

  const [friendId, setFriendId] = useState("test-friend-123");
  const [hangoutId, setHangoutId] = useState("");
  const [testLocation, setTestLocation] = useState({
    lat: 37.7749,
    lng: -122.4194,
  });
  const [autoLocation, setAutoLocation] = useState(false);

  // Auto-send location updates for testing
  useEffect(() => {
    if (!autoLocation || !activeHangout) return;

    const interval = setInterval(() => {
      // Simulate moving location
      const newLat = testLocation.lat + (Math.random() - 0.5) * 0.001;
      const newLng = testLocation.lng + (Math.random() - 0.5) * 0.001;

      setTestLocation({ lat: newLat, lng: newLng });
      sendLocationUpdate({ lat: newLat, lng: newLng });
    }, 3000);

    return () => clearInterval(interval);
  }, [autoLocation, activeHangout, testLocation]);

  const handleStartHangout = async () => {
    try {
      const destination = {
        name: "Test Destination",
        lat: 37.7849,
        lng: -122.4094,
        address: "497 Hoa Hao, Ho Chi Minh City, VietNam",
      };

      const hangoutId = await startHangout(friendId, destination);
      Alert.alert("Success", `Hangout created: ${hangoutId}`);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  const handleJoinHangout = () => {
    if (!hangoutId.trim()) {
      Alert.alert("Error", "Please enter a hangout ID");
      return;
    }
    joinHangout(hangoutId.trim());
    Alert.alert("Success", `Joined hangout: ${hangoutId}`);
  };

  const handleSendLocation = () => {
    sendLocationUpdate(testLocation);
    Alert.alert("Success", "Location sent!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "#10b981";
      case "connecting":
        return "#f59e0b";
      case "disconnected":
        return "#ef4444";
      case "error":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return "checkmark-circle";
      case "connecting":
        return "sync";
      case "disconnected":
        return "close-circle";
      case "error":
        return "warning";
      default:
        return "help-circle";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Socket Connection</Text>
          <Text style={styles.subtitle}>Real-time connection management</Text>
        </View>

        {/* Connection Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection Status</Text>
          <View
            style={[
              styles.statusCard,
              { borderColor: getStatusColor(connectionStatus) },
            ]}
          >
            <View style={styles.statusRow}>
              <Ionicons
                name={getStatusIcon(connectionStatus)}
                size={24}
                color={getStatusColor(connectionStatus)}
              />
              <View style={styles.statusInfo}>
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(connectionStatus) },
                  ]}
                >
                  {connectionStatus.toUpperCase()}
                </Text>
                <Text style={styles.statusSubtext}>
                  {isConnected
                    ? "Socket.IO connected"
                    : "Socket.IO disconnected"}
                </Text>
              </View>
            </View>

            <View style={styles.connectionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.connectButton]}
                onPress={connectSocket}
                disabled={isConnected}
              >
                <Text style={styles.buttonText}>Connect</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.disconnectButton]}
                onPress={disconnectSocket}
                disabled={!isConnected}
              >
                <Text style={styles.buttonText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Socket Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Socket Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Socket ID:</Text>
              <Text style={styles.detailValue}>
                {socketService.socket?.id || "Not connected"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transport:</Text>
              <Text style={styles.detailValue}>
                {socketService.socket?.io?.engine?.transport?.name || "None"}
              </Text>
            </View>
          </View>
        </View>

        {/* Active Hangout */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Hangout</Text>
          <View style={styles.detailsCard}>
            {activeHangout ? (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Hangout ID:</Text>
                  <Text style={styles.detailValue}>{activeHangout.id}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Destination:</Text>
                  <Text style={styles.detailValue}>
                    {activeHangout.destination.name}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Participants:</Text>
                  <Text style={styles.detailValue}>
                    {activeHangout.participants.length}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.button, styles.endButton]}
                  onPress={endHangout}
                >
                  <Text style={styles.buttonText}>End Hangout</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.noHangoutText}>No active hangout</Text>
            )}
          </View>
        </View>

        {/* Live Locations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live Locations</Text>
          <View style={styles.detailsCard}>
            {Object.keys(liveLocations).length > 0 ? (
              Object.entries(liveLocations).map(([userId, location]) => (
                <View key={userId} style={styles.locationRow}>
                  <Text style={styles.locationUser}>{userId}:</Text>
                  <Text style={styles.locationCoords}>
                    {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noLocationsText}>No live locations</Text>
            )}
          </View>
        </View>

        {/* Testing Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Testing Controls</Text>

          {/* Start Hangout */}
          <View style={styles.testCard}>
            <Text style={styles.testTitle}>Start New Hangout</Text>
            <TextInput
              style={styles.input}
              placeholder="Friend ID"
              value={friendId}
              onChangeText={setFriendId}
            />
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleStartHangout}
              disabled={!isConnected}
            >
              <Text style={styles.buttonText}>Start Hangout</Text>
            </TouchableOpacity>
          </View>

          {/* Join Hangout */}
          <View style={styles.testCard}>
            <Text style={styles.testTitle}>Join Existing Hangout</Text>
            <TextInput
              style={styles.input}
              placeholder="Hangout ID"
              value={hangoutId}
              onChangeText={setHangoutId}
            />
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleJoinHangout}
              disabled={!isConnected}
            >
              <Text style={styles.buttonText}>Join Hangout</Text>
            </TouchableOpacity>
          </View>

          {/* Location Testing */}
          <View style={styles.testCard}>
            <Text style={styles.testTitle}>Location Testing</Text>
            <View style={styles.locationInputs}>
              <TextInput
                style={[styles.input, styles.locationInput]}
                placeholder="Latitude"
                value={testLocation.lat.toString()}
                onChangeText={(text) =>
                  setTestLocation((prev) => ({
                    ...prev,
                    lat: parseFloat(text) || 0,
                  }))
                }
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.locationInput]}
                placeholder="Longitude"
                value={testLocation.lng.toString()}
                onChangeText={(text) =>
                  setTestLocation((prev) => ({
                    ...prev,
                    lng: parseFloat(text) || 0,
                  }))
                }
                keyboardType="numeric"
              />
            </View>

            <View style={styles.autoLocationRow}>
              <Text style={styles.autoLocationText}>
                Auto-send location updates
              </Text>
              <Switch
                value={autoLocation}
                onValueChange={setAutoLocation}
                disabled={!activeHangout}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleSendLocation}
              disabled={!isConnected || !activeHangout}
            >
              <Text style={styles.buttonText}>Send Location</Text>
            </TouchableOpacity>
          </View>

          {/* Status Updates */}
          <View style={styles.testCard}>
            <Text style={styles.testTitle}>Status Updates</Text>
            <View style={styles.statusButtons}>
              {["On My Way", "5 Mins Left", "Arrived", "Idle"].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.button, styles.statusButton]}
                  onPress={() => updateStatus(status as any)}
                  disabled={!activeHangout}
                >
                  <Text style={styles.statusButtonText}>{status}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusInfo: {
    marginLeft: 12,
    flex: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "600",
  },
  statusSubtext: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  connectionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  connectButton: {
    backgroundColor: "#10b981",
  },
  disconnectButton: {
    backgroundColor: "#ef4444",
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
  },
  endButton: {
    backgroundColor: "#dc2626",
    marginTop: 12,
  },
  statusButton: {
    backgroundColor: "#6366f1",
    flex: 1,
    marginHorizontal: 2,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  statusButtonText: {
    color: "#ffffff",
    fontWeight: "500",
    fontSize: 12,
    textAlign: "center",
  },
  detailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "400",
    flex: 1,
    textAlign: "right",
  },
  noHangoutText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    fontStyle: "italic",
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  locationUser: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  locationCoords: {
    fontSize: 12,
    color: "#6b7280",
    fontFamily: "monospace",
  },
  noLocationsText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    fontStyle: "italic",
  },
  testCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
    marginBottom: 12,
  },
  locationInputs: {
    flexDirection: "row",
    gap: 12,
  },
  locationInput: {
    flex: 1,
  },
  autoLocationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  autoLocationText: {
    fontSize: 14,
    color: "#374151",
  },
  statusButtons: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
});
