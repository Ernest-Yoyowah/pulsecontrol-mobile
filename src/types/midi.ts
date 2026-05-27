export type MidiValue = number;

export interface MidiMessage {
  controlId: string;
  cc: number;
  value: MidiValue;
  timestamp: number;
  channel: number;
}
