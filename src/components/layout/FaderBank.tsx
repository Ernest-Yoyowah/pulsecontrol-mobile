import React from "react";
import { View, StyleSheet } from "react-native";
import { ControlConfig } from "../../types/control";
import { Fader } from "../controls/Fader";
import { useMidiControl } from "../../hooks/useMidi";
import { Colors, Spacing } from "../../constants/theme";

interface FaderItemProps {
  config: ControlConfig;
  showValue: boolean;
}

function FaderItem({ config, showValue }: FaderItemProps) {
  const { value, send } = useMidiControl(
    config.id,
    config.cc,
    config.defaultValue,
  );
  return (
    <Fader
      controlId={config.id}
      label={config.label}
      value={value}
      onValueChange={send}
      showValue={showValue}
    />
  );
}

interface Props {
  faders: ControlConfig[];
  showValues: boolean;
}

export function FaderBank({ faders, showValues }: Props) {
  return (
    <View style={styles.container}>
      {faders.map((fader) => (
        <FaderItem key={fader.id} config={fader} showValue={showValues} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
});
