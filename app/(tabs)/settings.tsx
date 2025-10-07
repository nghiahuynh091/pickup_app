import {
  AntDesign,
  Entypo,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [wifiEnabled, setWifiEnabled] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      {/* header */}
      <View
        style={{
          backgroundColor: "#ffffff",
          paddingBottom: 8,
          paddingTop: 10,
        }}
      >
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            gap: 15,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              Alert.alert("Back");
            }}
          >
            <AntDesign name="arrowleft" size={24} color="black" />
          </TouchableOpacity>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 24,
              color: "black",
            }}
          >
            Settings
          </Text>
        </View>
      </View>
      {/* content */}
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
          paddingTop: 20,
          paddingHorizontal: 20,
        }}
      >
        <View>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 20,
              color: "#666",
              marginBottom: 10,
            }}
          >
            GENERAL
          </Text>
        </View>

        <View style={{ paddingTop: 20 }}>
          {/* Account */}
          <TouchableOpacity style={{ paddingVertical: 4 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 16,
                paddingHorizontal: 8,
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <MaterialCommunityIcons
                  name="account"
                  size={24}
                  color="black"
                />
                <Text style={{ fontSize: 18, color: "black" }}>Account</Text>
              </View>
              <Entypo name="chevron-right" size={24} color="black" />
            </View>
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity style={{ paddingVertical: 4 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 16,
                paddingHorizontal: 8,
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="black"
                />
                <Text style={{ fontSize: 18, color: "black" }}>
                  Notifications
                </Text>
              </View>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={notificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setNotificationsEnabled}
                value={notificationsEnabled}
              />
            </View>
          </TouchableOpacity>

          {/* Wifi */}
          <TouchableOpacity style={{ paddingVertical: 4 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 16,
                paddingHorizontal: 8,
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Ionicons name="wifi" size={24} color="black" />
                <Text style={{ fontSize: 18, color: "black" }}>Wifi</Text>
              </View>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={wifiEnabled ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setWifiEnabled}
                value={wifiEnabled}
              />
            </View>
          </TouchableOpacity>

          {/* Coupons */}
          <TouchableOpacity style={{ paddingVertical: 4 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 16,
                paddingHorizontal: 8,
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Ionicons name="gift" size={24} color="black" />
                <Text style={{ fontSize: 18, color: "black" }}>Coupons</Text>
              </View>
              <Entypo name="chevron-right" size={24} color="black" />
            </View>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity style={{ paddingVertical: 4 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 16,
                paddingHorizontal: 8,
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <MaterialIcons name="logout" size={24} color="black" />
                <Text style={{ fontSize: 18, color: "black" }}>Logout</Text>
              </View>
              <Entypo name="chevron-right" size={24} color="black" />
            </View>
          </TouchableOpacity>

          {/* Delete Account */}
          <TouchableOpacity style={{ paddingVertical: 4 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 16,
                paddingHorizontal: 8,
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <AntDesign name="delete" size={24} color="#ef4444" />
                <Text style={{ fontSize: 18, color: "#ef4444" }}>
                  Delete Account
                </Text>
              </View>
              <Entypo name="chevron-right" size={24} color="black" />
            </View>
          </TouchableOpacity>
        </View>

        {/* FEEDBACK Section */}
        <View style={{ paddingTop: 40 }}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 20,
              color: "#666",
              marginBottom: 10,
            }}
          >
            FEEDBACK
          </Text>
        </View>

        <View style={{ paddingTop: 20, paddingBottom: 40 }}>
          {/* Report a bug */}
          <TouchableOpacity style={{ paddingVertical: 4 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 16,
                paddingHorizontal: 8,
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <MaterialIcons name="report-problem" size={24} color="black" />
                <Text style={{ fontSize: 18, color: "black" }}>
                  Report a bug
                </Text>
              </View>
              <Entypo name="chevron-right" size={24} color="black" />
            </View>
          </TouchableOpacity>

          {/* Send feedback */}
          <TouchableOpacity style={{ paddingVertical: 4 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 16,
                paddingHorizontal: 8,
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <FontAwesome name="send" size={24} color="black" />
                <Text style={{ fontSize: 18, color: "black" }}>
                  Send feedback
                </Text>
              </View>
              <Entypo name="chevron-right" size={24} color="black" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
