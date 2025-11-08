// src/components/StatusList.tsx
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useStatus } from "@/src/context";
import { StatusWithId } from "@/src/types";
import ThemedText from "./ThemedText";
import ThemedView from "./ThemedView";

interface StatusListProps {
  sessionId?: string;
  userId?: string;
  showControls?: boolean;
  sentMessageQuery?: boolean;
  receivedMessageQuery?: boolean;
}

const StatusItem: React.FC<{ item: StatusWithId }> = ({ item }) => {
  const getStatusColor = (statusType: string) => {
    const colors: { [key: string]: string } = {
      arriving: "#4CAF50",
      fiveMinLeft: "#FFC107",
      arrived: "#F44336",
      // : '',
    };
    return colors[statusType] || "#007AFF";
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  return (
    <View
      style={[
        styles.statusItem,
        { borderLeftColor: getStatusColor(item.statusType) },
      ]}
    >
      <View style={styles.statusHeader}>
        <Text
          style={[
            styles.statusType,
            { color: getStatusColor(item.statusType) },
          ]}
        >
          {item.statusType.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
      <Text style={styles.userId}>From: {item.fromUserId}</Text>

      {item.toUserId && (
        <Text style={styles.targetInfo}>To: {item.toUserId}</Text>
      )}

      {item.sessionId && (
        <Text style={styles.targetInfo}>Session: {item.sessionId}</Text>
      )}

      {item.messageText && (
        <Text style={styles.message}>"{item.messageText}"</Text>
      )}
    </View>
  );
};

export const StatusList: React.FC<StatusListProps> = ({
  sessionId,
  userId,
  showControls = true,
  sentMessageQuery = false,
  receivedMessageQuery = false,
}) => {
  const {
    statuses,
    isLoading,
    error,
    subscribeToAllStatuses,
    subscribeToSessionStatuses,
    subscribeToUserStatuses,
    unsubscribeFromStatuses,
    loadMoreStatuses,
    hasMoreStatuses,
    orderDirection,
    setOrderDirection,
    statusLimit,
    setStatusLimit,
    refreshStatuses,
  } = useStatus();

  const [refreshing, setRefreshing] = useState(false);

  // Set up real-time listener based on props
  useEffect(() => {
    if (sessionId) {
      console.log("Setting up session listener for:", sessionId);
      subscribeToSessionStatuses(sessionId, orderDirection);
    } else if (userId) {
      console.log("Setting up user listener for:", userId);
      subscribeToUserStatuses(
        userId,
        orderDirection,
        sentMessageQuery,
        receivedMessageQuery
      );
    } else {
      console.log("Setting up all statuses listener");
      subscribeToAllStatuses();
    }

    return () => {
      unsubscribeFromStatuses();
    };
  }, [sessionId, userId, orderDirection, statusLimit]);

  const handleRefresh = async () => {
    setRefreshing(true);
    refreshStatuses();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLoadMore = () => {
    if (hasMoreStatuses && !isLoading) {
      loadMoreStatuses();
    }
  };

  const toggleOrder = () => {
    const newOrder = orderDirection === "desc" ? "asc" : "desc";
    setOrderDirection(newOrder);
    Alert.alert(
      "Order Changed",
      `Now showing ${newOrder === "desc" ? "newest first" : "oldest first"}`
    );
  };

  const changeLimitOptions = () => {
    Alert.alert("Change Limit", "Select number of statuses to display", [
      { text: "3", onPress: () => setStatusLimit(3) },
      { text: "20", onPress: () => setStatusLimit(20) },
      { text: "50", onPress: () => setStatusLimit(50) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      {showControls && (
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleOrder}>
            <Text style={styles.controlButtonText}>
              {orderDirection === "desc"
                ? "🔽 Newest First"
                : "🔼 Oldest First"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={changeLimitOptions}
          >
            <Text style={styles.controlButtonText}>
              📊 Limit: {statusLimit}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ThemedText style={styles.header}>
        📡 Real-time Status Updates ({statuses.length})
      </ThemedText>

      {error && <Text style={styles.error}>Error: {error}</Text>}

      <FlatList
        data={statuses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StatusItem item={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={() => {
          console.log("Load 1 more statuses");

          handleLoadMore;
        }}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          isLoading ? (
            <Text style={styles.loading}>Loading more statuses...</Text>
          ) : !hasMoreStatuses ? (
            <Text style={styles.endMessage}>No more statuses to load</Text>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.emptyMessage}>
              No statuses yet. Create one to see real-time updates!
            </Text>
          ) : null
        }
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  controlButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  controlButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  statusItem: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  statusType: {
    fontSize: 14,
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
  userId: {
    fontSize: 12,
    color: "#333",
    marginBottom: 2,
  },
  targetInfo: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: "#333",
    fontStyle: "italic",
    marginTop: 4,
  },
  loading: {
    textAlign: "center",
    padding: 16,
    color: "#666",
  },
  endMessage: {
    textAlign: "center",
    padding: 16,
    color: "#999",
    fontSize: 12,
  },
  emptyMessage: {
    textAlign: "center",
    padding: 32,
    color: "#666",
    fontSize: 16,
  },
  error: {
    color: "#F44336",
    textAlign: "center",
    marginBottom: 16,
    padding: 8,
    backgroundColor: "#ffebee",
    borderRadius: 4,
  },
});
