import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Scene } from "../../types/scene";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from "../../constants/theme";

interface Props {
  visible: boolean;
  scene: Scene;
  onUpdate: (controlId: string, cc: number) => void;
  onClose: () => void;
}

interface CcRowProps {
  controlId: string;
  label: string;
  cc: number;
  onCommit: (controlId: string, cc: number) => void;
}

function CcRow({ controlId, label, cc, onCommit }: CcRowProps) {
  const [draft, setDraft] = useState(String(cc));

  const commit = () => {
    const parsed = parseInt(draft, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 127) {
      onCommit(controlId, parsed);
    } else {
      setDraft(String(cc));
    }
  };

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <TextInput
        style={styles.ccInput}
        value={draft}
        onChangeText={setDraft}
        onBlur={commit}
        onSubmitEditing={commit}
        keyboardType="number-pad"
        maxLength={3}
        returnKeyType="done"
        selectTextOnFocus
      />
    </View>
  );
}

export function CcEditModal({ visible, scene, onUpdate, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>
              EDIT CC — {scene.name.toUpperCase()}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.closeBtnText}>DONE</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.sectionLabel}>FADERS</Text>
            {scene.faders.map((fader) => (
              <CcRow
                key={fader.id}
                controlId={fader.id}
                label={fader.label}
                cc={fader.cc}
                onCommit={onUpdate}
              />
            ))}

            <Text style={[styles.sectionLabel, styles.sectionLabelKnobs]}>
              KNOBS
            </Text>
            {scene.knobs.map((knob) => (
              <CcRow
                key={knob.id}
                controlId={knob.id}
                label={knob.label}
                cc={knob.cc}
                onCommit={onUpdate}
              />
            ))}

            <Text style={styles.hint}>Values 0 – 127 · Tap field to edit</Text>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.82)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    maxHeight: "85%",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.label,
    color: Colors.accent,
    fontSize: 10,
  },
  closeBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  closeBtnText: {
    ...Typography.label,
    color: Colors.accent,
    fontSize: 8,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textDim,
    fontSize: 8,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  sectionLabelKnobs: {
    marginTop: Spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowLabel: {
    ...Typography.label,
    color: Colors.text,
    fontSize: 9,
    flex: 1,
  },
  ccInput: {
    width: 52,
    height: 30,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderHighlight,
    color: Colors.accent,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
  },
  hint: {
    ...Typography.value,
    fontSize: 8,
    color: Colors.textDim,
    textAlign: "center",
    marginTop: Spacing.lg,
  },
});
