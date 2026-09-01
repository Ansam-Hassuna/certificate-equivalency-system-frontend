import React, { useMemo, useState } from "react";
import SearchBar from "./SearchBar";
import Button from "./Button";

export default function FilterBar({
  search = "",
  onSearch,
  searchPlaceholder = "بحث...",
  filters = [],
  onReset,
  labels = { filters: "الفلاتر", reset: "مسح الفلاتر", apply: "تطبيق", active: "الفلاتر النشطة" },
}) {
  const [open, setOpen] = useState(false);
  const activeFilters = useMemo(() => filters.filter((f) => f.value !== "" && f.value !== "all" && f.value != null), [filters]);
  const activeCount = activeFilters.length;

  return (
    <div className="filter-bar">
      <div className="filter-bar__main">
        <SearchBar value={search} onChange={onSearch} placeholder={searchPlaceholder} />
        <Button variant={open ? "primary" : "secondary"} size="sm" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {labels.filters}{activeCount ? ` (${activeCount})` : ""}
        </Button>
      </div>

      {activeCount > 0 && (
        <div className="filter-chips" aria-label={labels.active}>
          {activeFilters.map((filter) => {
            const option = filter.options?.find((item) => String(item.value) === String(filter.value));
            const valueLabel = option?.label || filter.value;
            return (
              <button key={filter.key} type="button" className="filter-chip" onClick={() => filter.onChange?.(filter.defaultValue ?? "")}>
                <span>{filter.label}: {valueLabel}</span><span aria-hidden="true">×</span>
              </button>
            );
          })}
          <button type="button" className="filter-clear-link" onClick={onReset}>{labels.reset}</button>
        </div>
      )}

      {open && (
        <div className="filter-panel">
          <div className="filter-panel__grid">
            {filters.map((filter) => (
              <label className="filter-field" key={filter.key}>
                <span>{filter.label}</span>
                {filter.type === "date" ? (
                  <input type="date" value={filter.value || ""} onChange={(e) => filter.onChange?.(e.target.value)} />
                ) : (
                  <select value={filter.value ?? "all"} onChange={(e) => filter.onChange?.(e.target.value)}>
                    {(filter.options || []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                )}
              </label>
            ))}
          </div>
          <div className="filter-panel__actions">
            <Button variant="secondary" size="sm" onClick={onReset}>{labels.reset}</Button>
            <Button size="sm" onClick={() => setOpen(false)}>{labels.apply}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
