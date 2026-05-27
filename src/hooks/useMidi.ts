import { useCallback } from "react";
import { useMidiStore } from "../stores/midiStore";
import { useSettingsStore } from "../stores/settingsStore";

export function useMidiControl(controlId: string, cc: number, defaultVal = 64) {
  const setValue = useMidiStore((state) => state.setValue);
  const value = useMidiStore((state) => state.getValue(controlId, defaultVal));
  const midiChannel = useSettingsStore((state) => state.midiChannel);

  const send = useCallback(
    (newValue: number) => {
      setValue(controlId, cc, newValue, midiChannel);
    },
    [controlId, cc, setValue, midiChannel],
  );

  return { value, send };
}
