import React from "react";
import { Tabs } from "expo-router";
import { StyleSheet, View, Platform } from "react-native";
import { Colors, BorderRadius } from "../../src/constants/theme";

function TabIcon({ focused }: { focused: boolean; color?: unknown }) {
  return (
    <View
      style={[
        styles.dot,
        focused && {
          backgroundColor: Colors.accent,
          borderColor: Colors.accent,
        },
      ]}
    />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="controller"
        options={{
          title: "Controller",
          tabBarLabel: "CTRL",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pads"
        options={{
          title: "Pads",
          tabBarLabel: "PADS",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scenes"
        options={{
          title: "Scenes",
          tabBarLabel: "SCENES",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: "SET",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "About",
          tabBarLabel: "ABOUT",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: Platform.OS === "ios" ? 38 : 44,
    paddingBottom: Platform.OS === "ios" ? 4 : 6,
    paddingTop: 4,
  },
  tabLabel: {
    fontSize: 7,
    letterSpacing: 1.5,
    fontWeight: "600",
  },
  tabItem: {
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: BorderRadius.round,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.borderHighlight,
  },
});
