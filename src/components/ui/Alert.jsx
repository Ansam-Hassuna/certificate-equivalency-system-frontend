import React from "react";
import Icon from "./Icon";
const icons = { info: "info", success: "check", warning: "warning", danger: "close" };
export default function Alert({ variant="info", title, children, onClose, className="" }) {
  return <div className={`ui-alert ui-alert--${variant} ${className}`} role={variant === "danger" ? "alert" : "status"}>
    <span className="ui-alert__icon"><Icon name={icons[variant] || "info"} size={20} /></span>
    <div className="ui-alert__content">{title && <strong>{title}</strong>}<div>{children}</div></div>
    {onClose && <button className="ui-alert__close" type="button" onClick={onClose} aria-label="Close">×</button>}
  </div>;
}
