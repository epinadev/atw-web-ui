/**
 * React context provider for real-time notifications.
 */

"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useNotifications } from "@/hooks/use-notifications";

type WsStatus = "connecting" | "connected" | "disconnected";

interface NotificationContextType {
  status: WsStatus;
  browserPermission: NotificationPermission;
  requestPermission: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotificationContext() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotificationContext must be used within NotificationProvider");
  }
  return ctx;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const notifications = useNotifications();
  return (
    <NotificationContext.Provider value={notifications}>
      {children}
    </NotificationContext.Provider>
  );
}
