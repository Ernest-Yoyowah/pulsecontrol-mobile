import { create } from "zustand";
import { MidiValue } from "../types/midi";
import { sendMidiCC, sendTransportCommand } from "../services/midi";

interface MidiState {
  values: Record<string, MidiValue>;
  setValue: (
    controlId: string,
    cc: number,
    value: MidiValue,
    channel?: number,
  ) => void;
  getValue: (controlId: string, defaultVal?: number) => MidiValue;
  sendTransport: (action: string, cc: number, channel?: number) => void;
}

export const useMidiStore = create<MidiState>((set, get) => ({
  values: {},

  setValue: (controlId, cc, value, channel = 1) => {
    set((state) => ({ values: { ...state.values, [controlId]: value } }));
    sendMidiCC(controlId, cc, value, channel);
  },

  getValue: (controlId, defaultVal = 64) => {
    return get().values[controlId] ?? defaultVal;
  },

  sendTransport: (action, cc, channel = 1) => {
    sendTransportCommand(action, cc, channel);
  },
}));
