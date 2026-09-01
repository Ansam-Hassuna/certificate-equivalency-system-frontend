import { NOTIFICATION_TYPES } from "./notificationTypes";

const STORAGE_KEY = "ce_notifications";

const isBrowser = typeof window !== "undefined";

function read() {
  if (!isBrowser) return [];

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function write(notifications) {
  if (!isBrowser) return;

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(notifications)
  );
}

function createId() {
  return `notification-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function normalizeNotification(notification) {
  return {
    id: notification.id || createId(),
    recipientUserId: notification.recipientUserId || null,
    roles: Array.isArray(notification.roles)
      ? notification.roles
      : [],
    type:
      notification.type ||
      NOTIFICATION_TYPES.APPLICATION_SUBMITTED,
    titleKey: notification.titleKey || "",
    messageKey: notification.messageKey || "",
    titleAr: notification.titleAr || "",
    titleEn: notification.titleEn || "",
    messageAr: notification.messageAr || "",
    messageEn: notification.messageEn || "",
    applicationId: notification.applicationId || null,
    path: notification.path || null,
    createdAt:
      notification.createdAt ||
      new Date().toISOString(),
    read: Boolean(notification.read),
  };
}

export const notificationStore = {
  getAll() {
    return read()
      .map(normalizeNotification)
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );
  },

  getForUser(user) {
    if (!user) return [];

    const notifications = this.getAll();

    return notifications.filter((notification) => {
      if (
        notification.recipientUserId &&
        notification.recipientUserId === user.id
      ) {
        return true;
      }

      return (
        Array.isArray(notification.roles) &&
        notification.roles.includes(user.role)
      );
    });
  },

  add(notification) {
    const next = normalizeNotification(notification);
    const notifications = this.getAll();

    write([next, ...notifications]);

    return next;
  },

  update(id, updates = {}) {
    const notifications = this.getAll();

    const current = notifications.find(
      (item) => item.id === id
    );

    if (!current) return false;

    const next = {
      ...current,
      ...updates,
      id,
    };

    write(
      notifications.map((item) =>
        item.id === id ? normalizeNotification(next) : item
      )
    );

    return true;
  },

  markAsRead(id, user) {
    const visible = this.getForUser(user);

    if (!visible.some((item) => item.id === id)) {
      return false;
    }

    const notifications = this.getAll().map((item) =>
      item.id === id
        ? { ...item, read: true }
        : item
    );

    write(notifications);
    return true;
  },

  markAllAsRead(user) {
    const visibleIds = new Set(
      this.getForUser(user).map((item) => item.id)
    );

    const notifications = this.getAll().map((item) =>
      visibleIds.has(item.id)
        ? { ...item, read: true }
        : item
    );

    write(notifications);
  },

  remove(id, user) {
    const visible = this.getForUser(user);

    if (!visible.some((item) => item.id === id)) {
      return false;
    }

    write(
      this.getAll().filter((item) => item.id !== id)
    );

    return true;
  },

  clear() {
    if (!isBrowser) return;
    window.localStorage.removeItem(STORAGE_KEY);
  },
};

export default notificationStore;


