import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSceneStore } from "../../src/stores/sceneStore";
import { CcEditModal } from "../../src/components/ui/CcEditModal";
import { Scene } from "../../src/types/scene";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from "../../src/constants/theme";

export default function ScenesScreen() {
  const insets = useSafeAreaInsets();
  const {
    scenes,
    activeSceneId,
    setActiveScene,
    addScene,
    renameScene,
    deleteScene,
    updateSceneControl,
  } = useSceneStore();

  const [newSceneModal, setNewSceneModal] = useState(false);
  const [newSceneName, setNewSceneName] = useState("");
  const [renameModal, setRenameModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Scene | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [ccEditScene, setCcEditScene] = useState<Scene | null>(null);

  const handleAddScene = () => {
    const name = newSceneName.trim();
    if (!name) return;
    addScene(name);
    setNewSceneName("");
    setNewSceneModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (scenes.length <= 1) return;
    Alert.alert("Delete Scene", `Remove "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteScene(id) },
    ]);
  };

  const handleOpenRename = (scene: Scene) => {
    setRenameTarget(scene);
    setRenameDraft(scene.name);
    setRenameModal(true);
  };

  const handleCommitRename = () => {
    const name = renameDraft.trim();
    if (renameTarget && name) renameScene(renameTarget.id, name);
    setRenameModal(false);
    setRenameTarget(null);
  };

  const handleSceneMenu = (scene: Scene) => {
    Alert.alert(scene.name, null as unknown as string, [
      {
        text: "Edit CC Values",
        onPress: () => setCcEditScene(scene),
      },
      {
        text: "Rename",
        onPress: () => handleOpenRename(scene),
      },
      {
        text: scenes.length > 1 ? "Delete" : "Can't delete last scene",
        style: "destructive",
        onPress: () => scenes.length > 1 && handleDelete(scene.id, scene.name),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.titleBar}>
        <Text style={styles.screenTitle}>SCENES</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setNewSceneModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.addBtnText}>+ NEW</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {scenes.map((scene, index) => {
          const active = scene.id === activeSceneId;
          return (
            <TouchableOpacity
              key={scene.id}
              style={[styles.sceneRow, active && styles.sceneRowActive]}
              onPress={() => setActiveScene(scene.id)}
              onLongPress={() => handleSceneMenu(scene)}
              activeOpacity={0.7}
            >
              <View style={styles.sceneLeft}>
                <Text style={styles.sceneIndex}>
                  {String(index + 1).padStart(2, "0")}
                </Text>
                <View>
                  <Text
                    style={[styles.sceneName, active && styles.sceneNameActive]}
                  >
                    {scene.name}
                  </Text>
                  <Text style={styles.sceneMeta}>
                    Faders CC {scene.faders[0]?.cc}–
                    {scene.faders[scene.faders.length - 1]?.cc}
                    {"  "}Knobs CC {scene.knobs[0]?.cc}–
                    {scene.knobs[scene.knobs.length - 1]?.cc}
                  </Text>
                </View>
              </View>
              <View style={styles.sceneRight}>
                {active && (
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>ACTIVE</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.menuBtn}
                  onPress={() => handleSceneMenu(scene)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.menuBtnText}>•••</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.hint}>
        Long press or ••• to edit / rename / delete
      </Text>

      {/* New Scene Modal */}
      <Modal
        visible={newSceneModal}
        transparent
        animationType="fade"
        onRequestClose={() => setNewSceneModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>NEW SCENE</Text>
            <TextInput
              style={styles.modalInput}
              value={newSceneName}
              onChangeText={setNewSceneName}
              placeholder="Scene name"
              placeholderTextColor={Colors.textDim}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAddScene}
              maxLength={32}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => {
                  setNewSceneModal(false);
                  setNewSceneName("");
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnCancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={handleAddScene}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnConfirmText}>CREATE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rename Modal */}
      <Modal
        visible={renameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>RENAME SCENE</Text>
            <TextInput
              style={styles.modalInput}
              value={renameDraft}
              onChangeText={setRenameDraft}
              placeholder="Scene name"
              placeholderTextColor={Colors.textDim}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCommitRename}
              maxLength={32}
              selectTextOnFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => setRenameModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnCancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnConfirm]}
                onPress={handleCommitRename}
                activeOpacity={0.7}
              >
                <Text style={styles.modalBtnConfirmText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CC Edit Modal */}
      {ccEditScene && (
        <CcEditModal
          visible={!!ccEditScene}
          scene={ccEditScene}
          onUpdate={(controlId, cc) =>
            updateSceneControl(ccEditScene.id, controlId, cc)
          }
          onClose={() => setCcEditScene(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  titleBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  addBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  addBtnText: {
    ...Typography.label,
    fontSize: 9,
    color: Colors.accent,
  },
  list: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  sceneRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  sceneRowActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentGlow,
  },
  sceneLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  sceneIndex: {
    color: Colors.textDim,
    fontSize: 11,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    fontWeight: "600",
  },
  sceneName: {
    ...Typography.label,
    color: Colors.textSecondary,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  sceneNameActive: {
    color: Colors.text,
  },
  sceneMeta: {
    color: Colors.textDim,
    fontSize: 9,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  sceneRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  activePill: {
    backgroundColor: Colors.accentGlow,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  activePillText: {
    ...Typography.label,
    fontSize: 7,
    color: Colors.accent,
  },
  menuBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  menuBtnText: {
    color: Colors.textSecondary,
    fontSize: 12,
    letterSpacing: 1,
  },
  hint: {
    ...Typography.value,
    fontSize: 9,
    color: Colors.textDim,
    textAlign: "center",
    paddingVertical: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.82)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  modalTitle: {
    ...Typography.label,
    color: Colors.accent,
    fontSize: 10,
    marginBottom: Spacing.md,
  },
  modalInput: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderHighlight,
    color: Colors.text,
    fontSize: 14,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    justifyContent: "flex-end",
  },
  modalBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalBtnConfirm: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentGlow,
  },
  modalBtnCancelText: {
    ...Typography.label,
    fontSize: 8,
    color: Colors.textSecondary,
  },
  modalBtnConfirmText: {
    ...Typography.label,
    fontSize: 8,
    color: Colors.accent,
  },
});
