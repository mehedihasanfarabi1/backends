import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const maxVisible = 5; // একসাথে কয়টা page দেখাবে
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = startPage + maxVisible - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <li key={i} className={`page-item ${i === currentPage ? "active" : ""}`}>
        <button className="page-link" onClick={() => onPageChange(i)}>
          {i}
        </button>
      </li>
    );
  }

  return (
    <nav className="d-flex justify-content-center mt-4">
      <ul className="pagination pagination-sm">
        {/* First & Prev */}
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => onPageChange(1)}>
            « First
          </button>
        </li>
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
          >
            ‹ Prev
          </button>
        </li>

        {/* Left Ellipsis */}
        {startPage > 1 && (
          <li className="page-item disabled">
            <span className="page-link">…</span>
          </li>
        )}

        {/* Page Numbers */}
        {pages}

        {/* Right Ellipsis */}
        {endPage < totalPages && (
          <li className="page-item disabled">
            <span className="page-link">…</span>
          </li>
        )}

        {/* Next & Last */}
        <li
          className={`page-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next ›
          </button>
        </li>
        <li
          className={`page-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button className="page-link" onClick={() => onPageChange(totalPages)}>
            Last »
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
