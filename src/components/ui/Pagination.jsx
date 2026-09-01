import React from "react";
import Button from "./Button";

export default function Pagination({
  page = 1,
  pageCount,
  totalPages,
  onPageChange,
  onChange,
  labels = { previous: "السابق", next: "التالي" },
  showSummary = true,
}) {
  const count = Math.max(1, Number(pageCount ?? totalPages ?? 1));
  const change = onPageChange || onChange;
  if (count <= 1 && !showSummary) return null;
  const go = (next) => change?.(Math.min(count, Math.max(1, next)));
  return (
    <nav className="ui-pagination" aria-label="Pagination">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => go(page - 1)}>{labels.previous}</Button>
      <span aria-current="page">{page} / {count}</span>
      <Button variant="outline" size="sm" disabled={page >= count} onClick={() => go(page + 1)}>{labels.next}</Button>
    </nav>
  );
}
