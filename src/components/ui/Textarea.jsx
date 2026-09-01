import React, { forwardRef } from "react";

const Textarea = forwardRef(function Textarea({ label, hint, error, required=false, id, className="", ...props }, ref) {
  const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className={`ui-field ${className}`}>
      {label && <label className="ui-label" htmlFor={textareaId}>{label}{required && <span className="ui-required">*</span>}</label>}
      <textarea ref={ref} id={textareaId} aria-invalid={Boolean(error)} {...props} />
      {hint && !error && <span className="ui-field-hint">{hint}</span>}
      {error && <span className="ui-field-error" role="alert">{error}</span>}
    </div>
  );
});
export default Textarea;
