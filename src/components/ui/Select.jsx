import React, { forwardRef } from "react";

const Select = forwardRef(function Select({ label, hint, error, required=false, id, options=[], placeholder, children, className="", ...props }, ref) {
  const selectId = id || `select-${Math.random().toString(36).slice(2, 9)}`;
  return (
    <div className={`ui-field ${className}`}>
      {label && <label className="ui-label" htmlFor={selectId}>{label}{required && <span className="ui-required">*</span>}</label>}
      <select ref={ref} id={selectId} aria-invalid={Boolean(error)} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {children || options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
      </select>
      {hint && !error && <span className="ui-field-hint">{hint}</span>}
      {error && <span className="ui-field-error" role="alert">{error}</span>}
    </div>
  );
});
export default Select;
