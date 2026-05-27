import React from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSceneStore } from "../../src/stores/sceneStore";
import { useConnectionStore } from "../../src/stores/connectionStore";
import { useSettingsStore } from "../../src/stores/settingsStore";
import { useWebSocket } from "../../src/hooks/useWebSocket";
import { ConnectionStatus } from "../../src/components/ui/ConnectionStatus";
import { KnobBank } from "../../src/components/layout/KnobBank";
import { FaderBank } from "../../src/components/layout/FaderBank";
import { Colors, Typography, Spacing } from "../../src/constants/theme";

export default function ControllerScreen() {
  useWebSocket();

  const insets = useSafeAreaInsets();
  const { status, url } = useConnectionStore();
  const { scenes, activeSceneId, setActiveScene, getActiveScene } =
    useSceneStore();
  const { showValues, stageDimMode } = useSettingsStore();

  const activeScene = getActiveScene();

  if (!activeScene) return null;

  return (
    <View
      style={[
        styles.root,
        { paddingLeft: insets.left, paddingRight: insets.right },
      ]}
    >
      {/* Compact top bar: brand | scenes | status */}
      <View style={styles.topBar}>
        <Text style={styles.brand}>PULSE</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sceneChips}
          style={styles.sceneScroll}
        >
          {scenes.map((scene) => (
            <TouchableOpacity
              key={scene.id}
              onPress={() => setActiveScene(scene.id)}
              style={[
                styles.chip,
                scene.id === activeSceneId && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  scene.id === activeSceneId && styles.chipTextActive,
                ]}
              >
                {scene.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ConnectionStatus
          status={status}
          url={status === "connected" ? url : undefined}
        />
      </View>

      <KnobBank knobs={activeScene.knobs} showValues={showValues} />

      <FaderBank faders={activeScene.faders} showValues={showValues} />

      {stageDimMode && <View style={styles.dimOverlay} pointerEvents="none" />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  brand: {
    ...Typography.label,
    color: Colors.accent,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: "700",
  },
  sceneScroll: {
    flex: 1,
  },
  sceneChips: {
    flexDirection: "row",
    gap: Spacing.xs,
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    borderColor: Colors.accent,
    backgroundColor: `${Colors.accent}18`,
  },
  chipText: {
    ...Typography.label,
    fontSize: 9,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.accent,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.58)",
  },
});
