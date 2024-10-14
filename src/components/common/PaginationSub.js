import React from "react";
import "../../styles/common/PaginationSub.css";

function PaginationSub({ totalPages, onPageChange, currentPage }) {
  const pageGroupSize = 5;

  const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
  const startPage = currentGroup * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);

  return (
    <div className="pagination-sub-layout">
      <button
        onClick={() => onPageChange({ selected: Math.max(0, startPage - 2) })} 
        disabled={startPage === 1}
        className={`pagination-sub-button ${startPage === 1 ? 'disabled' : ''}`}
      >
        &lt;
      </button>
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange({ selected: page - 1 })} 
          className={`pagination-sub-button ${currentPage === page ? 'active' : ''}`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange({ selected: Math.min(totalPages - 1, endPage) })} 
        disabled={endPage === totalPages}
        className={`pagination-sub-button ${endPage === totalPages ? 'disabled' : ''}`}
      >
        &gt;
      </button>
    </div>
  );
}

export default PaginationSub;
