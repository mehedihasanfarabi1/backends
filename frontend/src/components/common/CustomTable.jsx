import React, { useState } from "react";

const CustomTable = ({
  columns,
  data,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const [selectedRows, setSelectedRows] = useState([]);

  // Select/Deselect All
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(data.map((row) => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  // Select Single Row
  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  // Pagination buttons (with ellipsis)
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    let pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (start > 1) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push("...");

    return (
      <div className="d-flex justify-content-center align-items-center mt-3 gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn btn-sm btn-outline-secondary"
        >
          ‹ Prev
        </button>
        {pages.map((p, idx) =>
          p === "..." ? (
            <span key={idx} className="px-2">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`btn btn-sm ${
                p === currentPage
                  ? "btn-primary text-white"
                  : "btn-outline-secondary"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn btn-sm btn-outline-secondary"
        >
          Next ›
        </button>
      </div>
    );
  };

  return (
    <div className="bg-white shadow-sm rounded-2xl overflow-hidden border">
      <table className="table table-bordered table-hover text-sm align-middle mb-0">
        <thead className="table-primary">
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedRows.length === data.length && data.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx}>
              {/* Checkbox */}
              <td>
                <input
                  type="checkbox"
                  checked={selectedRows.includes(row.id)}
                  onChange={() => handleRowSelect(row.id)}
                />
              </td>

              {/* Dynamic Columns */}
              {columns.map((col, colIdx) => (
                <td key={col.key}>
                  {col.render ? col.render(row, idx) : row[col.key]}
                </td>
              ))}

              {/* Action Buttons */}
              <td className="text-center">
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => onEdit(row)}
                >
                  ✏️
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => onDelete(row)}
                >
                  🗑
                </button>
              </td>
            </tr>
          ))}

          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length + 2} className="text-center py-3">
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default CustomTable;
