/**
 * WebSocket hook for real-time push notifications.
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";

type SwReg = ServiceWorkerRegistration | null;

type WsStatus = "connecting" | "connected" | "disconnected";
type BrowserPermission = NotificationPermission; // "default" | "granted" | "denied"

interface NotificationEvent {
  type: string;
  task_id?: string;
  task_name?: string;
  old_status?: string;
  new_status?: string;
  detail?: string;
  timestamp?: string;
}

function getWsUrl(): string {
  if (typeof window === "undefined") return "";
  if (process.env.NEXT_PUBLIC_API_URL) {
    const url = new URL(process.env.NEXT_PUBLIC_API_URL);
    const wsProtocol = url.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProtocol}//${url.host}/ws/notifications`;
  }
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${wsProtocol}//${window.location.hostname}:8001/ws/notifications`;
}

function buildToastMessage(event: NotificationEvent): string {
  const label = event.task_id || "Task";
  if (event.detail) return `${label}: ${event.detail}`;
  if (event.new_status) return `${label} → ${event.new_status}`;
  return `${label}: notification`;
}

export function useNotifications() {
  const [status, setStatus] = useState<WsStatus>("disconnected");
  const [browserPermission, setBrowserPermission] = useState<BrowserPermission>("default");
  const wsRef = useRef<WebSocket | null>(null);
  const swRef = useRef<SwReg>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Register service worker for PWA notification support
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        swRef.current = reg;
      })
      .catch(() => {
        // SW registration failed (e.g. localhost without HTTPS)
      });
  }, []);

  // Track browser permission state
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setBrowserPermission(result);
  }, []);

  const handleEvent = useCallback(
    (event: NotificationEvent) => {
      if (event.type === "ping" || event.type === "connected") return;

      const message = buildToastMessage(event);

      // In-app toast (always)
      showToast(message, "info");

      // Browser / PWA notification (via SW for installed-app support)
      if (
        "Notification" in window &&
        Notification.permission === "granted" &&
        swRef.current
      ) {
        swRef.current.showNotification("ATW", {
          body: message,
          tag: `atw-${event.task_id || "global"}-${event.type}`,
        });
      }

      // Invalidate React Query caches for instant UI refresh
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["workflow"] });
      queryClient.invalidateQueries({ queryKey: ["executor"] });
    },
    [queryClient, showToast],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = getWsUrl();
    if (!url) return;

    let disposed = false;

    function connect() {
      if (disposed) return;

      setStatus("connecting");
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (disposed) { ws.close(); return; }
        console.log("[WS] Connected to", url);
        setStatus("connected");
      };

      ws.onmessage = (e) => {
        try {
          const data: NotificationEvent = JSON.parse(e.data);
          // Respond to server pings
          if (data.type === "ping") {
            ws.send(JSON.stringify({ type: "pong" }));
            return;
          }
          console.log("[WS] Received event:", data.type, data.detail);
          handleEvent(data);
          console.log("[WS] Event handled OK");
        } catch (err) {
          console.error("[WS] Error handling message:", err);
        }
      };

      ws.onclose = () => {
        if (disposed) return;
        setStatus("disconnected");
        wsRef.current = null;
        // Auto-reconnect after 3s
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        // onclose will fire after onerror
      };
    }

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [handleEvent]);

  return { status, browserPermission, requestPermission };
}
