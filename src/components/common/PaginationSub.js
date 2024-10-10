import React from 'react';
import ReactPaginate from 'react-paginate';
import '../../styles/common/Pagination.css';

function PaginationSub({ totalPages, onPageChange, currentPage }) {
  return (
    <div className='pagination-layout'>
    <ReactPaginate
        breakLabel={''}
        nextLabel=">"
        onPageChange={onPageChange}
        pageRangeDisplayed={5} 
        pageCount={totalPages} 
        previousLabel="<"
        renderOnZeroPageCount={null}
        containerClassName="pagination"
        activeClassName="active"
        forcePage={currentPage - 1} 
    />
    </div>
  );
}

export default PaginationSub;