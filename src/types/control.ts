export type ControlType = "fader" | "knob" | "transport";

export interface ControlConfig {
  id: string;
  type: ControlType;
  label: string;
  cc: number;
  channel: number;
  defaultValue: number;
}

export type TransportAction = "play" | "stop" | "record";

export interface TransportButtonConfig {
  action: TransportAction;
  cc: number;
  channel: number;
  label: string;
}
