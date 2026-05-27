import { Platform } from "react-native";

export const Colors = {
  background: "#080808",
  surface: "#0f0f0f",
  surfaceElevated: "#161616",
  surfaceActive: "#1e1e1e",
  border: "#222222",
  borderHighlight: "#333333",
  accent: "#00d4ff",
  accentDim: "#007a99",
  accentGlow: "rgba(0, 212, 255, 0.12)",
  accentGlowStrong: "rgba(0, 212, 255, 0.25)",
  play: "#00e676",
  playGlow: "rgba(0, 230, 118, 0.2)",
  stop: "#ff5252",
  stopGlow: "rgba(255, 82, 82, 0.2)",
  record: "#ff1744",
  recordGlow: "rgba(255, 23, 68, 0.2)",
  text: "#ffffff",
  textSecondary: "#666666",
  textDim: "#333333",
  knobTrack: "#1c1c1c",
  faderTrack: "#151515",
  faderFill: "#1f1f1f",
  connected: "#00e676",
  disconnected: "#444444",
  connecting: "#ffab40",
  error: "#ff5252",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const BorderRadius = {
  sm: 3,
  md: 6,
  lg: 10,
  xl: 14,
  round: 999,
};

export const Typography = {
  mono: Platform.OS === "ios" ? "Courier New" : "monospace",
  sansSerif: Platform.OS === "ios" ? "Helvetica Neue" : "sans-serif",
  label: {
    fontSize: 8,
    letterSpacing: 1.8,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
  },
  value: {
    fontSize: 10,
    letterSpacing: 0.5,
    fontWeight: "500" as const,
  },
  heading: {
    fontSize: 11,
    letterSpacing: 2.5,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
  },
  title: {
    fontSize: 13,
    letterSpacing: 3,
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
  },
};
