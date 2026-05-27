import React, { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  Colors,
  Typography,
  BorderRadius,
  Spacing,
} from "../../constants/theme";
import { TransportAction } from "../../types/control";

const ACTION_COLOR: Record<TransportAction, string> = {
  play: Colors.play,
  stop: Colors.stop,
  record: Colors.record,
};

const ACTION_GLOW: Record<TransportAction, string> = {
  play: Colors.playGlow,
  stop: Colors.stopGlow,
  record: Colors.recordGlow,
};

interface Props {
  action: TransportAction;
  label: string;
  onPress: () => void;
}

export function TransportButton({ action, label, onPress }: Props) {
  const pressed = useSharedValue(false);
  const accentColor = ACTION_COLOR[action];
  const glowColor = ACTION_GLOW[action];

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress]);

  const gesture = Gesture.Tap()
    .onBegin(() => {
      pressed.value = true;
    })
    .onFinalize(() => {
      pressed.value = false;
      runOnJS(handlePress)();
    });

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: pressed.value
      ? withTiming(glowColor, { duration: 80 })
      : withTiming(Colors.surface, { duration: 200 }),
    borderColor: pressed.value
      ? withTiming(accentColor, { duration: 80 })
      : withTiming(Colors.border, { duration: 200 }),
    transform: [
      {
        scale: pressed.value
          ? withTiming(0.94, { duration: 80 })
          : withTiming(1, { duration: 150 }),
      },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.button, containerStyle]}>
        <View style={[styles.indicator, { backgroundColor: accentColor }]} />
        <Text style={[styles.label, { color: accentColor }]}>{label}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.xs,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.round,
    opacity: 0.9,
  },
  label: {
    ...Typography.label,
    fontSize: 10,
    letterSpacing: 2,
  },
});
