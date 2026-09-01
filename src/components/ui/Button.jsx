import React from "react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconPosition = "start",
  fullWidth = false,
  type = "button",
  className = "",
  disabled = false,
  ...props
}) {
  const classes = [
    "ui-button",
    `ui-button--${variant}`,
    `ui-button--${size}`,
    fullWidth ? "ui-button--full" : "",
    loading ? "ui-button--loading" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {loading ? <span className="ui-spinner ui-spinner--button" aria-hidden="true" /> : icon && iconPosition === "start" ? icon : null}
      <span>{children}</span>
      {!loading && icon && iconPosition === "end" ? icon : null}
    </button>
  );
}
