import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ConditionFilter from '../components/common/ConditionFilter';
import Table from '../components/common/Table';
import '../styles/ApplicationHistoryModal.css';

const ApplicationHistoryModal = ({ show, onClose }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const columns = [
    { header: '제목', accessor: 'title', width: '40%' },
    { header: '기안일시', accessor: 'draftDate', width: '20%' },
    { header: '문서상태', accessor: 'status', width: '20%' }
  ];

  const data = [
    { title: '문서1', draftDate: '2023-07-01', status: '승인' },
    { title: '문서2', draftDate: '2023-07-02', status: '반려' }
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
          <p className="no-data-message">조회하고자 하는 기안 일자를 설정하세요.</p>
        )}
      </div>
    </div>
  );
};

ApplicationHistoryModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ApplicationHistoryModal;
