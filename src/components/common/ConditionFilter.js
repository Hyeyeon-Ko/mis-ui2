import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button';
import useDateSet from '../../hooks/apply/useDateSet';

import '../../styles/common/ConditionFilter.css';

const ConditionFilter = ({
  onSearch,
  onReset,
//  showStatus,
  showStatusFilters,
  showSearchCondition,
  showDocumentType = true,
  searchOptions = [],
  forceShowAllStatusFilters = false,
  startDateLabel = '신청일자',
}) => {
  // useDateSet에서 기본 시작일과 종료일을 가져옴
  const { formattedStartDate, formattedEndDate } = useDateSet();

  // 내부 상태 관리
  const [startDate, setStartDate] = useState(new Date(formattedStartDate));
  const [endDate, setEndDate] = useState(new Date(formattedEndDate));
  const [filters, setFilters] = useState({
    statusApproved: false,
    statusRejected: false,
    statusOrdered: false,
    statusClosed: false,
    statusReceived: false,
  });
  const [documentType, setDocumentType] = useState('');
  const [searchType, setSearchType] = useState('전체');
  const [keyword, setKeyword] = useState('');

  // 필터 초기화 함수
  const resetFilters = () => {
    setStartDate(new Date(formattedStartDate));
    setEndDate(new Date(formattedEndDate));
    setSearchType('전체');
    setKeyword('');
    setFilters({
      statusApproved: false,
      statusRejected: false,
      statusOrdered: false,
      statusClosed: false,
      statusReceived: false
    });

    // 외부에서 넘겨받은 리셋 핸들러 호출
    if (onReset) {
      onReset();
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // 필터 상태 변경 함수
  const handleFilterChange = (event) => {
    const { name, checked } = event.target;
    setFilters((prev) => ({ ...prev, [name]: checked }));
  };

  // 검색 버튼 클릭 시 호출할 함수
  const handleSearch = () => {
    // onSearch();
    onSearch({
      startDate,
      endDate,
      documentType,
      searchType,
      filters,
      keyword,
    });
  };

  const handleStartDateChange = (event) => {
    setStartDate(new Date(event.target.value));
  };

  const handleEndDateChange = (event) => {
    setEndDate(new Date(event.target.value));
  };

  const handleDocumentTypeChange = (event) => {
    setDocumentType(event.target.value);
  };

  const renderStatusFilters = () => {
    if (forceShowAllStatusFilters) {
      return (
        <>
          <label>
            <input
              type="checkbox"
              name="statusApproved"
              checked={filters.statusApproved}
              onChange={handleFilterChange}
            />
            승인완료
          </label>
          <label>
            <input
              type="checkbox"
              name="statusRejected"
              checked={filters.statusRejected}
              onChange={handleFilterChange}
            />
            반려
          </label>
          <label>
            <input
              type="checkbox"
              name="statusOrdered"
              checked={filters.statusOrdered}
              onChange={handleFilterChange}
            />
            발주완료
          </label>
          <label>
            <input
              type="checkbox"
              name="statusClosed"
              checked={filters.statusClosed}
              onChange={handleFilterChange}
            />
            처리완료
          </label>
          <label>
            <input
              type="checkbox"
              name="statusReceived"
              checked={filters.statusReceived}
              onChange={handleFilterChange}
            />
            발급완료
          </label>
        </>
      );
    }

    switch (documentType) {
      case '명함신청':
        return (
          <>
            <label>
              <input
                type="checkbox"
                name="statusApproved"
                checked={filters.statusApproved}
                onChange={handleFilterChange}
              />
              승인완료
            </label>
            <label>
              <input
                type="checkbox"
                name="statusRejected"
                checked={filters.statusRejected}
                onChange={handleFilterChange}
              />
              반려
            </label>
            <label>
              <input
                type="checkbox"
                name="statusOrdered"
                checked={filters.statusOrdered}
                onChange={handleFilterChange}
              />
              발주완료
            </label>
            <label>
              <input
                type="checkbox"
                name="statusClosed"
                checked={filters.statusClosed}
                onChange={handleFilterChange}
              />
              처리완료
            </label>
          </>
        );
      case '문서수발신':
        return (
          <label>
            <input
              type="checkbox"
              name="statusClosed"
              checked={filters.statusClosed}
              onChange={handleFilterChange}
            />
            처리완료
          </label>
        );
      case '인장신청':
        return (
          <>
            <label>
              <input
                type="checkbox"
                name="statusRejected"
                checked={filters.statusRejected}
                onChange={handleFilterChange}
              />
              반려
            </label>
            <label>
              <input
                type="checkbox"
                name="statusClosed"
                checked={filters.statusClosed}
                onChange={handleFilterChange}
              />
              처리완료
            </label>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="all-application-filter-container">
      <div className="all-application-filter">
        <label>{startDateLabel}</label>
        <input
          type="date"
          value={startDate ? formatDate(startDate) : ''}
          onChange={handleStartDateChange}
          className="custom-datepicker"
        />
        <span> ~ </span>
        <input
          type="date"
          value={endDate ? formatDate(endDate) : ''}
          onChange={handleEndDateChange}
          className="custom-datepicker"
        />
        {showDocumentType && (
          <>
            <label>신청분류</label>
            <select
              value={documentType}
              onChange={handleDocumentTypeChange}
            >
              <option value="">전체</option>
              <option value="A">명함신청</option>
              <option value="B">문서수발신</option>
              <option value="E">토너신청</option>
              {/* <option value="C">법인서류</option>
              <option value="D">인장신청</option> */}
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
              {searchOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="검색어 입력"
            />
          </>
        )}
        <button className="reset-button" onClick={resetFilters}>
          <span className="reset-text">↻ 초기화</span>
        </button>
        <Button onClick={handleSearch} className="search-button">조 회</Button>
      </div>
      {showStatusFilters && (
        <div className="status-filters">
          {renderStatusFilters()}
        </div>
      )}
    </div>
  );
};

ConditionFilter.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  showStatusFilters: PropTypes.bool,
  showSearchCondition: PropTypes.bool,
  showDocumentType: PropTypes.bool,
  searchOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  forceShowAllStatusFilters: PropTypes.bool,
  startDateLabel: PropTypes.string,
};

export default ConditionFilter;