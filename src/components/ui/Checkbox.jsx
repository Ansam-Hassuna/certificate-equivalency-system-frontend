import React, { forwardRef } from "react";
const Checkbox = forwardRef(function Checkbox({ label, hint, error, id, className="", ...props }, ref) {
  const inputId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;
  return <div className={`ui-choice ${className}`}>
    <label htmlFor={inputId}><input ref={ref} id={inputId} type="checkbox" aria-invalid={Boolean(error)} {...props} /><span className="ui-choice-mark" aria-hidden="true" /><span>{label}</span></label>
    {hint && !error && <span className="ui-field-hint ui-choice-hint">{hint}</span>}
    {error && <span className="ui-field-error" role="alert">{error}</span>}
  </div>;
});
export default Checkbox;
