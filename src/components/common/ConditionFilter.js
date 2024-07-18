import React, { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PropTypes from 'prop-types';
import Button from '../common/Button'; 
import '../../styles/common/ConditionFilter.css';
import resetIcon from '../../assets/images/reset.png';

const ConditionFilter = ({ startDate, setStartDate, endDate, setEndDate, documentType, setDocumentType, onSearch, onReset }) => {
  useEffect(() => {
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
    setStartDate(defaultStartDate);
    setEndDate(new Date());
  }, [setStartDate, setEndDate]);

  const handleDocumentTypeChange = (event) => {
    setDocumentType(event.target.value === '전체' ? '' : event.target.value);
  };

  const handleReset = () => {
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
    setStartDate(defaultStartDate);
    setEndDate(new Date());
    setDocumentType('');
    onReset();
  };

  const handleSearch = () => {
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
    onSearch({
      documentType,
      startDate: startDate ? startDate.toISOString().split('T')[0] : '',
      endDate: adjustedEndDate.toISOString().split('T')[0],
    });
  };

  return (
    <div className="all-application-filter-container">
      <div className="all-application-filter">
        <label>기안일자</label>
        <DatePicker
          selected={startDate ? new Date(startDate) : null}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate ? new Date(startDate) : null}
          endDate={endDate ? new Date(endDate) : null}
          dateFormat="yyyy-MM-dd"
          className="custom-datepicker"
        />
        <span> ~ </span>
        <DatePicker
          selected={endDate ? new Date(endDate) : null}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate ? new Date(startDate) : null}
          endDate={endDate ? new Date(endDate) : null}
          minDate={startDate ? new Date(startDate) : null}
          dateFormat="yyyy-MM-dd"
          className="custom-datepicker"
        />
        <label>문서분류</label>
        <select value={documentType} onChange={handleDocumentTypeChange}>
          <option value="전체">전체</option>
          <option value="명함신청">명함신청</option>
          <option value="법인서류">법인서류</option>
          <option value="인장관리">인장관리</option>
          <option value="문서수발신">문서수발신</option>
        </select>
        <button className="reset-button" onClick={handleReset}>
          <img src={resetIcon} alt="Reset" className="reset-icon" />
          <span className="reset-text">초기화</span>
        </button>
        <Button onClick={handleSearch} className="search-button">조회</Button>
      </div>
    </div>
  );
};

ConditionFilter.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  setStartDate: PropTypes.func.isRequired,
  endDate: PropTypes.instanceOf(Date),
  setEndDate: PropTypes.func.isRequired,
  documentType: PropTypes.string.isRequired,
  setDocumentType: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default ConditionFilter;
