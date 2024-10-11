import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import ConditionFilter from '../../components/common/ConditionFilter';
import Table from '../../components/common/Table';
import PaginationSub from '../../components/common/PaginationSub';
import '../../styles/bcd/ApplicationHistoryModal.css';

/* 신청 이력 모달 */
const ApplicationHistoryModal = ({ show, onClose, draftId }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState("1"); 
  const [totalPages, setTotalPages] = useState("1"); 

  const itemsPerPage = 10;
 
  const getOneMonthAgo = () => {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    return oneMonthAgo;
  };

  const fetchHistory = useCallback(
    async (draftId, startDate, endDate, pageIndex = 1, pageSize = itemsPerPage) => {
      try {
        const response = await axios.get(
          `/api/bcd/applyList/history2/${draftId}`,
          {
            params: {
              startDate: startDate ? startDate.toISOString().split('T')[0] : null,
              endDate: endDate ? endDate.toISOString().split('T')[0] : null,
              pageIndex,
              pageSize,
              },
          }
        );
        const transformedData = response.data.data.content.map((item) => ({
          ...item,
          applyStatus: getStatusText(item.applyStatus),
          draftDate: parseDateTime(item.draftDate),
        }));
        setFilteredData(transformedData);
        setTotalPages(response.data.data.totalPages); 
      } catch (error) {
        console.error('Error fetching application history:', error);
      }
    },
    []
  );

  useEffect(() => {
    if (draftId && show) {
      const defaultStartDate = getOneMonthAgo();
      const defaultEndDate = new Date();
      setStartDate(defaultStartDate);
      setEndDate(defaultEndDate);
      fetchHistory(draftId, defaultStartDate, defaultEndDate, currentPage, itemsPerPage);
    }
  }, [draftId, show, fetchHistory, currentPage]);

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
    setCurrentPage("1"); 
    fetchHistory(draftId, startDate, endDate, 1);
  };

  const handleReset = () => {
    const defaultStartDate = getOneMonthAgo();
    const defaultEndDate = new Date();
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    setCurrentPage("1");
    fetchHistory(draftId, defaultStartDate, defaultEndDate, 1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage); 
    fetchHistory(draftId, startDate, endDate, newPage);
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
          setStartDate={(date) => {
            console.log('Start Date set to:', date);
            setStartDate(date);
          }}
          endDate={endDate}
          setEndDate={(date) => {
            console.log('End Date set to:', date);
            setEndDate(date);
          }}
          onSearch={handleSearch}
          onReset={handleReset}
          showDocumentType={false}
          showSearchCondition={false}
        />
        </div>
        <div className="table-container">
          <Table columns={columns} data={filteredData} />
          <PaginationSub
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
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
