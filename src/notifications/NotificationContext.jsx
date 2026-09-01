import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../auth/AuthContext";
import notificationStore from "./notificationStore";
import DEMO_NOTIFICATIONS from "./notificationSeed";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();

  const [version, setVersion] = useState(0);
  const [seeded, setSeeded] = useState(false);

  const refresh = useCallback(() => {
    setVersion((value) => value + 1);
  }, []);

  React.useEffect(() => {
    if (seeded) return;

    const existing = notificationStore.getAll();

    for (const notification of DEMO_NOTIFICATIONS) {
      const current = existing.find(
        (item) => item.id === notification.id
      );

      if (!current) {
        notificationStore.add({
          ...notification,
          read: false,
        });
        continue;
      }

      notificationStore.update?.(notification.id, notification);
    }

    setSeeded(true);
    refresh();
  }, [seeded, refresh]);

  const notifications = useMemo(
    () => notificationStore.getForUser(user),
    [user, version]
  );

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) => !notification.read
      ).length,
    [notifications]
  );

  const addNotification = useCallback(
    (notification) => {
      const next = notificationStore.add(
        notification
      );
      refresh();
      return next;
    },
    [refresh]
  );

  const markAsRead = useCallback(
    (id) => {
      const changed = notificationStore.markAsRead(
        id,
        user
      );

      if (changed) {
        refresh();
      }

      return changed;
    },
    [user, refresh]
  );

  const markAllAsRead = useCallback(() => {
    notificationStore.markAllAsRead(user);
    refresh();
  }, [user, refresh]);

  const removeNotification = useCallback(
    (id) => {
      const changed = notificationStore.remove(
        id,
        user
      );

      if (changed) {
        refresh();
      }

      return changed;
    },
    [user, refresh]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      refresh,
    }),
    [
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      refresh,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(
    NotificationContext
  );

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
}

export default NotificationContext;


