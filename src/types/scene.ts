import { ControlConfig, TransportButtonConfig } from "./control";

export interface Scene {
  id: string;
  name: string;
  faders: ControlConfig[];
  knobs: ControlConfig[];
  transport: TransportButtonConfig[];
}
