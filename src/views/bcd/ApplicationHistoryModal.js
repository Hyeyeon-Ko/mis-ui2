import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import ConditionFilter from '../../components/common/ConditionFilter';
import Table from '../../components/common/Table';
import '../../styles/ApplicationHistoryModal.css';

/* 신청 이력 모달 */
const ApplicationHistoryModal = ({ show, onClose, draftId }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const fetchHistory = useCallback(async (draftId) => {
    try {
      const response = await axios.get(`/api/bcd/applyList/history/${draftId}`);
      const transformedData = response.data.data.map((item) => ({
        ...item,
        applyStatus: getStatusText(item.applyStatus),
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
        return '완료';
      case 'F':
        return '신청취소';
      default:
        return status;
    }
  };

  const handleSearch = (filterParams) => {
    const { startDate, endDate, documentType } = filterParams;
    const newData = data.filter((item) => {
      const itemDate = new Date(item.draftDate);
      const matchesDate =
        (!startDate || itemDate >= new Date(startDate)) &&
        (!endDate || itemDate <= new Date(endDate));
      const matchesDocumentType =
        !documentType || item.title.includes(documentType);
      return matchesDate && matchesDocumentType;
    });
    setFilteredData(newData);
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setDocumentType('');
    setFilteredData(data);
  };

  if (!show) return null;

  const columns = [
    { header: '제목', accessor: 'title', width: '40%' },
    { header: '기안일시', accessor: 'draftDate', width: '20%' },
    { header: '문서상태', accessor: 'applyStatus', width: '20%' },
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
            documentType={documentType}
            setDocumentType={setDocumentType}
            onSearch={handleSearch}
            onReset={handleReset}
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
