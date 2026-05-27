import React from "react";
import { View, StyleSheet } from "react-native";
import { ControlConfig } from "../../types/control";
import { Knob } from "../controls/Knob";
import { useMidiControl } from "../../hooks/useMidi";
import { Colors, Spacing } from "../../constants/theme";

interface KnobItemProps {
  config: ControlConfig;
  showValue: boolean;
}

function KnobItem({ config, showValue }: KnobItemProps) {
  const { value, send } = useMidiControl(
    config.id,
    config.cc,
    config.defaultValue,
  );
  return (
    <Knob
      controlId={config.id}
      label={config.label}
      value={value}
      onValueChange={send}
      showValue={showValue}
    />
  );
}

interface Props {
  knobs: ControlConfig[];
  showValues: boolean;
}

export function KnobBank({ knobs, showValues }: Props) {
  return (
    <View style={styles.container}>
      {knobs.map((knob) => (
        <KnobItem key={knob.id} config={knob} showValue={showValues} />
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
});
