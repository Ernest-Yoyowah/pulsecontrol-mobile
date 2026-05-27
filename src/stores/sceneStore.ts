import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Scene } from "../types/scene";
import {
  DEFAULT_FADERS,
  DEFAULT_KNOBS,
  DEFAULT_TRANSPORT,
} from "../constants/defaults";

const buildScene = (id: string, name: string, ccOffset = 0): Scene => ({
  id,
  name,
  faders: DEFAULT_FADERS.map((f, i) => ({
    ...f,
    id: `fader-${id}-${i}`,
    cc: f.cc + ccOffset,
  })),
  knobs: DEFAULT_KNOBS.map((k, i) => ({
    ...k,
    id: `knob-${id}-${i}`,
    cc: k.cc + ccOffset,
  })),
  transport: DEFAULT_TRANSPORT,
});

const INITIAL_SCENES: Scene[] = [
  buildScene("scene-1", "Scene 1", 0),
  buildScene("scene-2", "Scene 2", 20),
  buildScene("scene-3", "Scene 3", 40),
];

const STORAGE_KEY = "@pulse_scenes";

interface SceneState {
  scenes: Scene[];
  activeSceneId: string;
  setActiveScene: (id: string) => void;
  addScene: (name: string) => void;
  renameScene: (id: string, name: string) => void;
  deleteScene: (id: string) => void;
  updateSceneControl: (sceneId: string, controlId: string, cc: number) => void;
  getActiveScene: () => Scene | undefined;
  loadFromStorage: () => Promise<void>;
}

export const useSceneStore = create<SceneState>((set, get) => ({
  scenes: INITIAL_SCENES,
  activeSceneId: "scene-1",

  setActiveScene: (id) => {
    set({ activeSceneId: id });
  },

  addScene: (name) => {
    const id = `scene-${Date.now()}`;
    const existing = get().scenes;
    const ccOffset = existing.length * 20;
    const scene = buildScene(id, name, ccOffset);
    const scenes = [...existing, scene];
    set({ scenes });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(scenes));
  },

  renameScene: (id, name) => {
    const scenes = get().scenes.map((s) => (s.id === id ? { ...s, name } : s));
    set({ scenes });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(scenes));
  },

  deleteScene: (id) => {
    const scenes = get().scenes.filter((s) => s.id !== id);
    const activeSceneId =
      get().activeSceneId === id ? (scenes[0]?.id ?? "") : get().activeSceneId;
    set({ scenes, activeSceneId });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(scenes));
  },

  updateSceneControl: (sceneId, controlId, cc) => {
    const scenes = get().scenes.map((scene) => {
      if (scene.id !== sceneId) return scene;
      return {
        ...scene,
        faders: scene.faders.map((f) =>
          f.id === controlId ? { ...f, cc } : f,
        ),
        knobs: scene.knobs.map((k) => (k.id === controlId ? { ...k, cc } : k)),
      };
    });
    set({ scenes });
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(scenes));
  },

  getActiveScene: () => {
    const { scenes, activeSceneId } = get();
    return scenes.find((s) => s.id === activeSceneId);
  },

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const scenes: Scene[] = JSON.parse(raw);
        if (scenes.length > 0) {
          set((state) => ({
            scenes,
            activeSceneId: scenes.find((s) => s.id === state.activeSceneId)
              ? state.activeSceneId
              : scenes[0].id,
          }));
        }
      }
    } catch {
      // fall back to defaults
    }
  },
}));
