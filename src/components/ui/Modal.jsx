import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";

export default function Modal({ open=false, onClose, title, children, footer, size="md", closeOnOverlay=true, closeOnEscape=true, labelledBy, className="" }) {
  useEffect(() => {
    if (!open || !closeOnEscape) return undefined;
    const onKeyDown = (event) => event.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = previousOverflow; };
  }, [open, closeOnEscape, onClose]);

  if (!open) return null;
  const content = <div className="ui-modal-backdrop" onMouseDown={(e) => { if (closeOnOverlay && e.target === e.currentTarget) onClose?.(); }}>
    <section className={`ui-modal ui-modal--${size} ${className}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy || "ui-modal-title"}>
      <header className="ui-modal__header">
        <h2 id={labelledBy || "ui-modal-title"}>{title}</h2>
        <Button variant="ghost" size="sm" aria-label="Close" onClick={onClose}>×</Button>
      </header>
      <div className="ui-modal__body">{children}</div>
      {footer && <footer className="ui-modal__footer">{footer}</footer>}
    </section>
  </div>;
  return createPortal(content, document.body);
}
