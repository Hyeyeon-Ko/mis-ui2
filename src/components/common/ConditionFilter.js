import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PropTypes from 'prop-types';
import Button from '../common/Button'; 
import '../../styles/common/ConditionFilter.css';
import resetIcon from '../../assets/images/reset.png';

const ConditionFilter = ({ startDate, setStartDate, endDate, setEndDate, onSearch }) => {
  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
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
        <select>
          <option value="all">전체</option>
        </select>
        <button className="reset-button" onClick={handleReset}>
          <img src={resetIcon} alt="Reset" className="reset-icon" />
          <span className="reset-text">초기화</span>
        </button>
        <Button onClick={onSearch} className="search-button">조회</Button>
      </div>
    </div>
  );
};

ConditionFilter.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  setStartDate: PropTypes.func.isRequired,
  endDate: PropTypes.instanceOf(Date),
  setEndDate: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default ConditionFilter;
