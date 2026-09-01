import React, { forwardRef } from "react";

const Input = forwardRef(function Input({
  label,
  hint,
  error,
  required = false,
  id,
  className = "",
  ...props
}, ref) {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className={`ui-field ${className}`}>
      {label && <label className="ui-label" htmlFor={inputId}>{label}{required && <span className="ui-required" aria-hidden="true">*</span>}</label>}
      <input ref={ref} id={inputId} aria-invalid={Boolean(error)} aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined} {...props} />
      {hint && !error && <span id={hintId} className="ui-field-hint">{hint}</span>}
      {error && <span id={errorId} className="ui-field-error" role="alert">{error}</span>}
    </div>
  );
});

export default Input;
