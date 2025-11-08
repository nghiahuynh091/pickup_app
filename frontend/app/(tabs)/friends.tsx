import { useFriends } from "@/src/context/FriendsContext";
import { useSession } from "@/src/context/SessionContext";
import { Friend, UserProfile } from "@/src/types/friends.types";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FriendsScreen() {
  const {
    friends,
    friendRequests,
    sentRequests,
    loading,
    searchUser,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriendById,
  } = useFriends();

  const { startHangout } = useSession();

  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<UserProfile | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    try {
      setSearching(true);
      const user = await searchUser(searchEmail.trim().toLowerCase());
      console.log(user);
      setSearchResult(user);
      console.log(searchUser);

      if (!user) {
        Alert.alert("Not Found", "No user found with this email address");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to search for user");
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  const handleSendFriendRequest = async (toUserId: string) => {
    try {
      await sendRequest(toUserId);
      Alert.alert("Success", "Friend request sent!");
      setShowAddFriendModal(false);
      setSearchEmail("");
      setSearchResult(null);
    } catch (error) {
      Alert.alert("Error", "Failed to send friend request");
      console.error(error);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptRequest(requestId);
      Alert.alert("Success", "Friend request accepted!");
    } catch (error) {
      Alert.alert("Error", "Failed to accept friend request");
      console.error(error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectRequest(requestId);
      Alert.alert("Success", "Friend request rejected");
    } catch (error) {
      Alert.alert("Error", "Failed to reject friend request");
      console.error(error);
    }
  };

  const handleStartHangout = async (friend: Friend) => {
    try {
      const destination = {
        name: "Meeting Point",
        lat: 37.7749,
        lng: -122.4194,
        address: "497 Hoa Hao, Ho Chi Minh City, VietNam",
      };

      const hangoutId = await startHangout(friend.id, destination);
      Alert.alert("Success", `Hangout started with ${friend.userName}!`);
    } catch (error) {
      Alert.alert("Error", "Failed to start hangout");
      console.error(error);
    }
  };

  const handleRemoveFriend = (friend: Friend) => {
    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${friend.userName} from your friends?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await removeFriendById(friend.id);
              Alert.alert("Success", "Friend removed");
            } catch (error) {
              Alert.alert("Error", "Failed to remove friend");
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const renderFriendCard = ({ item: friend }: { item: Friend }) => (
    <View style={styles.friendCard}>
      <View style={styles.friendInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {friend.userName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{friend.userName}</Text>
          <Text style={styles.friendEmail}>{friend.email}</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    friend.status === "online"
                      ? "#10b981"
                      : friend.status === "in-hangout"
                      ? "#f59e0b"
                      : "#6b7280",
                },
              ]}
            />
            <Text style={styles.statusText}>
              {friend.status === "online"
                ? "Online"
                : friend.status === "in-hangout"
                ? "In Hangout"
                : "Offline"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.friendActions}>
        <TouchableOpacity
          style={styles.hangoutButton}
          onPress={() => handleStartHangout(friend)}
        >
          <Ionicons name="location" size={16} color="#ffffff" />
          <Text style={styles.hangoutButtonText}>Start Hangout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFriend(friend)}
        >
          <Ionicons name="trash" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFriendRequest = ({ item: request }: { item: any }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {request.fromUserName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.requestDetails}>
          <Text style={styles.requestName}>{request.fromUserName}</Text>
          <Text style={styles.requestEmail}>{request.fromUserEmail}</Text>
          <Text style={styles.requestTime}>Friend Request</Text>
        </View>
      </View>

      <View style={styles.requestActions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptRequest(request.id)}
        >
          <Ionicons name="checkmark" size={16} color="#ffffff" />
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleRejectRequest(request.id)}
        >
          <Ionicons name="close" size={16} color="#ffffff" />
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSentRequest = ({ item: request }: { item: any }) => (
    <View style={styles.sentRequestCard}>
      <View style={styles.requestInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(request.toUserName || request.toUserEmail || "U")
              .charAt(0)
              .toUpperCase()}
          </Text>
        </View>
        <View style={styles.requestDetails}>
          <Text style={styles.requestName}>
            {request.toUserName || "Unknown User"}
          </Text>
          <Text style={styles.requestEmail}>
            {request.toUserEmail || "Unknown Email"}
          </Text>
          <Text style={styles.requestTime}>Request Sent</Text>
        </View>
      </View>

      <View style={styles.sentRequestStatus}>
        <View style={styles.pendingIndicator}>
          <Ionicons name="time-outline" size={16} color="#f59e0b" />
          <Text style={styles.pendingText}>Pending</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading friends...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Friends</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddFriendModal(true)}
          >
            <Ionicons name="person-add" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Add Friend</Text>
          </TouchableOpacity>
        </View>

        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Friend Requests ({friendRequests.length})
            </Text>
            <FlatList
              data={friendRequests}
              renderItem={renderFriendRequest}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Sent Requests */}
        {sentRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Sent Requests ({sentRequests.length})
            </Text>
            <FlatList
              data={sentRequests}
              renderItem={renderSentRequest}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Friends List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Friends ({friends.length})</Text>

          {friends.length > 0 ? (
            <FlatList
              data={friends}
              renderItem={renderFriendCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#6b7280" />
              <Text style={styles.emptyTitle}>No Friends Yet</Text>
              <Text style={styles.emptySubtitle}>
                Add friends to start hanging out together!
              </Text>
            </View>
          )}
        </View>

        {/* Add Friend Modal */}
        <Modal
          visible={showAddFriendModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Friend</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddFriendModal(false);
                  setSearchEmail("");
                  setSearchResult(null);
                }}
              >
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter friend's email"
                value={searchEmail}
                onChangeText={setSearchEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearchUser}
                disabled={searching}
              >
                <Text style={styles.searchButtonText}>
                  {searching ? "Searching..." : "Search User"}
                </Text>
              </TouchableOpacity>

              {searchResult && (
                <View style={styles.searchResultCard}>
                  <View style={styles.searchResultInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {searchResult.userName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.searchResultDetails}>
                      <Text style={styles.searchResultName}>
                        {searchResult.userName}
                      </Text>
                      <Text style={styles.searchResultEmail}>
                        {searchResult.email}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.sendRequestButton}
                    onPress={() => handleSendFriendRequest(searchResult.id)}
                  >
                    <Text style={styles.sendRequestButtonText}>
                      Send Request
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </SafeAreaView>
        </Modal>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
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
  friendCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  friendEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#6b7280",
  },
  friendActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hangoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  hangoutButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
  },
  requestCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  requestDetails: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  requestEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  requestTime: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "500",
  },
  requestActions: {
    flexDirection: "row",
    gap: 8,
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    flex: 1,
  },
  acceptButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  rejectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    flex: 1,
  },
  rejectButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  modalContent: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  searchButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  searchResultCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
  },
  searchResultInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  searchResultDetails: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  searchResultEmail: {
    fontSize: 14,
    color: "#6b7280",
  },
  sendRequestButton: {
    backgroundColor: "#10b981",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  sendRequestButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  sentRequestCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sentRequestStatus: {
    alignItems: "flex-end",
  },
  pendingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  pendingText: {
    color: "#d97706",
    fontWeight: "600",
    fontSize: 12,
  },
});
