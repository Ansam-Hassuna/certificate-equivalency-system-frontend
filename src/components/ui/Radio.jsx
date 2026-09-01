import React, { forwardRef } from "react";
const Radio = forwardRef(function Radio({ label, hint, error, id, className="", ...props }, ref) {
  const inputId = id || `radio-${Math.random().toString(36).slice(2, 9)}`;
  return <div className={`ui-choice ${className}`}>
    <label htmlFor={inputId}><input ref={ref} id={inputId} type="radio" aria-invalid={Boolean(error)} {...props} /><span className="ui-choice-mark" aria-hidden="true" /><span>{label}</span></label>
    {hint && !error && <span className="ui-field-hint ui-choice-hint">{hint}</span>}
    {error && <span className="ui-field-error" role="alert">{error}</span>}
  </div>;
});
export default Radio;
