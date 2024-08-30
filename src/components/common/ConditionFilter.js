import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import '../../styles/common/ConditionFilter.css';

const ConditionFilter = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onSearch,
  onReset,
  filters = {
    statusApproved: false,
    statusRejected: false,
    statusOrdered: false,
    statusClosed: false,
  },
  setFilters = () => {},
  onFilterChange,
  showStatusFilters,
  showSearchCondition,
  showDocumentType = true, 
  excludeRecipient,
  excludeSender,
  documentType,
  setDocumentType,
}) => {
  const [searchType, setSearchType] = useState('전체');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    resetFilters();
  }, []); 
  
  const resetFilters = () => {
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
    setStartDate(defaultStartDate);
    setEndDate(new Date());
    setSearchType('전체');
    setKeyword('');
    if (onReset) onReset();
    setFilters({
      statusApproved: false,
      statusRejected: false,
      statusOrdered: false,
      statusClosed: false,
    });
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleReset = () => {
    resetFilters();
  };

  const handleSearch = () => {
    const searchParams = {
      searchType,
      keyword,
    };
    onSearch(searchParams);
  };
    
  const handleStartDateChange = (event) => {
    setStartDate(event.target.value ? new Date(event.target.value) : null);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value ? new Date(event.target.value) : null);
  };

  const handleDocumentTypeChange = (event) => {
    setDocumentType(event.target.value); 
  };

  return (
    <div className="all-application-filter-container">
      <div className="all-application-filter">
        <label>신청일자</label>
        <input
          type="date"
          value={startDate ? formatDate(startDate) : formatDate(new Date(new Date().setMonth(new Date().getMonth() - 1)))}
          onChange={handleStartDateChange}
          className="custom-datepicker"
        />
        <span> ~ </span>
        <input
          type="date"
          value={endDate ? formatDate(endDate) : formatDate(new Date())}
          onChange={handleEndDateChange}
          className="custom-datepicker"
        />
        {showDocumentType && ( 
          <>
            <label>문서분류</label>
            <select
              value={documentType}
              onChange={handleDocumentTypeChange}
            >
              <option value="">전체</option>
              <option value="명함신청">명함신청</option>
              <option value="문서수신">문서수신</option>
              <option value="문서발신">문서발신</option>
              <option value="인장신청(날인)">인장신청(날인)</option>
              <option value="인장신청(반출)">인장신청(반출)</option>
              <option value="법인서류">법인서류</option>
            </select>
          </>
        )}
        {showSearchCondition && (
          <>
            <label>검색 조건</label>
            <select 
              value={searchType} 
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="전체">전체</option>
              {(documentType === '명함신청' || documentType === '문서수발신' 
                || documentType === '인장신청' || documentType === '법인서류'
              ) ? (
                <>
                  <option value="제목">제목</option>
                  <option value="신청자">신청자</option>
                </>
              ) : (
                <>
                  {!excludeSender && <option value="발신처">발신처</option>}
                  {!excludeRecipient && <option value="수신처">수신처</option>}
                  <option value="제목">제목</option>
                  <option value="접수인">접수인</option>
                </>
              )}
            </select>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="검색어 입력"
            />
          </>
        )}
        <button className="reset-button" onClick={handleReset}>
          <span className="reset-text">↻ 초기화</span>
        </button>
        <Button onClick={handleSearch} className="search-button">조 회</Button>
      </div>
      {showStatusFilters && (
        <div className="status-filters">
          {(documentType === '명함신청' || documentType === '법인서류') && (
            <label>
              <input
                type="checkbox"
                name="statusApproved"
                checked={filters.statusApproved}
                onChange={onFilterChange}
              />
              승인완료
            </label>
          )}
          {documentType !== '문서수발신' && (
            <label>
              <input
                type="checkbox"
                name="statusRejected"
                checked={filters.statusRejected}
                onChange={onFilterChange}
              />
              반려
            </label>
          )}
          {documentType === '명함신청' && (
            <label>
              <input
                type="checkbox"
                name="statusOrdered"
                checked={filters.statusOrdered}
                onChange={onFilterChange}
              />
              발주완료
            </label>
          )}
          <label>
            <input
              type="checkbox"
              name="statusClosed"
              checked={filters.statusClosed}
              onChange={onFilterChange}
            />
            처리완료
          </label>
        </div>
      )}
    </div>
  );
};

ConditionFilter.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  setStartDate: PropTypes.func.isRequired,
  endDate: PropTypes.instanceOf(Date),
  setEndDate: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  filters: PropTypes.object,
  setFilters: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func,
  showStatusFilters: PropTypes.bool,
  showSearchCondition: PropTypes.bool,
  showDocumentType: PropTypes.bool,  
  documentType: PropTypes.string,
  setDocumentType: PropTypes.func.isRequired, 
};

export default ConditionFilter;
