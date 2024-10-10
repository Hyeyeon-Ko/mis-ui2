import React from 'react';
import ReactPaginate from 'react-paginate';
import '../../styles/common/Pagination.css';

function Pagination({ totalPages, onPageChange }) {
  return (
    <div className='pagination-layout'>
    <ReactPaginate
        nextLabel=">"
        onPageChange={onPageChange}
        pageRangeDisplayed={Math.ceil(totalPages)}
        pageCount={Math.ceil(totalPages)}
        previousLabel="<"
        renderOnZeroPageCount={null}
        containerClassName="pagination"
        activeClassName="active"
        breakLabel={''}
    />
    </div>
  );
}

// FIXME: forcePage={currentPage - 1} 추가 해야 함, props로 currentPage 넘겨줌
// 문제점: 페이지네이션이 적용된 곳에서 의존성 때문에 무한 루프 돌게 됨
/* 
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
/> */

export default Pagination;



