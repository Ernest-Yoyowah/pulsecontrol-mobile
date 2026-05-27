import { create } from "zustand";
import { ConnectionStatus, webSocketService } from "../services/websocket";
import { useSettingsStore } from "./settingsStore";

interface ConnectionState {
  status: ConnectionStatus;
  url: string;
  lastConnectedUrl: string | null;
  setUrl: (url: string) => void;
  connect: () => void;
  disconnect: () => void;
  setStatus: (status: ConnectionStatus) => void;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  status: "disconnected",
  url: "ws://192.168.1.100:8765",
  lastConnectedUrl: null,

  setUrl: (url) => set({ url }),

  connect: () => {
    const { url } = get();
    const { autoReconnect } = useSettingsStore.getState();
    webSocketService.connect({
      url,
      reconnectInterval: 3000,
      maxReconnectAttempts: autoReconnect ? 5 : 0,
    });
  },

  disconnect: () => {
    webSocketService.disconnect();
  },

  setStatus: (status) => {
    set((state) => ({
      status,
      lastConnectedUrl:
        status === "connected" ? state.url : state.lastConnectedUrl,
    }));
  },
}));
