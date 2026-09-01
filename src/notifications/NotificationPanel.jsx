import React from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/ui/Icon";
import { useLanguage } from "../context/LanguageContext";
import { useNotifications } from "./NotificationContext";
import "./NotificationPanel.css";

export default function NotificationPanel({ onClose }) {
  const { language } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const navigate = useNavigate();
  const ar = language === "ar";

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
  };

  const handleNotificationAction = (notification) => {
    if (!notification.path) return;

    onClose?.();
    navigate(notification.path);
  };

  const labels = ar
    ? {
        title: "الإشعارات",
        unread: `${unreadCount} غير مقروء`,
        markAll: "تحديد الكل كمقروء",
        empty: "لا توجد إشعارات.",
        noMessage: "لا توجد رسائل جديدة حاليًا.",
      }
    : {
        title: "Notifications",
        unread: `${unreadCount} unread`,
        markAll: "Mark all as read",
        empty: "No notifications.",
        noMessage: "There are no new notifications.",
      };

  return (
    <div
      className="notification-panel"
      role="dialog"
      aria-label={labels.title}
    >
      <div className="notification-panel__header">
        <div>
          <h2>{labels.title}</h2>
          <span>{labels.unread}</span>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="notification-panel__mark"
            onClick={markAllAsRead}
          >
            {labels.markAll}
          </button>
        )}
      </div>

      <div className="notification-panel__body">
        {notifications.length === 0 ? (
          <div className="notification-panel__empty">
            <Icon name="bell" size={28} />
            <strong>{labels.empty}</strong>
            <span>{labels.noMessage}</span>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${
                notification.read ? "" : "is-unread"
              }`}
              role="button"
              tabIndex={0}
              onClick={() => handleNotificationClick(notification)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleNotificationClick(notification);
                }
              }}
            >
              <span className="notification-item__icon">
                <Icon name="bell" size={18} />
              </span>

              <span className="notification-item__content">
                <strong>
                  {ar
                    ? notification.titleAr ||
                      notification.title ||
                      notification.titleKey ||
                      "إشعار"
                    : notification.titleEn ||
                      notification.title ||
                      notification.titleKey ||
                      "Notification"}
                </strong>

                <span>
                  {ar
                    ? notification.messageAr ||
                      notification.message ||
                      notification.messageKey ||
                      ""
                    : notification.messageEn ||
                      notification.message ||
                      notification.messageKey ||
                      ""}
                </span>

                <small>
                  {new Date(
                    notification.createdAt
                  ).toLocaleString(
                    ar ? "ar-SA" : "en-US",
                    {
                      dateStyle: "short",
                      timeStyle: "short",
                    }
                  )}
                </small>
              </span>

              {!notification.read && (
                <span
                  className="notification-item__unread"
                  aria-label={ar ? "غير مقروء" : "Unread"}
                />
              )}
              {notification.path && (
                <button
                  type="button"
                  className="notification-item__action"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleNotificationAction(notification);
                  }}
                >
                  {ar ? "عرض" : "View"}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}


