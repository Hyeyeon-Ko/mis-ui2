import React, { useState, useContext, useCallback, useEffect } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import DateFilter from '../../components/common/ConditionFilter';
import Table from '../../components/common/Table';
import ConfirmModal from '../../components/common/ConfirmModal';
import RejectReasonModal from '../../components/ReasonModal'; 
import ApprovalModal from './ApprovalModal';
import { AuthContext } from '../../components/AuthContext'; 
import '../../styles/list/MyApplyList.css';
import '../../styles/common/Page.css';
import axios from 'axios';
import { filterData } from '../../datas/listDatas';
import useListChange from '../../hooks/useListChange';
import Pagination from '../../components/common/Pagination';
import Loading from '../../components/common/Loading';



function MyApplyList() {
  const {handleFilterChange, filters, setFilters } = useListChange();
  const { auth } = useContext(AuthContext); 
  const [applications, setApplications] = useState([]); 
  const [filteredApplications, setFilteredApplications] = useState([]); 
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1); 
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [documentType, setDocumentType] = useState('');  
  const [showModal, setShowModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [viewedRejections, setViewedRejections] = useState(new Set(JSON.parse(localStorage.getItem('viewedRejections')) || []));
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [documentDetails, setDocumentDetails] = useState({});
  const [totalPages, setTotalPages] = useState('1')
  const [currentPage, setCurrentPage] = useState('1')
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  const fetchApplications = useCallback(async (pageIndex = 1,  pageSize = itemsPerPage, filters = {}) => {
    setLoading(true);

    try {
      const response = await axios.get(`/api/myApplyList2`, {
        params: {
          userId: auth.userId,
          pageIndex,
          pageSize,
          startDate: filters.startDate,
          endDate: filters.endDate,
          documentType: filters.documentType === '' || filters.documentType === undefined || filters.documentType == null ? null : filters.documentType,
          keyword: filters.keyword,
        },
      });
  
      const { myBcdResponses, myDocResponses, myCorpDocResponses, mySealResponses, pagedResult } = response.data.data;

      let combinedData = [];
      if(!pagedResult) {
        if(myBcdResponses != null) { 
          combinedData = combinedData.concat(myBcdResponses.content);
        }
        if(myDocResponses != null) { 
          combinedData = combinedData.concat(myDocResponses.content);
        }
        if(myCorpDocResponses != null) { 
          combinedData = combinedData.concat(myCorpDocResponses.content);
        }
        if(mySealResponses != null) { 
          combinedData = combinedData.concat(mySealResponses.content);
        }
      } else {
        combinedData = pagedResult.content || []; 
      }
  
      const uniqueData = combinedData.reduce((acc, current) => {
        const x = acc.find(item => item.draftId === current.draftId && item.docType === current.docType);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);

  
      const transformedData = uniqueData
        .filter(application => application.applyStatus !== 'X')
        .map(application => ({
          ...application,
          draftDate: application.draftDate ? parseDateTime(application.draftDate) : '',
          approvalDate: application.respondDate ? parseDateTime(application.respondDate) : '',
          drafter: application.drafter,
          applyStatus: getStatusText(application.applyStatus),
          rejectionReason: application.rejectReason,
          manager: application.approver || application.disapprover || '',
        }))
        .sort((a, b) => new Date(b.draftDate) - new Date(a.draftDate));
  
      setApplications(transformedData);
      setFilteredApplications(transformedData); 
      setTotalPages(totalPages);
      setCurrentPage(currentPage);
    } catch (error) {
      console.error('Error fetching applications:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [auth.userId, setTotalPages, setCurrentPage, currentPage, totalPages]);

  // const applyFilters = () => {
  const applyFilters = (filterValues) => {
    // filterValues에서 documentType과 기타 필터 값을 가져옴
    const { startDate, endDate, documentType, filters, keyword } = filterValues;
    
    const params = {
      startDate: startDate ? startDate.toISOString().split('T')[0] : '', // 시작일
      endDate: endDate ? endDate.toISOString().split('T')[0] : '', // 종료일
      documentType: documentType,
      keyword: keyword, // 검색어
    };

    // fetchApplications();
    fetchApplications(1, itemsPerPage, params);
  };

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const applyStatusFilters = useCallback(() => {
    let filteredData = applications;

    const selectedStatuses = [];
    if (filters.statusApproved) selectedStatuses.push('승인완료');
    if (filters.statusRejected) selectedStatuses.push('반려');
    if (filters.statusOrdered) selectedStatuses.push('발주완료');
    if (filters.statusClosed) selectedStatuses.push('처리완료');

    if (selectedStatuses.length > 0) {
      filteredData = filteredData.filter(application =>
        selectedStatuses.includes(application.applyStatus)
      );
    } else {
      filteredData = [...applications]; 
    }

    setFilteredApplications(filteredData);
  }, [applications, filters]);

  useEffect(() => {
    applyStatusFilters();
  }, [filters, applyStatusFilters]);

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
      case 'A': return '승인대기';
      case 'B': return '승인완료';
      case 'C': return '반려';
      case 'D': return '발주완료';
      case 'E': return '처리완료';
      case 'F': return '신청취소';
      case 'G': return '발급완료';
      default: return status;
    }
  };
      
  const handleReset = () => {
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
    setStartDate(defaultStartDate);
    setEndDate(new Date());
    setDocumentType('');  
    setFilters(filterData);
  
    fetchApplications(); 
  };
  
  const handleButtonClick = (application) => {
    setSelectedApplication(application);
    if (application.applyStatus === '반려') {
      setRejectionReason(application.rejectionReason);
      setShowRejectionModal(true);
    } else {
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
  };

  const handleCloseRejectionModal = () => {
    if (selectedApplication) {
      const newViewedRejections = new Set([...viewedRejections, selectedApplication.draftId]);
      setViewedRejections(newViewedRejections);
      localStorage.setItem('viewedRejections', JSON.stringify(Array.from(newViewedRejections)));
    }
    setShowRejectionModal(false);
    setSelectedApplication(null);
  };

  const handleConfirmModal = async () => {
    if (selectedApplication) {
      try {
        const apiUrl = selectedApplication.applyStatus === '발급완료' ? 
        '/api/corpDoc/completeApply' : 
        '/api/bcd/completeApply';

        await axios.put(apiUrl, null, {
          params: { draftId: selectedApplication.draftId }
        });

        const successMessage = selectedApplication.applyStatus === '발급완료' ? 
        '법인서류 수령이 확인되었습니다.' : 
        '명함 수령이 확인되었습니다.';

        alert(successMessage);
        fetchApplications(); 
      } catch (error) {
        console.error('Error completing application:', error.response?.data || error.message);
      } finally {
        setShowModal(false);
        setSelectedApplication(null);
      }
    }
  };

  const handleApprovalClick = (application) => {
    const allowedDocumentTypes = ['명함신청', '문서수신', '문서발신'];
    if (allowedDocumentTypes.includes(application.docType)) {
      setDocumentDetails({
        docType: application.docType,
        signitureImage: application.signitureImage || '',
        approvers: application.approvalLineResponses || [],
      });
      setShowApprovalModal(true);
    }
  };

  const handlePageClick = (event) => {
    const selectedPage = event.selected + 1;
    setCurrentPage(selectedPage);
  };
      
  const applicationColumns = [
    { header: '문서분류', accessor: 'docType', width: '11%' },
    { header: '제목', accessor: 'title', width: '30%' },
    { header: '신청일시', accessor: 'draftDate', width: '14%' },
    { header: '신청자', accessor: 'drafter', width: '9%' },
    { header: '승인/반려일시', accessor: 'approvalDate', width: '14%' },
    { header: '담당자', accessor: 'manager', width: '9%' },
    {
      header: '신청상태',
      accessor: 'applyStatus',
      width: '12%',
      Cell: ({ row }) => {
        const allowedDocumentTypes = ['명함신청', '문서수신', '문서발신'];
        const isAllowedDocType = allowedDocumentTypes.includes(row.docType);
    
        const isSpecialRoleAndTeam =
          (auth.roleNm === '팀장' || auth.roleNm === '본부장') &&
          (auth.teamCd === 'FDT12' || auth.teamCd === 'CNT2');
    
        return (row.applyStatus === '승인대기' || row.applyStatus === '승인완료') &&
          isAllowedDocType &&
          !isSpecialRoleAndTeam ? (
          <button
            className="status-button"
            style={{ color: '#2789FE', textDecoration: 'underline' }}
            onClick={() => handleApprovalClick(row)}
          >
            {row.applyStatus}
          </button>
        ) : row.applyStatus === '발주완료' || row.applyStatus === '발급완료' ? (
          <button className="status-button" onClick={() => handleButtonClick(row)}>
            수령확인
          </button>
        ) : row.applyStatus === '반려' ? (
          <button
            className="status-button"
            style={
              viewedRejections.has(row.draftId)
                ? { color: 'black', textDecoration: 'underline' }
                : { color: '#2789FE', textDecoration: 'underline' }
            }
            onClick={() => handleButtonClick(row)}
          >
            {row.applyStatus}
          </button>
        ) : row.applyStatus === '처리완료' ? (
          <span
            style={{
              fontWeight: row.applyStatus === '처리완료' ? 'bold' : 'normal',
              color: row.applyStatus === '처리완료'
                ? 'rgb(169, 169, 169)'
                : 'rgb(255, 255, 255)',
            }}
          >
            {row.applyStatus}
          </span>
        ) : (
          row.applyStatus
        );
      },
    },
  ];
  
  return (
    <div className="content">
      <div className="user-applications">
        <h2>전체 신청내역</h2>
        <Breadcrumb items={['나의 신청내역', '전체 신청내역']} />
        <DateFilter
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          documentType={documentType}
          setDocumentType={setDocumentType} 
          onSearch={applyFilters}
          onReset={handleReset}
          showStatusFilters={true}
          forceShowAllStatusFilters={true}
          filters={filters}
          setFilters={setFilters}
          onFilterChange={handleFilterChange}
          searchOptions={[]}          
        />
        {loading ? (
          <Loading />
        ) : (
          <>
          <Table columns={applicationColumns} data={filteredApplications} />
          <Pagination totalPages={totalPages} onPageChange={handlePageClick} />
        </>

        )}
      </div>
      {showModal && (
        <ConfirmModal
          message={selectedApplication.applyStatus === '발급완료' ? "법인서류를 수령하셨습니까?" : "명함을 수령하셨습니까?"}
          onConfirm={handleConfirmModal}
          onCancel={handleCloseModal}
        />
      )}
      {showRejectionModal && (
        <RejectReasonModal
          show={showRejectionModal}
          onClose={handleCloseRejectionModal}
          onConfirm={() => {}}
          reason={rejectionReason}
          isViewOnly={true}
          modalType="reject"
        />
      )}
      {showApprovalModal && (
        <ApprovalModal
          show={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          documentDetails={documentDetails}
        />
      )}
    </div>
  );
}

export default MyApplyList;
