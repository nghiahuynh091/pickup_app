import { SimpleMapView } from "@/src/components/maps/SimpleMapView";
import { useAuth } from "@/src/context/AuthContext";
import { useSession } from "@/src/context/SessionContext";
import { socketService } from "@/src/services/SocketService";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
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

export default function HangoutScreen() {
  const {
    activeHangout,
    liveLocations,
    myLocation,
    isConnected,
    connectionStatus,
    isLocationTracking,
    updateStatus,
    sendLocationUpdate,
    endHangout,
    startLocationTracking,
    stopLocationTracking,
  } = useSession();

  const { user } = useAuth();
  const [showMap, setShowMap] = useState(true);

  // Socket test states
  const [testMessage, setTestMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);
  const [showSocketTest, setShowSocketTest] = useState(false);

  // Auto-start location tracking when hangout is active
  useEffect(() => {
    if (activeHangout && !isLocationTracking) {
      startLocationTracking();
    } else if (!activeHangout && isLocationTracking) {
      stopLocationTracking();
    }
  }, [activeHangout, isLocationTracking]);

  // Set up socket message listeners for testing
  useEffect(() => {
    if (activeHangout) {
      // Listen for real-time messages (pure socket, no Firestore)
      socketService.onNewMessage((data) => {
        setReceivedMessages((prev) => [
          ...prev,
          `${data.username}: ${data.message}`,
        ]);
      });

      // Listen for ping responses
      socketService.onPongDevice((data) => {
        setReceivedMessages((prev) => [...prev, `🏓 Pong: ${data.response}`]);
      });
    }

    return () => {
      socketService.removeAllListeners();
    };
  }, [activeHangout]);

  const handleLocationTrackingToggle = async () => {
    if (isLocationTracking) {
      stopLocationTracking();
    } else {
      const success = await startLocationTracking();
      if (!success) {
        Alert.alert(
          "Location Error",
          "Failed to start location tracking. Please check your location permissions."
        );
      }
    }
  };

  const handleStatusUpdate = async (status: any) => {
    try {
      await updateStatus(status);
      Alert.alert("Success", `Status updated to: ${status}`);
    } catch (error) {
      Alert.alert("Error", "Failed to update status");
      console.error(error);
    }
  };

  const handleEndHangout = () => {
    Alert.alert("End Hangout", "Are you sure you want to end this hangout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End",
        style: "destructive",
        onPress: () => {
          endHangout();
          Alert.alert("Success", "Hangout ended");
        },
      },
    ]);
  };

  // Socket test functions
  const sendTestMessage = () => {
    if (!testMessage.trim() || !activeHangout || !user) return;

    socketService.sendMessage({
      hangoutId: activeHangout.id,
      userId: user.uid,
      username: user.displayName || user.email || "Anonymous",
      message: testMessage.trim(),
    });

    setReceivedMessages((prev) => [...prev, `You: ${testMessage.trim()}`]);
    setTestMessage("");
  };

  const sendPingTest = () => {
    if (!activeHangout || !user) return;

    const participants = activeHangout.participants.filter(
      (id) => id !== user.uid
    );
    if (participants.length === 0) {
      Alert.alert(
        "No Other Participants",
        "Need another user in hangout to test ping"
      );
      return;
    }

    socketService.pingDevice({
      hangoutId: activeHangout.id,
      fromUserId: user.uid,
      toUserId: participants[0], // Ping first other participant
      message: "Testing direct device communication!",
    });

    setReceivedMessages((prev) => [...prev, "🏓 Ping sent to other device..."]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "On My Way":
        return "#3b82f6";
      case "5 Mins Left":
        return "#f59e0b";
      case "Arrived":
        return "#10b981";
      case "Idle":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "#10b981";
      case "connecting":
        return "#f59e0b";
      case "disconnected":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  if (!activeHangout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={64} color="#6b7280" />
          <Text style={styles.emptyTitle}>No Active Hangout</Text>
          <Text style={styles.emptySubtitle}>
            Start a hangout with friends from the Friends tab to see it here
          </Text>
          <View style={styles.connectionStatus}>
            <View
              style={[
                styles.connectionDot,
                { backgroundColor: getConnectionStatusColor() },
              ]}
            />
            <Text style={styles.connectionText}>
              Socket: {connectionStatus}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentUserStatus =
    activeHangout.participantInfo[user?.uid || ""]?.status || "Idle";
  const participants = activeHangout.participants.filter(
    (id) => id !== user?.uid
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Active Hangout</Text>
        <View style={styles.headerControls}>
          <TouchableOpacity
            style={styles.mapToggle}
            onPress={() => setShowMap(!showMap)}
          >
            <Ionicons
              name={showMap ? "list" : "map"}
              size={20}
              color="#ffffff"
            />
            <Text style={styles.mapToggleText}>
              {showMap ? "Details" : "Map"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.mapToggle,
              { backgroundColor: showSocketTest ? "#ef4444" : "#10b981" },
            ]}
            onPress={() => setShowSocketTest(!showSocketTest)}
          >
            <Ionicons name="radio" size={20} color="#ffffff" />
            <Text style={styles.mapToggleText}>
              {showSocketTest ? "Hide Test" : "Socket Test"}
            </Text>
          </TouchableOpacity>

          <View style={styles.connectionStatus}>
            <View
              style={[
                styles.connectionDot,
                { backgroundColor: getConnectionStatusColor() },
              ]}
            />
            <Text style={styles.connectionText}>
              {isConnected ? "Connected" : "Disconnected"}
            </Text>
          </View>
        </View>
      </View>

      {/* Map View */}
      {showMap ? (
        <View style={styles.mapContainer}>
          <SimpleMapView
            hangout={activeHangout}
            liveLocations={liveLocations}
            currentUserId={user?.uid || ""}
            myLocation={myLocation}
          />

          {/* Map Controls Overlay */}
          <View style={styles.mapControls}>
            <View style={styles.locationTrackingControl}>
              <Text style={styles.controlLabel}>Location Tracking</Text>
              <Switch
                value={isLocationTracking}
                onValueChange={handleLocationTrackingToggle}
                trackColor={{ false: "#d1d5db", true: "#10b981" }}
                thumbColor={isLocationTracking ? "#ffffff" : "#f3f4f6"}
              />
            </View>

            {myLocation && (
              <Text style={styles.locationInfoText}>
                📍 Your location: {myLocation.lat.toFixed(4)},{" "}
                {myLocation.lng.toFixed(4)}
              </Text>
            )}
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Hangout Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hangout Details</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color="#3b82f6" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Destination</Text>
                  <Text style={styles.infoValue}>
                    {activeHangout.destination.name}
                  </Text>
                  {activeHangout.destination.address && (
                    <Text style={styles.infoSubvalue}>
                      {activeHangout.destination.address}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="people" size={20} color="#3b82f6" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Participants</Text>
                  <Text style={styles.infoValue}>
                    {activeHangout.participants.length} people
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="time" size={20} color="#3b82f6" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Hangout ID</Text>
                  <Text style={styles.infoValueSmall}>{activeHangout.id}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* My Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Status</Text>
            <View style={styles.statusCard}>
              <View style={styles.currentStatus}>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: getStatusColor(currentUserStatus) },
                  ]}
                />
                <Text style={styles.currentStatusText}>
                  {currentUserStatus}
                </Text>
              </View>

              <View style={styles.statusButtons}>
                {["On My Way", "5 Mins Left", "Arrived", "Idle"].map(
                  (status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusButton,
                        {
                          backgroundColor:
                            currentUserStatus === status
                              ? getStatusColor(status)
                              : "#f3f4f6",
                        },
                      ]}
                      onPress={() => handleStatusUpdate(status)}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          {
                            color:
                              currentUserStatus === status
                                ? "#ffffff"
                                : "#374151",
                          },
                        ]}
                      >
                        {status}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
          </View>

          {/* Participants Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Participants ({participants.length})
            </Text>
            <View style={styles.participantsCard}>
              {participants.map((participantId) => {
                const participantInfo =
                  activeHangout.participantInfo[participantId];
                const status = participantInfo?.status || "Idle";
                const hasLocation = liveLocations[participantId];

                return (
                  <View key={participantId} style={styles.participantRow}>
                    <View style={styles.participantInfo}>
                      <View style={styles.participantAvatar}>
                        <Text style={styles.participantAvatarText}>
                          {participantId.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.participantDetails}>
                        <Text style={styles.participantName}>
                          Friend {participantId.slice(-4)}
                        </Text>
                        <View style={styles.participantStatus}>
                          <View
                            style={[
                              styles.statusDot,
                              { backgroundColor: getStatusColor(status) },
                            ]}
                          />
                          <Text style={styles.participantStatusText}>
                            {status}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.participantMeta}>
                      {hasLocation && (
                        <View style={styles.locationInfo}>
                          <Ionicons name="location" size={12} color="#10b981" />
                          <Text style={styles.locationText}>Live</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}

              {participants.length === 0 && (
                <Text style={styles.noParticipantsText}>
                  No other participants yet
                </Text>
              )}
            </View>
          </View>

          {/* Live Locations */}
          {Object.keys(liveLocations).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Live Locations</Text>
              <View style={styles.locationsCard}>
                {Object.entries(liveLocations).map(([userId, location]) => (
                  <View key={userId} style={styles.locationRow}>
                    <View style={styles.locationUser}>
                      <Ionicons name="location" size={16} color="#10b981" />
                      <Text style={styles.locationUserText}>
                        {userId === user?.uid
                          ? "You"
                          : `Friend ${userId.slice(-4)}`}
                      </Text>
                    </View>
                    <Text style={styles.locationCoords}>
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Socket Test Section */}
          {showSocketTest && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Test Messaging</Text>
              <View style={styles.socketTestCard}>


                {/* Message Test */}
                <View style={styles.socketTestRow}>
                  <TextInput
                    style={styles.socketTestInput}
                    placeholder="Type a test message..."
                    value={testMessage}
                    onChangeText={setTestMessage}
                  />
                  <TouchableOpacity
                    style={styles.socketTestButton}
                    onPress={sendTestMessage}
                  >
                    <Text style={styles.socketTestButtonText}>Send</Text>
                  </TouchableOpacity>
                </View>

                {/* Ping Test */}
                <TouchableOpacity
                  style={[
                    styles.socketTestButton,
                    { marginTop: 8, backgroundColor: "#f59e0b" },
                  ]}
                  onPress={sendPingTest}
                >
                  <Text style={styles.socketTestButtonText}>
                    🏓 Ping Other Device
                  </Text>
                </TouchableOpacity>

                {/* Messages Display */}
                {receivedMessages.length > 0 && (
                  <View style={styles.messagesContainer}>
                    <Text style={styles.messagesTitle}>
                      Real-time Messages:
                    </Text>
                    {receivedMessages.slice(-5).map((msg, index) => (
                      <Text key={index} style={styles.messageText}>
                        {msg}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.endButton}
              onPress={handleEndHangout}
            >
              <Ionicons name="stop-circle" size={20} color="#ffffff" />
              <Text style={styles.endButtonText}>End Hangout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
  },
  infoValueSmall: {
    fontSize: 12,
    color: "#111827",
    fontFamily: "monospace",
  },
  infoSubvalue: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  currentStatusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  statusButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 80,
    alignItems: "center",
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  participantsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  participantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  participantInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  participantAvatarText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  participantStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  participantStatusText: {
    fontSize: 12,
    color: "#6b7280",
  },
  participantMeta: {
    alignItems: "flex-end",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 10,
    color: "#10b981",
    marginLeft: 2,
    fontWeight: "500",
  },
  noParticipantsText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 16,
  },
  locationsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  locationUser: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationUserText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    marginLeft: 4,
  },
  locationCoords: {
    fontSize: 12,
    color: "#6b7280",
    fontFamily: "monospace",
  },
  endButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  endButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  // Map styles
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  mapControls: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationTrackingControl: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  locationInfoText: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
    fontFamily: "monospace",
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mapToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  mapToggleText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  // Socket test styles
  socketTestCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#10b981",
  },
  socketTestDescription: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
    fontStyle: "italic",
  },
  socketTestRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  socketTestInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#f9fafb",
  },
  socketTestButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  socketTestButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  messagesContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  messagesTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  messageText: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
    fontFamily: "monospace",
  },
});
