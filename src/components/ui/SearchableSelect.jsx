import React, { useEffect, useRef, useState } from "react";
import "./SearchableSelect.css";
import { useLanguage } from "../../context/LanguageContext";

export default function SearchableSelect({
  label,
  hint,
  error,
  required = false,
  id,
  options = [],
  value = "",
  onChange,
  placeholder,
  searchPlaceholder,
  disabled = false,
  className = "",
}) {
  const { language } = useLanguage();
  const ar = language === "ar";

  const selectRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedOption = options.find(
    (option) => String(option.value) === String(value)
  );

  const selectedLabel = selectedOption?.label || "";

  const filteredOptions = options.filter((option) =>
    String(option.label)
      .toLocaleLowerCase()
      .includes(query.toLocaleLowerCase())
  );

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setQuery("");
  }, [value]);

  const handleSelect = (option) => {
    onChange?.({
      target: {
        value: option.value,
      },
    });

    setOpen(false);
    setQuery("");
  };

  const selectId =
    id || `searchable-select-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div
      ref={selectRef}
      className={`ui-field searchable-select ${className}`}
    >
      {label && (
        <label className="ui-label" htmlFor={selectId}>
          {label}
          {required && <span className="ui-required">*</span>}
        </label>
      )}

      <button
        id={selectId}
        type="button"
        className={`searchable-select__trigger ${
          open ? "is-open" : ""
        } ${error ? "has-error" : ""}`}
        onClick={() => !disabled && setOpen((current) => !current)}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-invalid={Boolean(error)}
      >
        <span
          className={
            selectedLabel
              ? "searchable-select__value"
              : "searchable-select__placeholder"
          }
        >
          {selectedLabel || placeholder}
        </span>

        <span
          className={`searchable-select__chevron ${
            open ? "is-open" : ""
          }`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="searchable-select__menu">
          <input
            autoFocus
            type="text"
            className="searchable-select__search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />

          <div
            className="searchable-select__options"
            role="listbox"
          >
            {filteredOptions.length === 0 ? (
              <div className="searchable-select__empty">
{query
                  ? ar
                    ? "لا توجد نتائج مطابقة."
                    : "No matching options"
                  : ar
                    ? "لا توجد خيارات متاحة."
                    : "No options available"}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`searchable-select__option ${
                    String(option.value) === String(value)
                      ? "is-selected"
                      : ""
                  }`}
                  onClick={() => handleSelect(option)}
                  role="option"
                  aria-selected={
                    String(option.value) === String(value)
                  }
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {hint && !error && (
        <span className="ui-field-hint">{hint}</span>
      )}

      {error && (
        <span className="ui-field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}


