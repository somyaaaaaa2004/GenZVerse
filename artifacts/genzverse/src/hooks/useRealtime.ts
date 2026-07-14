import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";

type RealtimeEvent = {
  type: string;
  payload?: Record<string, unknown>;
};

export function useRealtime(queryClient: QueryClient, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const token = localStorage.getItem("genzverse_access_token");
    if (!token) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as RealtimeEvent;
        if (
          data.type === "social:friend_request" ||
          data.type === "social:friend_request_accepted"
        ) {
          void queryClient.invalidateQueries({ queryKey: ["social", "friendRequests"] });
          void queryClient.invalidateQueries({ queryKey: ["social", "friends"] });
          void queryClient.invalidateQueries({ queryKey: ["dashboard", "activity"] });
        }
        if (data.type === "social:notification") {
          void queryClient.invalidateQueries({ queryKey: ["dashboard", "notifications"] });
        }
        if (data.type === "presence:update") {
          void queryClient.invalidateQueries({ queryKey: ["social", "searchUsers"] });
          void queryClient.invalidateQueries({ queryKey: ["social", "friends"] });
        }
      } catch {
        // ignore malformed realtime event
      }
    };

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "presence:set",
          payload: { status: "ONLINE" },
        }),
      );
    };

    const onVisibility = () => {
      if (ws.readyState !== WebSocket.OPEN) return;
      ws.send(
        JSON.stringify({
          type: "presence:set",
          payload: { status: document.hidden ? "AWAY" : "ONLINE" },
        }),
      );
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "presence:set", payload: { status: "OFFLINE" } }));
      }
      ws.close();
    };
  }, [enabled, queryClient]);
}

