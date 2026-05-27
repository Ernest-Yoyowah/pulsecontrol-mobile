import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useConnectionStore } from "../src/stores/connectionStore";
import { useWebSocket } from "../src/hooks/useWebSocket";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from "../src/constants/theme";

const PRESETS = [
  { label: "Local", url: "ws://127.0.0.1:8765" },
  { label: "LAN", url: "ws://192.168.1.100:8765" },
];

export default function ConnectionScreen() {
  useWebSocket();
  const insets = useSafeAreaInsets();
  const { status, url, setUrl, connect, disconnect } = useConnectionStore();
  const [inputUrl, setInputUrl] = useState(url);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handleConnect = () => {
    const trimmed = inputUrl.trim();
    if (!trimmed) return;
    setUrl(trimmed);
    connect();
  };

  const handleGoToController = () => {
    router.replace("/(tabs)/controller");
  };

  const handleScanPress = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setScannerOpen(true);
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (data.startsWith("ws://") || data.startsWith("wss://")) {
      setInputUrl(data);
      setScannerOpen(false);
    }
  };

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>PULSECONTROL</Text>
          <Text style={styles.subtitle}>MIDI SURFACE</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>HOST ADDRESS</Text>
          <TextInput
            style={styles.input}
            value={inputUrl}
            onChangeText={setInputUrl}
            placeholder="ws://192.168.1.100:8765"
            placeholderTextColor={Colors.textDim}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="done"
          />

          <View style={styles.inputActions}>
            <View style={styles.presets}>
              {PRESETS.map((p) => (
                <TouchableOpacity
                  key={p.label}
                  style={styles.preset}
                  onPress={() => setInputUrl(p.url)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetLabel}>{p.label}</Text>
                  <Text style={styles.presetUrl}>{p.url}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.qrBtn}
              onPress={handleScanPress}
              activeOpacity={0.7}
            >
              <Text style={styles.qrBtnIcon}>◫</Text>
              <Text style={styles.qrBtnText}>SCAN QR</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isConnected
                  ? Colors.connected
                  : isConnecting
                    ? Colors.connecting
                    : status === "error"
                      ? Colors.error
                      : Colors.disconnected,
              },
            ]}
          />
          <Text style={styles.statusText}>
            {isConnected
              ? "CONNECTED"
              : isConnecting
                ? "CONNECTING..."
                : status === "error"
                  ? "CONNECTION ERROR"
                  : "DISCONNECTED"}
          </Text>
        </View>

        {isConnected ? (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={handleGoToController}
              activeOpacity={0.8}
            >
              <Text style={styles.btnPrimaryText}>OPEN CONTROLLER</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnSecondary]}
              onPress={disconnect}
              activeOpacity={0.8}
            >
              <Text style={styles.btnSecondaryText}>DISCONNECT</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.btn,
              styles.btnPrimary,
              isConnecting && styles.btnDisabled,
            ]}
            onPress={handleConnect}
            activeOpacity={0.8}
            disabled={isConnecting}
          >
            <Text style={styles.btnPrimaryText}>
              {isConnecting ? "CONNECTING..." : "CONNECT"}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={handleGoToController}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Continue offline</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* QR Scanner Modal */}
      <Modal
        visible={scannerOpen}
        animationType="slide"
        onRequestClose={() => setScannerOpen(false)}
      >
        <View style={styles.scannerRoot}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={handleBarcodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          />
          <View style={styles.scannerOverlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanHint}>
              Point at the QR code shown by PulseControl Bridge
            </Text>
            <TouchableOpacity
              style={styles.scanCancelBtn}
              onPress={() => setScannerOpen(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.scanCancelText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
    justifyContent: "center",
    gap: Spacing.xl,
  },
  header: {
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.label,
    color: Colors.text,
    fontSize: 22,
    letterSpacing: 6,
  },
  subtitle: {
    ...Typography.label,
    color: Colors.textSecondary,
    fontSize: 11,
    letterSpacing: 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderHighlight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: 13,
    letterSpacing: 0.5,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  inputActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "flex-start",
  },
  presets: {
    flex: 1,
    flexDirection: "row",
    gap: Spacing.sm,
  },
  preset: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    gap: 3,
  },
  presetLabel: {
    ...Typography.label,
    fontSize: 8,
    color: Colors.accent,
  },
  presetUrl: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  qrBtn: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.accent,
    padding: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    minWidth: 64,
  },
  qrBtnIcon: {
    fontSize: 18,
    color: Colors.accent,
  },
  qrBtnText: {
    ...Typography.label,
    fontSize: 7,
    color: Colors.accent,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...Typography.label,
    color: Colors.textSecondary,
    fontSize: 10,
    letterSpacing: 2,
  },
  actions: {
    gap: Spacing.sm,
  },
  btn: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  btnPrimary: {
    backgroundColor: Colors.accent,
  },
  btnSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnPrimaryText: {
    ...Typography.label,
    color: Colors.background,
    fontSize: 12,
  },
  btnSecondaryText: {
    ...Typography.label,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  skipBtn: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  skipText: {
    ...Typography.label,
    color: Colors.textDim,
    fontSize: 9,
    textDecorationLine: "underline",
  },
  scannerRoot: {
    flex: 1,
    backgroundColor: "#000",
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xl,
  },
  scanFrame: {
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: Colors.accent,
    borderRadius: BorderRadius.lg,
    backgroundColor: "transparent",
  },
  scanHint: {
    ...Typography.value,
    color: Colors.text,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
    fontSize: 12,
  },
  scanCancelBtn: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  scanCancelText: {
    ...Typography.label,
    color: Colors.text,
    fontSize: 11,
  },
});
