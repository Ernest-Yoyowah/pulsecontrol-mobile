import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { useSceneStore } from "../src/stores/sceneStore";
import { useSettingsStore } from "../src/stores/settingsStore";
import { Colors } from "../src/constants/theme";

export default function RootLayout() {
  const loadScenes = useSceneStore((state) => state.loadFromStorage);
  const loadSettings = useSettingsStore((state) => state.loadFromStorage);

  useEffect(() => {
    loadScenes();
    loadSettings();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: "fade",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="connection" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
