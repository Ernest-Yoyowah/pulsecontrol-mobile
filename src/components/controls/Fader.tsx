import React, { useCallback, useEffect } from "react";
import { StyleSheet, Text, View, LayoutChangeEvent } from "react-native";
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

const THUMB_HEIGHT = 36;

interface Props {
  controlId: string;
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  showValue?: boolean;
  accentColor?: string;
}

export function Fader({
  controlId: _controlId,
  label,
  value,
  onValueChange,
  showValue = true,
  accentColor = Colors.accent,
}: Props) {
  const hapticEnabled = useSettingsStore((s) => s.hapticFeedback);
  const trackHeight = useSharedValue(0);
  const thumbY = useSharedValue(0);
  const isActive = useSharedValue(false);

  const calcThumbY = (val: number, height: number): number => {
    "worklet";
    return (1 - val / 127) * Math.max(0, height - THUMB_HEIGHT);
  };

  useEffect(() => {
    if (trackHeight.value > 0) {
      thumbY.value = withTiming(calcThumbY(value, trackHeight.value), {
        duration: 60,
      });
    }
  }, [value]);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const h = e.nativeEvent.layout.height;
      trackHeight.value = h;
      thumbY.value = calcThumbY(value, h);
    },
    [value],
  );

  const handleChange = useCallback(
    (val: number) => onValueChange(val),
    [onValueChange],
  );

  const haptic = useCallback(() => {
    if (hapticEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [hapticEnabled]);

  const gesture = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      isActive.value = true;
      runOnJS(haptic)();
      const maxY = Math.max(0, trackHeight.value - THUMB_HEIGHT);
      const snapped = Math.max(0, Math.min(maxY, e.y - THUMB_HEIGHT / 2));
      thumbY.value = snapped;
      runOnJS(handleChange)(
        Math.round(127 * (1 - snapped / Math.max(1, maxY))),
      );
    })
    .onChange((e) => {
      const maxY = Math.max(0, trackHeight.value - THUMB_HEIGHT);
      const newY = Math.max(0, Math.min(maxY, thumbY.value + e.changeY));
      thumbY.value = newY;
      runOnJS(handleChange)(Math.round(127 * (1 - newY / Math.max(1, maxY))));
    })
    .onEnd(() => {
      isActive.value = false;
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: thumbY.value }],
    borderColor: isActive.value ? accentColor : Colors.borderHighlight,
    shadowColor: accentColor,
    shadowOpacity: isActive.value ? 0.55 : 0,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: isActive.value ? 8 : 0,
  }));

  const fillStyle = useAnimatedStyle(() => {
    const maxY = Math.max(1, trackHeight.value - THUMB_HEIGHT);
    return {
      height: Math.max(0, maxY - thumbY.value + THUMB_HEIGHT),
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>

      <GestureDetector gesture={gesture}>
        <View style={styles.trackWrapper} onLayout={onLayout}>
          <View style={styles.track}>
            <Animated.View
              style={[styles.fill, fillStyle, { backgroundColor: accentColor }]}
            />
          </View>
          <Animated.View style={[styles.thumb, thumbStyle]}>
            <View style={styles.gripLines}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={styles.gripLine} />
              ))}
            </View>
          </Animated.View>
        </View>
      </GestureDetector>

      {showValue ? <Text style={styles.value}>{value}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 5,
  },
  label: {
    ...Typography.label,
    fontSize: 7,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  trackWrapper: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  track: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: Colors.faderTrack,
    borderRadius: BorderRadius.round,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  fill: {
    width: "100%",
    borderRadius: BorderRadius.round,
    opacity: 0.7,
  },
  thumb: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: THUMB_HEIGHT,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gripLines: {
    gap: 4,
    alignItems: "center",
  },
  gripLine: {
    width: 16,
    height: 1,
    backgroundColor: Colors.borderHighlight,
    borderRadius: BorderRadius.round,
  },
  value: {
    ...Typography.value,
    fontSize: 9,
    color: Colors.textSecondary,
  },
});
