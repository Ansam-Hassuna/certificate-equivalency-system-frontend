import React from "react";
import Loading from "./Loading";
import EmptyState from "./EmptyState";

export default function Table({
  columns = [],
  rows = [],
  renderCell,
  rowKey = "id",
  loading = false,
  emptyMessage,
  caption,
  className = "",
  stickyHeader = false,
}) {
  return (
    <div className={`ui-table-wrapper ${className}`}>
      <div className={`ui-table-scroll ${stickyHeader ? "ui-table-scroll--sticky" : ""}`}>
        <table className="ui-table">
          {caption && <caption>{caption}</caption>}
          <thead>
            <tr>{columns.map((column) => <th key={column.key} scope="col" style={column.width ? { width: column.width } : undefined}>{column.label}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length || 1} className="ui-table__state"><Loading size="sm" label="" /></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={columns.length || 1} className="ui-table__state"><EmptyState compact title={emptyMessage || "لا توجد بيانات"} /></td></tr>
            ) : rows.map((row, index) => (
              <tr key={typeof rowKey === "function" ? rowKey(row, index) : row[rowKey] ?? index}>
                {columns.map((column) => <td key={column.key}>{renderCell ? renderCell(row, column) : column.render ? column.render(row, index) : row[column.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
