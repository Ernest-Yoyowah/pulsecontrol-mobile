import { ControlConfig, TransportButtonConfig } from "../types/control";

export const DEFAULT_FADERS: ControlConfig[] = Array.from(
  { length: 8 },
  (_, i) => ({
    id: `fader-${i}`,
    type: "fader" as const,
    label: `CH ${i + 1}`,
    cc: i + 1,
    channel: 1,
    defaultValue: 0,
  }),
);

export const DEFAULT_KNOBS: ControlConfig[] = Array.from(
  { length: 8 },
  (_, i) => ({
    id: `knob-${i}`,
    type: "knob" as const,
    label: `SND ${i + 1}`,
    cc: i + 11,
    channel: 1,
    defaultValue: 64,
  }),
);

export const DEFAULT_TRANSPORT: TransportButtonConfig[] = [
  { action: "play", cc: 118, channel: 1, label: "PLAY" },
  { action: "stop", cc: 117, channel: 1, label: "STOP" },
  { action: "record", cc: 119, channel: 1, label: "REC" },
];
