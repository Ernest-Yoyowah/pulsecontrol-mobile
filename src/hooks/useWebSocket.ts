import { useEffect } from "react";
import { webSocketService } from "../services/websocket";
import { useConnectionStore } from "../stores/connectionStore";

export function useWebSocket() {
  const setStatus = useConnectionStore((state) => state.setStatus);

  useEffect(() => {
    const unsubscribe = webSocketService.onStatusChange(setStatus);
    return unsubscribe;
  }, [setStatus]);
}
