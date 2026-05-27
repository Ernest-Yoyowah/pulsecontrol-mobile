import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from "../../constants/theme";
import { Scene } from "../../types/scene";

interface Props {
  scenes: Scene[];
  activeSceneId: string;
  onSelect: (id: string) => void;
}

export function SceneSelector({ scenes, activeSceneId, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {scenes.map((scene) => {
        const active = scene.id === activeSceneId;
        return (
          <TouchableOpacity
            key={scene.id}
            onPress={() => onSelect(scene.id)}
            style={[styles.chip, active && styles.chipActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {scene.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentGlow,
  },
  label: {
    ...Typography.label,
    fontSize: 9,
    color: Colors.textSecondary,
  },
  labelActive: {
    color: Colors.accent,
  },
});
