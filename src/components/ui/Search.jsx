import React, { forwardRef } from "react";
import Icon from "./Icon";
const Search = forwardRef(function Search({ value, onChange, onClear, placeholder="بحث", label, id="search", className="", ...props }, ref) {
 const handleChange = (event) => {
  // SearchBar exposes the field value to consumers, not the native DOM event.
  // This keeps controlled search state consistent across Dashboard, Applications, etc.
  onChange?.(event.target.value);
 };

 const handleClear = () => {
  onClear?.();
  if (!onClear) onChange?.("");
 };

 return <div className={`ui-search ${className}`}>{label && <label className="ui-label" htmlFor={id}>{label}</label>}<div className="ui-search__control"><Icon name="search" size={18}/><input ref={ref} id={id} type="search" value={value ?? ""} onChange={handleChange} placeholder={placeholder} {...props}/>{value && <button type="button" onClick={handleClear} aria-label="Clear">×</button>}</div></div>;
});
export default Search;
export { Search };
