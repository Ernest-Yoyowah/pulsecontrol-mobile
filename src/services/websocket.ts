export type ConnectionStatus =
  | "connected"
  | "disconnected"
  | "connecting"
  | "error";

type MessageHandler = (data: Record<string, unknown>) => void;
type StatusHandler = (status: ConnectionStatus) => void;

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private config: WebSocketConfig | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;
  private currentStatus: ConnectionStatus = "disconnected";

  connect(config: WebSocketConfig): void {
    this.config = config;
    this.intentionalClose = false;
    this.reconnectAttempts = 0;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.createSocket();
  }

  private createSocket(): void {
    if (!this.config) return;
    this.notifyStatus("connecting");
    try {
      this.socket = new WebSocket(this.config.url);
      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.notifyStatus("connected");
        this.socket?.send(
          JSON.stringify({
            type: "hello",
            client: "pulsecontrol-mobile",
            version: "1.0.0",
          }),
        );
      };
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string);
          this.messageHandlers.forEach((h) => h(data));
        } catch {
          // ignore malformed messages
        }
      };
      this.socket.onclose = () => {
        if (!this.intentionalClose) {
          this.notifyStatus("disconnected");
          this.scheduleReconnect();
        }
      };
      this.socket.onerror = () => {
        this.notifyStatus("error");
      };
    } catch {
      this.notifyStatus("error");
    }
  }

  private scheduleReconnect(): void {
    if (!this.config) return;
    const max = this.config.maxReconnectAttempts ?? 5;
    if (this.reconnectAttempts >= max) return;
    this.reconnectAttempts++;
    const interval = this.config.reconnectInterval ?? 3000;
    this.reconnectTimer = setTimeout(() => this.createSocket(), interval);
  }

  disconnect(): void {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
    this.socket = null;
    this.notifyStatus("disconnected");
  }

  send(data: Record<string, unknown>): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  private notifyStatus(status: ConnectionStatus): void {
    this.currentStatus = status;
    this.statusHandlers.forEach((h) => h(status));
  }

  getStatus(): ConnectionStatus {
    return this.currentStatus;
  }
}

export const webSocketService = new WebSocketService();
