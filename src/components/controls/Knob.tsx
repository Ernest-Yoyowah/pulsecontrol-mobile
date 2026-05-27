import React, { useCallback, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Colors, Typography, BorderRadius } from "../../constants/theme";
import { useSettingsStore } from "../../stores/settingsStore";

const KNOB_SIZE = 54;
const PIP_SIZE = 5;
const MIN_DEG = -135;
const MAX_DEG = 135;
const RANGE_DEG = MAX_DEG - MIN_DEG;
const SENSITIVITY = 0.6;

interface Props {
  controlId: string;
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  showValue?: boolean;
  accentColor?: string;
}

export function Knob({
  controlId: _controlId,
  label,
  value,
  onValueChange,
  showValue = true,
  accentColor = Colors.accent,
}: Props) {
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);
  const rotation = useSharedValue(MIN_DEG + (value / 127) * RANGE_DEG);
  const internalValue = useSharedValue(value);
  const isActive = useSharedValue(false);

  useEffect(() => {
    rotation.value = withTiming(MIN_DEG + (value / 127) * RANGE_DEG, {
      duration: 60,
    });
    internalValue.value = value;
  }, [value]);

  const handleValueChange = useCallback(
    (val: number) => {
      onValueChange(val);
    },
    [onValueChange],
  );

  const triggerHaptic = useCallback(() => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [hapticEnabled]);

  const gesture = Gesture.Pan()
    .minDistance(0)
    .onBegin(() => {
      isActive.value = true;
      runOnJS(triggerHaptic)();
    })
    .onChange((e) => {
      const delta = -e.changeY * SENSITIVITY;
      const newVal = Math.max(0, Math.min(127, internalValue.value + delta));
      internalValue.value = newVal;
      rotation.value = MIN_DEG + (newVal / 127) * RANGE_DEG;
      const rounded = Math.round(newVal);
      runOnJS(handleValueChange)(rounded);
    })
    .onEnd(() => {
      isActive.value = false;
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowColor: accentColor,
    shadowOpacity: isActive.value ? 0.7 : 0,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: isActive.value ? 10 : 0,
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.knobOuter, glowStyle]}>
          <Animated.View style={[styles.knobInner, knobStyle]}>
            <View style={[styles.pip, { backgroundColor: accentColor }]} />
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>

      {showValue ? <Text style={styles.value}>{Math.round(value)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 5,
  },
  knobOuter: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: Colors.knobTrack,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  knobInner: {
    width: "100%",
    height: "100%",
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 4,
    borderWidth: 1,
    borderColor: Colors.borderHighlight,
  },
  pip: {
    width: PIP_SIZE,
    height: PIP_SIZE,
    borderRadius: BorderRadius.round,
  },
  label: {
    ...Typography.label,
    fontSize: 7,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  value: {
    ...Typography.value,
    fontSize: 9,
    color: Colors.textSecondary,
    fontVariant: ["tabular-nums"],
  },
});
