import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SettingsState {
  hapticFeedback: boolean;
  showValues: boolean;
  midiChannel: number;
  stageDimMode: boolean;
  autoReconnect: boolean;
  setHapticFeedback: (v: boolean) => void;
  setShowValues: (v: boolean) => void;
  setMidiChannel: (v: number) => void;
  setStageDimMode: (v: boolean) => void;
  setAutoReconnect: (v: boolean) => void;
  loadFromStorage: () => Promise<void>;
}

const STORAGE_KEY = "@pulse_settings";

export const useSettingsStore = create<SettingsState>((set, get) => ({
  hapticFeedback: true,
  showValues: true,
  midiChannel: 1,
  stageDimMode: false,
  autoReconnect: true,

  setHapticFeedback: (v) => {
    set({ hapticFeedback: v });
    save(get);
  },
  setShowValues: (v) => {
    set({ showValues: v });
    save(get);
  },
  setMidiChannel: (v) => {
    set({ midiChannel: v });
    save(get);
  },
  setStageDimMode: (v) => {
    set({ stageDimMode: v });
    save(get);
  },
  setAutoReconnect: (v) => {
    set({ autoReconnect: v });
    save(get);
  },

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set(parsed);
      }
    } catch {
      // fall back to defaults
    }
  },
}));

function save(
  get: () => Pick<
    SettingsState,
    | "hapticFeedback"
    | "showValues"
    | "midiChannel"
    | "stageDimMode"
    | "autoReconnect"
  >,
) {
  const {
    hapticFeedback,
    showValues,
    midiChannel,
    stageDimMode,
    autoReconnect,
  } = get();
  AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      hapticFeedback,
      showValues,
      midiChannel,
      stageDimMode,
      autoReconnect,
    }),
  );
}
