import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import React from "react";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors,useColorScheme } from "@/src";


export default function TabLayout() {
  const colorScheme = useColorScheme();


  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      headerStyle: {backgroundColor: "#25292e"},
      headerShadowVisible: false,
      headerTintColor: '#fff',
      tabBarStyle: {backgroundColor: '#25292e'},
     }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "About",
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              name={
                focused ? "information-circle" : "information-circle-outline"
              }
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              name={
                focused ? "information-circle" : "information-circle-outline"
              }
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
