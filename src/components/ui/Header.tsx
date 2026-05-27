import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Typography, Spacing } from "../../constants/theme";
import { ConnectionStatus } from "./ConnectionStatus";
import { ConnectionStatus as TConnectionStatus } from "../../services/websocket";

interface Props {
  connectionStatus: TConnectionStatus;
  url?: string;
  right?: React.ReactNode;
}

export function Header({ connectionStatus, url, right }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.left}>
        <Text style={styles.title}>PULSECONTROL</Text>
      </View>
      <View style={styles.right}>
        {right}
        <ConnectionStatus status={connectionStatus} url={url} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  left: {
    flex: 1,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  title: {
    ...Typography.title,
    color: Colors.text,
    fontSize: 12,
  },
});
