import React from "react";
import { View, StyleSheet } from "react-native";
import { TransportButtonConfig } from "../../types/control";
import { TransportButton } from "../controls/TransportButton";
import { useMidiStore } from "../../stores/midiStore";
import { Colors, Spacing } from "../../constants/theme";

interface Props {
  transport: TransportButtonConfig[];
}

export function TransportBar({ transport }: Props) {
  const sendTransport = useMidiStore((state) => state.sendTransport);

  return (
    <View style={styles.container}>
      {transport.map((btn) => (
        <TransportButton
          key={btn.action}
          action={btn.action}
          label={btn.label}
          onPress={() => sendTransport(btn.action, btn.cc, btn.channel)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
