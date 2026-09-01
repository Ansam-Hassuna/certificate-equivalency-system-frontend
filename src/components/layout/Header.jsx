import React, { useEffect, useRef, useState } from "react";
import Icon from "../ui/Icon";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { ROLE_LABELS } from "../../config/roles";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../notifications/NotificationContext";
import NotificationPanel from "../../notifications/NotificationPanel";
import "./Header.css";

const Header = ({ user = null, onLogout, menuOpen = false, onMenuToggle }) => {
  const { language, t, toggleLanguage, isArabic } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { unreadCount } = useNotifications();
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    onLogout?.();
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-start">
          <button
            type="button"
            className="header-icon-button hamburger-button"
            onClick={onMenuToggle}
            aria-label={menuOpen ? t("header.closeMenu") : t("header.openMenu")}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
          >
            <Icon name={menuOpen ? "x" : "menu"} size={22} />
          </button>

          <div className="header-brand" aria-label={t("common.appName")}>
            <div className="header-brand-mark" aria-hidden="true"><img src={`${process.env.PUBLIC_URL}/ministry-logo.jpg`} alt="شعار الوزارة"/></div>
            <div className="header-brand-text">
              <span className="header-brand-title">{t("common.appName")}</span>
              <span className="header-brand-subtitle">{t("common.ministryName")}</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button type="button" className="header-action-button" onClick={toggleLanguage} aria-label={t("header.language")} title={t("header.language")}>
            <Icon name="globe" size={19} />
            <span>{language === "ar" ? "AR" : "EN"}</span>
          </button>

          <button type="button" className="header-icon-button" onClick={toggleTheme} aria-label={isDark ? t("header.lightMode") : t("header.darkMode")} title={isDark ? t("header.lightMode") : t("header.darkMode")}>
            <Icon name={isDark ? "sun" : "moon"} size={20} />
          </button>

          <div className="notification-wrapper" ref={notificationRef}>
            <button
              type="button"
              className="header-icon-button notification-button"
              onClick={() => setNotificationsOpen((open) => !open)}
              aria-label={t("header.notifications")}
              title={t("header.notifications")}
              aria-expanded={notificationsOpen}
              aria-haspopup="dialog"
            >
              <Icon name="bell" size={20} />

              {unreadCount > 0 && (
                <span
                  className="notification-count"
                  aria-hidden="true"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <NotificationPanel
                onClose={() => setNotificationsOpen(false)}
              />
            )}
          </div>

          <span className="header-divider" aria-hidden="true" />

          <div className="header-profile" ref={profileRef}>
            <button type="button" className="profile-button" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen} aria-haspopup="menu" aria-label={t("header.profile")}>
              <span className="profile-avatar"><Icon name="user" size={18} /></span>
              <span className="profile-copy">
                <strong>{user?.name || (isArabic ? "المستخدم" : "User")}</strong>
                <small>{user?.role ? (ROLE_LABELS[user.role]?.[language] || user.role) : (isArabic ? "مستخدم النظام" : "System User")}</small>
              </span>
              <Icon name="chevronDown" size={17} className={profileOpen ? "profile-chevron is-open" : "profile-chevron"} />
            </button>

            {profileOpen && (
              <div className="profile-menu" role="menu">
                <button type="button" className="profile-menu-item" role="menuitem" onClick={() => { setProfileOpen(false); navigate("/roles"); }}>
                  <Icon name="user" size={18} /><span>{t("navigation.roleProfile")}</span>
                </button>
                <button type="button" className="profile-menu-item" role="menuitem" onClick={() => { setProfileOpen(false); navigate("/settings"); }}>
                  <Icon name="settings" size={18} /><span>{t("header.settings")}</span>
                </button>
                <div className="profile-menu-divider" />
                <button type="button" className="profile-menu-item profile-menu-danger" role="menuitem" onClick={handleLogout}>
                  <Icon name="logout" size={18} /><span>{t("header.logout")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


