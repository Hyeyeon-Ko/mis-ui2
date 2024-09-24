import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import ConditionFilter from '../../components/common/ConditionFilter';
import Table from '../../components/common/Table';
import '../../styles/bcd/ApplicationHistoryModal.css';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

/* 신청 이력 모달 */
const ApplicationHistoryModal = ({ show, onClose, draftId }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const fetchHistory = useCallback(async (draftId) => {
    try {
      const response = await axios.get(`/api/bcd/applyList/history/${draftId}`);
      const transformedData = response.data.data.map((item) => ({
        ...item,
        applyStatus: getStatusText(item.applyStatus),
        draftDate: parseDateTime(item.draftDate), 
      }));
      setData(transformedData);
      setFilteredData(transformedData); 
    } catch (error) {
      console.error('Error fetching application history:', error);
    }
  }, []);

  useEffect(() => {
    if (draftId) {
      fetchHistory(draftId);
    }
  }, [draftId, fetchHistory]);

  const parseDateTime = (dateString) => {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'A':
        return '승인대기';
      case 'B':
        return '승인완료';
      case 'C':
        return '반려';
      case 'D':
        return '발주완료';
      case 'E':
        return '처리완료';
      case 'F':
        return '신청취소';
      default:
        return status;
    }
  };

  const handleSearch = () => {
    const newData = data.filter((item) => {
      const itemDate = new Date(item.draftDate);
      const matchesDate =
        (!startDate || itemDate >= new Date(startDate)) &&
        (!endDate || itemDate <= new Date(endDate));
      return matchesDate;
    });
    setFilteredData(newData); 
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setFilteredData(data); 
  };

  if (!show) return null;

  const columns = [
    { header: '제목', accessor: 'title', width: '40%' },
    { header: '신청일시', accessor: 'draftDate', width: '20%' },
    { header: '수량', accessor: 'quantity', width: '10%' }, 
    { header: '문서상태', accessor: 'applyStatus', width: '18%' },
  ];

  return (
    <div className="history-modal-overlay">
      <div className="history-modal-container">
        <div className="modal-header">
          <h3>신청 이력</h3>
          <button
            type="button"
            className="history-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="condition-filter-container">
          <ConditionFilter
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onSearch={handleSearch}
            onReset={handleReset}
            showDocumentType={false}
            showSearchCondition={false}
          />
        </div>
        <div className="table-container">
          <Table columns={columns} data={filteredData} />
        </div>
      </div>
    </div>
  );
};

ApplicationHistoryModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  draftId: PropTypes.string.isRequired,
};

export default ApplicationHistoryModal;
