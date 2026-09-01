import React, { useCallback, useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import HamburgerMenu from "../navigation/HamburgerMenu";
import "./AppLayout.css";

const DESKTOP_BREAKPOINT = 992;

const AppLayout = ({ children, user = null, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > DESKTOP_BREAKPOINT) closeMenu();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [closeMenu]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeMenu]);

  const handleLogout = useCallback(() => {
    closeMenu();
    onLogout?.();
  }, [closeMenu, onLogout]);

  return (
    <div className="app-layout">
      <Header user={user} onLogout={handleLogout} menuOpen={menuOpen} onMenuToggle={toggleMenu} />
      <HamburgerMenu isOpen={menuOpen} onClose={closeMenu} user={user} />
      <main className="app-main" id="main-content">
        <div className="app-content">{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
