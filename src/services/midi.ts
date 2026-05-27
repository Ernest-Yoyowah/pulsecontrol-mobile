import { MidiMessage } from "../types/midi";
import { webSocketService } from "./websocket";

export function sendMidiCC(
  controlId: string,
  cc: number,
  value: number,
  channel: number = 1,
): void {
  const message: MidiMessage = {
    controlId,
    cc,
    value: Math.max(0, Math.min(127, Math.round(value))),
    timestamp: Date.now(),
    channel,
  };
  webSocketService.send({ type: "midi_cc", ...message });
}

export function sendTransportCommand(
  action: string,
  cc: number,
  channel: number = 1,
): void {
  webSocketService.send({
    type: "transport",
    action,
    cc,
    value: 127,
    channel,
    timestamp: Date.now(),
  });
}
