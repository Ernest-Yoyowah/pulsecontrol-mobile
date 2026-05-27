import React from "react";
import {
  View,
  Text,
  Switch,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useSettingsStore } from "../../src/stores/settingsStore";
import { useConnectionStore } from "../../src/stores/connectionStore";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from "../../src/constants/theme";

interface RowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function SettingRow({ label, description, children }: RowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description ? <Text style={styles.rowDesc}>{description}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

const MIDI_CHANNELS = Array.from({ length: 16 }, (_, i) => i + 1);

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const {
    hapticFeedback,
    showValues,
    midiChannel,
    stageDimMode,
    autoReconnect,
    setHapticFeedback,
    setShowValues,
    setMidiChannel,
    setStageDimMode,
    setAutoReconnect,
  } = useSettingsStore();

  const { status, url } = useConnectionStore();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.titleBar}>
        <Text style={styles.screenTitle}>SETTINGS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader title="CONNECTION" />
        <View style={styles.card}>
          <SettingRow label="HOST" description={url}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push("/connection")}
              activeOpacity={0.7}
            >
              <Text style={styles.editBtnText}>
                {status === "connected" ? "CHANGE" : "CONNECT"}
              </Text>
            </TouchableOpacity>
          </SettingRow>
          <View style={styles.divider} />
          <SettingRow
            label="AUTO RECONNECT"
            description="Reconnect on connection loss"
          >
            <Switch
              value={autoReconnect}
              onValueChange={setAutoReconnect}
              trackColor={{ false: Colors.surface, true: Colors.accentDim }}
              thumbColor={
                autoReconnect ? Colors.accent : Colors.borderHighlight
              }
            />
          </SettingRow>
        </View>

        <SectionHeader title="MIDI" />
        <View style={styles.card}>
          <SettingRow label="DEFAULT CHANNEL">
            <View style={styles.channelPicker}>
              <TouchableOpacity
                style={styles.channelBtn}
                onPress={() =>
                  midiChannel > 1 && setMidiChannel(midiChannel - 1)
                }
                activeOpacity={0.7}
              >
                <Text style={styles.channelBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.channelValue}>CH {midiChannel}</Text>
              <TouchableOpacity
                style={styles.channelBtn}
                onPress={() =>
                  midiChannel < 16 && setMidiChannel(midiChannel + 1)
                }
                activeOpacity={0.7}
              >
                <Text style={styles.channelBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </SettingRow>
        </View>

        <SectionHeader title="DISPLAY" />
        <View style={styles.card}>
          <SettingRow
            label="SHOW VALUES"
            description="Display MIDI values on controls"
          >
            <Switch
              value={showValues}
              onValueChange={setShowValues}
              trackColor={{ false: Colors.surface, true: Colors.accentDim }}
              thumbColor={showValues ? Colors.accent : Colors.borderHighlight}
            />
          </SettingRow>
          <View style={styles.divider} />
          <SettingRow
            label="STAGE DIM MODE"
            description="Reduce screen brightness on stage"
          >
            <Switch
              value={stageDimMode}
              onValueChange={setStageDimMode}
              trackColor={{ false: Colors.surface, true: Colors.accentDim }}
              thumbColor={stageDimMode ? Colors.accent : Colors.borderHighlight}
            />
          </SettingRow>
        </View>

        <SectionHeader title="INTERACTION" />
        <View style={styles.card}>
          <SettingRow
            label="HAPTIC FEEDBACK"
            description="Vibration on control touch"
          >
            <Switch
              value={hapticFeedback}
              onValueChange={setHapticFeedback}
              trackColor={{ false: Colors.surface, true: Colors.accentDim }}
              thumbColor={
                hapticFeedback ? Colors.accent : Colors.borderHighlight
              }
            />
          </SettingRow>
        </View>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>PULSECONTROL MOBILE</Text>
          <Text style={styles.versionNum}>v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  titleBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  screenTitle: {
    ...Typography.title,
    color: Colors.text,
    fontSize: 12,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.xs,
    paddingBottom: Spacing.xxl,
  },
  sectionHeader: {
    ...Typography.label,
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 52,
  },
  rowLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  rowLabel: {
    ...Typography.heading,
    fontSize: 11,
    color: Colors.text,
    letterSpacing: 1.5,
  },
  rowDesc: {
    ...Typography.value,
    fontSize: 9,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg,
  },
  channelPicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  channelBtn: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderHighlight,
    justifyContent: "center",
    alignItems: "center",
  },
  channelBtnText: {
    color: Colors.text,
    fontSize: 16,
    lineHeight: 18,
  },
  channelValue: {
    ...Typography.value,
    fontSize: 11,
    color: Colors.accent,
    minWidth: 44,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  editBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  editBtnText: {
    ...Typography.label,
    fontSize: 8,
    color: Colors.accent,
  },
  versionInfo: {
    alignItems: "center",
    marginTop: Spacing.xxl,
    gap: Spacing.xs,
  },
  versionText: {
    ...Typography.label,
    fontSize: 8,
    color: Colors.textDim,
  },
  versionNum: {
    ...Typography.value,
    fontSize: 9,
    color: Colors.textDim,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
});
