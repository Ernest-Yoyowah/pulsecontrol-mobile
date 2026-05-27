import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Vibration,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useMidiStore } from "../../src/stores/midiStore";
import { useSceneStore } from "../../src/stores/sceneStore";
import { useSettingsStore } from "../../src/stores/settingsStore";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from "../../src/constants/theme";

// ─── Default pad layout ───────────────────────────────────────────
// Transport row: PLAY / STOP / REC (match defaults.ts)
// Pad grid: 3 rows × 4 cols — CC 36–47 (standard drum-pad range)
const TRANSPORT = [
  {
    id: "tp-play",
    label: "PLAY",
    cc: 118,
    color: Colors.play,
    glow: Colors.playGlow,
  },
  {
    id: "tp-stop",
    label: "STOP",
    cc: 117,
    color: Colors.stop,
    glow: Colors.stopGlow,
  },
  {
    id: "tp-rec",
    label: "REC",
    cc: 119,
    color: Colors.record,
    glow: Colors.recordGlow,
  },
] as const;

const PADS = Array.from({ length: 12 }, (_, i) => ({
  id: `pad-${i}`,
  label: `PAD ${i + 1}`,
  cc: 36 + i,
}));

// ─── Sub-components ───────────────────────────────────────────────

interface TransportBtnProps {
  label: string;
  cc: number;
  color: string;
  glow: string;
  channel: number;
  onHaptic: () => void;
}

function TransportBtn({
  label,
  cc,
  color,
  glow,
  channel,
  onHaptic,
}: TransportBtnProps) {
  const { setValue } = useMidiStore();
  const [active, setActive] = useState(false);

  const handlePress = useCallback(() => {
    onHaptic();
    setActive(true);
    setValue(`transport-${cc}`, cc, 127, channel);
    setTimeout(() => setActive(false), 120);
  }, [cc, channel, onHaptic, setValue]);

  return (
    <TouchableOpacity
      style={[
        styles.transportBtn,
        active && { backgroundColor: glow, borderColor: color },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.transportDot, { backgroundColor: color }]} />
      <Text style={[styles.transportLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

interface PadProps {
  label: string;
  cc: number;
  channel: number;
  onHaptic: () => void;
}

function Pad({ label, cc, channel, onHaptic }: PadProps) {
  const { setValue } = useMidiStore();
  const [pressed, setPressed] = useState(false);

  const handlePressIn = useCallback(() => {
    onHaptic();
    setPressed(true);
    setValue(`pad-${cc}`, cc, 127, channel);
  }, [cc, channel, onHaptic, setValue]);

  const handlePressOut = useCallback(() => {
    setPressed(false);
    setValue(`pad-${cc}`, cc, 0, channel);
  }, [cc, channel, setValue]);

  return (
    <TouchableOpacity
      style={[styles.pad, pressed && styles.padActive]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Text style={[styles.padLabel, pressed && styles.padLabelActive]}>
        {label}
      </Text>
      <Text style={[styles.padCc, pressed && styles.padCcActive]}>CC {cc}</Text>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────

export default function PadsScreen() {
  const insets = useSafeAreaInsets();
  const { midiChannel, hapticFeedback } = useSettingsStore();
  const activeScene = useSceneStore((s) => s.getActiveScene());

  const triggerHaptic = useCallback(() => {
    if (!hapticFeedback) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [hapticFeedback]);

  return (
    <View
      style={[
        styles.root,
        {
          paddingLeft: insets.left + Spacing.md,
          paddingRight: insets.right + Spacing.md,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.brandLabel}>PADS</Text>
        {activeScene && (
          <Text style={styles.sceneLabel}>
            {activeScene.name.toUpperCase()}
          </Text>
        )}
        <Text style={styles.channelLabel}>CH {midiChannel}</Text>
      </View>

      <View style={styles.body}>
        {/* ── Transport column ── */}
        <View style={styles.transportCol}>
          <Text style={styles.colHeader}>TRANSPORT</Text>
          {TRANSPORT.map((t) => (
            <TransportBtn
              key={t.id}
              label={t.label}
              cc={t.cc}
              color={t.color}
              glow={t.glow}
              channel={midiChannel}
              onHaptic={triggerHaptic}
            />
          ))}
        </View>

        {/* ── Pad grid ── */}
        <View style={styles.padArea}>
          <Text style={styles.colHeader}>PADS · CC 36–47</Text>
          <View style={styles.padGrid}>
            {PADS.map((pad) => (
              <Pad
                key={pad.id}
                label={pad.label}
                cc={pad.cc}
                channel={midiChannel}
                onHaptic={triggerHaptic}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  brandLabel: {
    ...Typography.label,
    color: Colors.accent,
    fontSize: 9,
    letterSpacing: 3,
  },
  sceneLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    fontSize: 8,
  },
  channelLabel: {
    ...Typography.label,
    color: Colors.textDim,
    fontSize: 8,
  },
  body: {
    flex: 1,
    flexDirection: "row",
    gap: Spacing.md,
    paddingTop: Spacing.sm,
  },
  colHeader: {
    ...Typography.label,
    color: Colors.textDim,
    fontSize: 7,
    marginBottom: Spacing.xs,
    letterSpacing: 2,
  },

  // Transport column
  transportCol: {
    width: 90,
    gap: Spacing.sm,
  },
  transportBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  transportDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  transportLabel: {
    ...Typography.label,
    fontSize: 8,
    letterSpacing: 2,
  },

  // Pad grid
  padArea: {
    flex: 1,
  },
  padGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  pad: {
    // 4 columns with gaps: (flex - 3 * gap) / 4
    width: "23.5%",
    aspectRatio: undefined,
    flex: undefined,
    flexGrow: 1,
    flexBasis: "23%",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    minHeight: 44,
  },
  padActive: {
    backgroundColor: Colors.accentGlow,
    borderColor: Colors.accent,
  },
  padLabel: {
    ...Typography.label,
    fontSize: 8,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
  },
  padLabelActive: {
    color: Colors.accent,
  },
  padCc: {
    fontSize: 8,
    color: Colors.textDim,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  padCcActive: {
    color: Colors.accentDim,
  },
});
