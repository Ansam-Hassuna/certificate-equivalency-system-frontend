import React, { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from "../ui/Icon";
import { NAVIGATION } from "../../config/navigation";
import { filterByPermission } from "../../auth/accessControl";
import { useLanguage } from "../../context/LanguageContext";
import { ROLE_LABELS } from "../../auth/roles";
import "./HamburgerMenu.css";

const HamburgerMenu = ({ isOpen, onClose, user = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, isArabic } = useLanguage();
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  const items = useMemo(() => filterByPermission(user, NAVIGATION), [user]);

  const handleNavigation = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <>
      <button className={isOpen ? "hamburger-overlay is-open" : "hamburger-overlay"} type="button" aria-label={t("common.close")} aria-hidden={!isOpen} tabIndex={isOpen ? 0 : -1} onClick={onClose} />
      <aside
        ref={drawerRef}
        id="main-navigation"
        className={isOpen ? "hamburger-drawer is-open" : "hamburger-drawer"}
        aria-hidden={!isOpen}
        aria-label={isArabic ? "القائمة الرئيسية" : "Main navigation"}
      >
        <div className="hamburger-header">
          <div className="hamburger-title-wrapper">
            <div className="hamburger-brand-mark" aria-hidden="true"><img src={`${process.env.PUBLIC_URL}/ministry-logo.jpg`} alt="" /></div>
            <div className="hamburger-title-content">
              <h2>{t("common.appName")}</h2>
              <span>{t("common.ministryName")}</span>
            </div>
          </div>
          <button type="button" className="hamburger-close" onClick={onClose} aria-label={t("header.closeMenu")}>
            <Icon name="x" size={21} />
          </button>
        </div>

        <nav className="hamburger-navigation">
          <ul className="hamburger-list">
            {items.map((item) => {
              const active = item.path === "/dashboard" ? location.pathname === item.path : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <li className="hamburger-item" key={item.id}>
                  <button type="button" className={active ? "hamburger-link active" : "hamburger-link"} onClick={() => handleNavigation(item.path)} aria-current={active ? "page" : undefined}>
                    <Icon name={item.icon || "document"} size={20} />
                    <span>{item.labelKey ? t(item.labelKey) : (isArabic ? item.labelAr : item.labelEn)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {user && (
          <div className="hamburger-user">
            <span className="hamburger-user-avatar"><Icon name="user" size={19} /></span>
            <span className="hamburger-user-info">
              <strong>{user.name || (isArabic ? "المستخدم" : "User")}</strong>
              <span>{user.role ? (ROLE_LABELS[user.role]?.[isArabic ? "ar" : "en"] || user.role) : (isArabic ? "مستخدم النظام" : "System User")}</span>
            </span>
          </div>
        )}
      </aside>
    </>
  );
};

export default HamburgerMenu;
