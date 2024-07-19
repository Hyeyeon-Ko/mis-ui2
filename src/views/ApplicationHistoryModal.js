import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import ConditionFilter from '../components/common/ConditionFilter';
import Table from '../components/common/Table';
import '../styles/ApplicationHistoryModal.css';

/* 신청이력 모달 */
const ApplicationHistoryModal = ({ show, onClose, draftId }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (draftId) {
      fetchHistory(draftId);
    }
  }, [draftId]);

  const fetchHistory = async (draftId) => {
    try {
      const response = await axios.get(`/api/bcd/applyList/history/${draftId}`);
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching application history:', error);
    }
  };

  const columns = [
    { header: '제목', accessor: 'title', width: '40%' },
    { header: '기안일시', accessor: 'draftDate', width: '20%' },
    { header: '문서상태', accessor: 'applyStatus', width: '20%' }
  ];

  const filteredData = data.filter(item => {
    const itemDate = new Date(item.draftDate);
    return (
      (!startDate || itemDate >= startDate) &&
      (!endDate || itemDate <= endDate)
    );
  });

  if (!show) return null;

  return (
    <div className="history-modal-overlay">
      <div className="history-modal-container">
        <h3>신청이력</h3>
        <button className="history-modal-close" onClick={onClose}>×</button>
        <ConditionFilter
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
        {startDate && endDate ? (
          <Table columns={columns} data={filteredData} />
        ) : (
          <Table columns={columns} data={data} />
        )}
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
