// Temporary simple map component without native dependencies
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Hangout, Location } from "../../types/session.types";

interface SimpleMapViewProps {
  hangout: Hangout;
  liveLocations: Record<string, Location>;
  currentUserId: string;
  myLocation?: Location | null;
}

export const SimpleMapView: React.FC<SimpleMapViewProps> = ({
  hangout,
  liveLocations,
  currentUserId,
  myLocation,
}) => {
  const calculateDistance = (loc1: Location, loc2: Location): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
    const dLon = ((loc2.lng - loc1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((loc1.lat * Math.PI) / 180) *
        Math.cos((loc2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
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

  return (
    <View style={styles.container}>
      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={64} color="#6b7280" />
        <Text style={styles.placeholderTitle}>Interactive Map</Text>
        <Text style={styles.placeholderSubtitle}>
          Requires app rebuild for native dependencies
        </Text>
      </View>

      {/* Destination Info */}
      <View style={styles.destinationCard}>
        <View style={styles.destinationHeader}>
          <Ionicons name="flag" size={20} color="#ef4444" />
          <Text style={styles.destinationTitle}>
            {hangout.destination.name}
          </Text>
        </View>
        <Text style={styles.destinationAddress}>
          {hangout.destination.address ||
            `${hangout.destination.lat.toFixed(4)}, ${hangout.destination.lng.toFixed(4)}`}
        </Text>

        {myLocation && (
          <Text style={styles.distanceText}>
            📍 {calculateDistance(myLocation, hangout.destination).toFixed(1)}{" "}
            km away
          </Text>
        )}
      </View>

      {/* Participants List */}
      <View style={styles.participantsList}>
        <Text style={styles.participantsTitle}>Live Locations</Text>

        {Object.entries(liveLocations).map(([participantId, location]) => {
          const status =
            hangout.participantInfo[participantId]?.status || "Idle";
          const isCurrentUser = participantId === currentUserId;
          const distance = calculateDistance(location, hangout.destination);

          return (
            <View key={participantId} style={styles.participantItem}>
              <View style={styles.participantInfo}>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: getStatusColor(status) },
                  ]}
                />
                <Text style={styles.participantName}>
                  {isCurrentUser ? "You" : `Friend ${participantId.slice(-4)}`}
                </Text>
                <Text style={styles.participantStatus}>{status}</Text>
              </View>

              <View style={styles.participantLocation}>
                <Text style={styles.coordinates}>
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </Text>
                <Text style={styles.distance}>
                  {distance.toFixed(1)} km to destination
                </Text>
              </View>
            </View>
          );
        })}

        {Object.keys(liveLocations).length === 0 && (
          <Text style={styles.noLocationsText}>
            No live locations available
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    margin: 16,
    borderRadius: 12,
    padding: 32,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  destinationCard: {
    backgroundColor: "#ffffff",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  destinationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  destinationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  destinationAddress: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  distanceText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
  participantsList: {
    backgroundColor: "#ffffff",
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  participantsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  participantItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  participantInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  participantName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginRight: 8,
  },
  participantStatus: {
    fontSize: 12,
    color: "#6b7280",
  },
  participantLocation: {
    alignItems: "flex-end",
  },
  coordinates: {
    fontSize: 11,
    color: "#6b7280",
    fontFamily: "monospace",
  },
  distance: {
    fontSize: 11,
    color: "#3b82f6",
    fontWeight: "500",
  },
  noLocationsText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 16,
  },
});
