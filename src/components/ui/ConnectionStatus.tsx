import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from "../../constants/theme";
import { ConnectionStatus as TConnectionStatus } from "../../services/websocket";

interface Props {
  status: TConnectionStatus;
  url?: string;
}

const STATUS_LABEL: Record<TConnectionStatus, string> = {
  connected: "CONNECTED",
  disconnected: "OFFLINE",
  connecting: "CONNECTING",
  error: "ERROR",
};

const STATUS_COLOR: Record<TConnectionStatus, string> = {
  connected: Colors.connected,
  disconnected: Colors.disconnected,
  connecting: Colors.connecting,
  error: Colors.error,
};

export function ConnectionStatus({ status, url }: Props) {
  const color = STATUS_COLOR[status];
  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View>
        <Text style={[styles.label, { color }]}>{STATUS_LABEL[status]}</Text>
        {status === "connected" && url ? (
          <Text style={styles.url} numberOfLines={1}>
            {url}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.round,
  },
  label: {
    ...Typography.label,
    fontSize: 8,
  },
  url: {
    ...Typography.value,
    fontSize: 8,
    color: Colors.textSecondary,
    marginTop: 1,
  },
});
