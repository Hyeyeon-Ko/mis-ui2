import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '../common/Button'; 
import '../../styles/common/ConditionFilter.css';

const ConditionFilter = ({ startDate, setStartDate, endDate, setEndDate, documentType, setDocumentType, onSearch, onReset, filters, onFilterChange, showStatusFilters, showDocumentType }) => {
  useEffect(() => {
    resetFilters();
  }, []);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const resetFilters = () => {
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
    setStartDate(defaultStartDate);
    setEndDate(new Date());
    if (setDocumentType) setDocumentType('');
    if (onReset) onReset();
  };

  const handleDocumentTypeChange = (event) => {
    setDocumentType(event.target.value === '전체' ? '' : event.target.value);
  };

  const handleReset = () => {
    resetFilters();
  };

  const handleSearch = () => {
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
    onSearch({
      documentType,
      startDate: startDate ? formatDate(startDate) : '',
      endDate: endDate ? formatDate(adjustedEndDate) : '',
    });
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value ? new Date(event.target.value) : null);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value ? new Date(event.target.value) : null);
  };

  return (
    <div className="all-application-filter-container">
      <div className="all-application-filter">
        <label>기안일자</label>
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
        {showDocumentType && setDocumentType && (
          <>
            <label>문서분류</label>
            <select value={documentType} onChange={handleDocumentTypeChange}>
              <option value="전체">전체</option>
              <option value="명함신청">명함신청</option>
              <option value="법인서류">법인서류</option>
              <option value="인장관리">인장관리</option>
              <option value="문서수발신">문서수발신</option>
            </select>
          </>
        )}
        <button className="reset-button" onClick={handleReset}>
          <span className="reset-text">↻ 초기화</span>
        </button>
        <Button onClick={handleSearch} className="search-button">조  회</Button>
      </div>
      {showStatusFilters && (
        <div className="status-filters">
          <label>
            <input
              type="checkbox"
              name="statusApproved"
              checked={filters.statusApproved}
              onChange={onFilterChange}
            />
            승인완료
          </label>
          <label>
            <input
              type="checkbox"
              name="statusRejected"
              checked={filters.statusRejected}
              onChange={onFilterChange}
            />
            반려
          </label>
          <label>
            <input
              type="checkbox"
              name="statusOrdered"
              checked={filters.statusOrdered}
              onChange={onFilterChange}
            />
            발주완료
          </label>
          <label>
            <input
              type="checkbox"
              name="statusClosed"
              checked={filters.statusClosed}
              onChange={onFilterChange}
            />
            완료
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
  documentType: PropTypes.string,
  setDocumentType: PropTypes.func,
  onSearch: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  filters: PropTypes.object,
  onFilterChange: PropTypes.func,
  showStatusFilters: PropTypes.bool,
  showDocumentType: PropTypes.bool,
};

export default ConditionFilter;
