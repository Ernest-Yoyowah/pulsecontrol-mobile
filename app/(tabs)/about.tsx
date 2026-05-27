import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from "../../src/constants/theme";

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.titleBar}>
        <Text style={styles.screenTitle}>ABOUT</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.logoMark}>
            <View style={styles.logoBars}>
              {[0.4, 0.75, 1, 0.6, 0.85, 0.5, 0.9, 0.65].map((h, i) => (
                <View key={i} style={[styles.logoBar, { height: h * 36 }]} />
              ))}
            </View>
          </View>
          <Text style={styles.appName}>PULSECONTROL</Text>
          <Text style={styles.appTagline}>
            Professional Wireless MIDI Surface
          </Text>
          <Text style={styles.version}>v{version}</Text>
        </View>

        <Section title="MADE BY">
          <View style={styles.studioRow}>
            <Text style={styles.studioName}>Ernest Keyz Studios</Text>
            <Text style={styles.studioDesc}>
              Tools for the modern performing musician
            </Text>
          </View>
        </Section>

        <Section title="APP INFO">
          <InfoRow label="App" value="PulseControl Mobile" />
          <View style={styles.divider} />
          <InfoRow label="Version" value={version} />
          <View style={styles.divider} />
          <InfoRow label="Platform" value="iOS / Android" />
          <View style={styles.divider} />
          <InfoRow label="Bridge Port" value="8765" />
        </Section>

        <Section title="PROTOCOL">
          <Text style={styles.protoNote}>
            PulseControl sends JSON messages over WebSocket to PulseControl
            Bridge running on your desktop.
          </Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              {`{ "type": "midi_cc",\n  "cc": 1,\n  "value": 74,\n  "channel": 1 }`}
            </Text>
          </View>
          <View style={styles.divider} />
          <Text style={styles.protoNote}>
            Supported DAWs via PulseControl Bridge:{"\n"}
            Ableton Live · Logic Pro · MainStage{"\n"}
            Reaper · FL Studio
          </Text>
        </Section>

        <Section title="SETUP GUIDE">
          <Text style={styles.protoNote}>
            1. Install PulseControl Bridge on your Mac{"\n"}
            2. Launch Bridge — it opens a WebSocket server on port 8765{"\n"}
            3. Scan the QR code in Settings → Connect{"\n"}
            4. Assign MIDI CC to your DAW controls{"\n"}
            5. Play
          </Text>
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Ernest Keyz Studios
          </Text>
          <Text style={styles.footerText}>All rights reserved</Text>
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
    ...Typography.label,
    color: Colors.accent,
    fontSize: 10,
    letterSpacing: 3,
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  hero: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 10,
    marginBottom: Spacing.md,
  },
  logoBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
  },
  logoBar: {
    width: 4,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.round,
    opacity: 0.9,
  },
  appName: {
    ...Typography.label,
    color: Colors.text,
    fontSize: 16,
    letterSpacing: 4,
    marginBottom: 4,
  },
  appTagline: {
    ...Typography.value,
    color: Colors.textSecondary,
    fontSize: 11,
    marginBottom: 6,
  },
  version: {
    ...Typography.label,
    color: Colors.accentDim,
    fontSize: 8,
    letterSpacing: 2,
  },
  section: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    ...Typography.label,
    color: Colors.textDim,
    fontSize: 8,
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    fontSize: 9,
  },
  infoValue: {
    ...Typography.value,
    color: Colors.text,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  studioRow: {
    paddingVertical: Spacing.sm,
  },
  studioName: {
    ...Typography.label,
    color: Colors.accent,
    fontSize: 13,
    letterSpacing: 1,
    marginBottom: 4,
  },
  studioDesc: {
    ...Typography.value,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  protoNote: {
    ...Typography.value,
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 18,
    paddingVertical: Spacing.sm,
  },
  codeBlock: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: Colors.accent,
  },
  codeText: {
    fontFamily: "Courier New",
    color: Colors.accent,
    fontSize: 11,
    lineHeight: 18,
  },
  footer: {
    alignItems: "center",
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  footerText: {
    ...Typography.value,
    color: Colors.textDim,
    fontSize: 10,
  },
});
