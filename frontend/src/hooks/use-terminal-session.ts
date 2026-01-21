/**
 * Hook for managing terminal WebSocket sessions.
 */

"use client";

import { useEffect, useRef, useCallback, useState } from "react";

type SessionStatus = "connecting" | "connected" | "disconnected" | "error";

interface TerminalMessage {
  type: "output" | "ready" | "exit" | "error";
  data?: string;
  message?: string;
  code?: number;
  task_id?: string;
}

interface UseTerminalSessionOptions {
  taskId: string;
  onOutput?: (data: string) => void;
  onReady?: () => void;
  onExit?: (code: number) => void;
  onError?: (message: string) => void;
}

export function useTerminalSession({
  taskId,
  onOutput,
  onReady,
  onExit,
  onError,
}: UseTerminalSessionOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<SessionStatus>("disconnected");
  const callbacksRef = useRef({ onOutput, onReady, onExit, onError });

  // Update callbacks ref to avoid stale closures
  useEffect(() => {
    callbacksRef.current = { onOutput, onReady, onExit, onError };
  }, [onOutput, onReady, onExit, onError]);

  const getWsUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:8000/ws/session/${taskId}`;
  }, [taskId]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus("connecting");
    const ws = new WebSocket(getWsUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        const message: TerminalMessage = JSON.parse(event.data);

        switch (message.type) {
          case "output":
            if (message.data) {
              callbacksRef.current.onOutput?.(message.data);
            }
            break;
          case "ready":
            callbacksRef.current.onReady?.();
            break;
          case "exit":
            callbacksRef.current.onExit?.(message.code ?? 0);
            setStatus("disconnected");
            break;
          case "error":
            callbacksRef.current.onError?.(message.message ?? "Unknown error");
            setStatus("error");
            break;
        }
      } catch (e) {
        console.error("Failed to parse message:", e);
      }
    };

    ws.onerror = () => {
      setStatus("error");
      callbacksRef.current.onError?.("WebSocket connection error");
    };

    ws.onclose = () => {
      setStatus("disconnected");
    };
  }, [getWsUrl]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  const sendInput = useCallback((data: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "input", data }));
    }
  }, []);

  const sendResize = useCallback((rows: number, cols: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "resize", rows, cols }));
    }
  }, []);

  const stop = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "stop" }));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  return {
    status,
    connect,
    disconnect,
    sendInput,
    sendResize,
    stop,
  };
}
