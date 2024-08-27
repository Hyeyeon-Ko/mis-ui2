import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';
import ConditionFilter from '../../components/common/ConditionFilter';
import Table from '../../components/common/Table';
import CustomButton from '../../components/common/CustomButton';
import DocConfirmModal from '../doc/DocConfirmModal';
import '../../styles/list/ApplicationsList.css';
import '../../styles/common/Page.css';
import axios from 'axios';
import fileDownload from 'js-file-download';
import { AuthContext } from '../../components/AuthContext';

function ApplicationsList() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const documentTypeFromUrl = queryParams.get('documentType');

  const { auth } = useContext(AuthContext);
  const instCd = auth.instCd;

  const [applications, setApplications] = useState([]);
  const [filterInputs, setFilterInputs] = useState({
    startDate: null,
    endDate: null,
    documentType: documentTypeFromUrl || '',
    searchType: '전체',
    keyword: '',
  });
  const [filters, setFilters] = useState({
    statusApproved: false,
    statusRejected: false,
    statusOrdered: false,
    statusClosed: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCheckboxColumn, setShowCheckboxColumn] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [selectedApplyStatus, setSelectedApplyStatus] = useState(null);
  const [showExcelButton, setShowExcelButton] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const navigate = useNavigate();

  const getBreadcrumbItems = () => {
    switch (documentTypeFromUrl) {
      case '명함신청':
        return ['명함 관리', '전체 신청내역'];
      case '인장신청':
        return ['인장 관리', '전체 신청내역'];
      case '법인서류':
        return ['법인서류 관리', '전체 신청내역'];
      case '문서수발신':
        return ['문서수발신 관리', '전체 신청내역'];
      default:
        return ['신청내역 관리', '전체 신청내역'];
    }
  };

  const fetchApplications = useCallback(async (filterParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/applyList', {
        params: {
          documentType: filterParams.documentType || documentTypeFromUrl || null,
          startDate: filterParams.startDate || '',
          endDate: filterParams.endDate || '',
          searchType: filterParams.searchType || '전체',
          keyword: filterParams.keyword || '', 
          instCd: instCd || '',
        },
      });

      const { bcdMasterResponses, docMasterResponses } = response.data.data;
      const bcdData = Array.isArray(bcdMasterResponses) ? bcdMasterResponses : [];
      const docData = Array.isArray(docMasterResponses) ? docMasterResponses : [];

      const transformedData = [...bcdData, ...docData].map(application => ({
        draftId: application.draftId,
        instCd: application.instCd,
        instNm: application.instNm,
        title: application.title,
        draftDate: application.draftDate ? parseDateTime(application.draftDate) : '',
        respondDate: application.respondDate ? parseDateTime(application.respondDate) : '',
        orderDate: application.orderDate ? parseDateTime(application.orderDate) : '',
        drafter: application.drafter,
        applyStatus: getStatusText(application.applyStatus),
        docType: application.docType,
      }));

      transformedData.sort((a, b) => new Date(b.draftDate) - new Date(a.draftDate));

      setApplications(transformedData);
      console.log('Fetched Applications:', transformedData);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [documentTypeFromUrl, instCd]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    if (documentTypeFromUrl === '명함신청') {
      const isShowExcelButton = filters.statusClosed && selectedApplications.length > 0;
      setShowCheckboxColumn(filters.statusClosed);
      setShowExcelButton(isShowExcelButton);
    } else {
      setShowCheckboxColumn(false);
      setShowExcelButton(false);
    }
  }, [filters, selectedApplications, documentTypeFromUrl]);

  const parseDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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

  const handleFilterChange = (e) => {
    const { name } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: !prevFilters[name],
    }));
  };

  const handleSearch = () => {
    console.log('Filter Inputs on Search:', filterInputs); // 추가
    fetchApplications({
      documentType: filterInputs.documentType,
      startDate: filterInputs.startDate ? filterInputs.startDate.toISOString().split('T')[0] : '',
      endDate: filterInputs.endDate ? filterInputs.endDate.toISOString().split('T')[0] : '',
      searchType: filterInputs.searchType,
      keyword: filterInputs.keyword,
    });
  };

  const handleReset = () => {
    setFilterInputs({ startDate: null, endDate: null, documentType: documentTypeFromUrl || '', searchType: '전체', keyword: '', });
    setFilters({
      statusApproved: false,
      statusRejected: false,
      statusOrdered: false,
      statusClosed: false,
    });
    fetchApplications();
  };

  const isAnyFilterActive = Object.values(filters).some((value) => value);

  const filteredApplications = applications.filter((application) => {
    if (isAnyFilterActive) {
      if (filters.statusApproved && application.applyStatus === '승인완료') return true;
      if (filters.statusRejected && application.applyStatus === '반려') return true;
      if (filters.statusOrdered && application.applyStatus === '발주완료') return true;
      if (filters.statusClosed && application.applyStatus === '처리완료') return true;
      return false;
    }

    if (filterInputs.searchType !== '전체' && filterInputs.keyword) {
      const keyword = filterInputs.keyword.toLowerCase();
      switch (filterInputs.searchType) {
        case '제목':
          return application.title.toLowerCase().includes(keyword);
        case '신청자':
          return application.drafter.toLowerCase().includes(keyword);
        default:
          return false;
      }
    }

    return true;
  });

  const handleSelectAll = (isChecked) => {
    setSelectedApplications(isChecked ? filteredApplications.map(app => app.draftId) : []);
  };

  const handleSelect = (isChecked, id) => {
    setSelectedApplications(isChecked
      ? [...selectedApplications, id]
      : selectedApplications.filter(appId => appId !== id)
    );
  };

  const handleExcelDownload = async () => {
    if (selectedApplications.length === 0) {
      alert('엑셀변환 할 명함 신청 목록을 선택하세요.');
      return;
    }

    try {
      const response = await axios.post('/api/bsc/applyList/orderExcel', selectedApplications, {
        responseType: 'blob',
      });
      fileDownload(response.data, '명함 완료내역.xlsx');
    } catch (error) {
      console.error('Error downloading excel: ', error);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDocumentId(null);
  };

  const approveDocument = async (documentId) => {
    try {
      await axios.put(`/api/doc/confirm`, null, {
        params: { draftId: documentId },
      });
      alert('승인이 완료되었습니다.');
      closeModal();
      fetchApplications(filterInputs);
    } catch (error) {
      console.error('Error approving document:', error);
      alert('Error approving document.');
    }
  };

  const handleRowClick = (draftId, docType, applyStatus) => {
    if (docType === '문서수신' || docType === '문서발신') {
      setSelectedDocumentId(draftId);
      setModalVisible(true);
      setSelectedApplyStatus(applyStatus); 
    } else if (docType === '명함신청') {
      navigate(`/api/bcd/applyList/${draftId}?readonly=true&applyStatus=${applyStatus}`);
    }
  };
  
  const columns = [
    ...(showCheckboxColumn && documentTypeFromUrl === '명함신청' ? [{
      header: <input type="checkbox" onChange={(e) => handleSelectAll(e.target.checked)} />,
      accessor: 'select',
      width: '5%',
      Cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedApplications.includes(row.draftId)}
          onChange={(e) => handleSelect(e.target.checked, row.draftId)}
        />
      ),
    }] : []),
    { header: '문서분류', accessor: 'docType', width: '10%' },
    {
      header: '제목',
      accessor: 'title',
      width: '24%',
      Cell: ({ row }) => (
        <span
          className="status-pending clickable"
          onClick={() => handleRowClick(row.draftId, row.docType, row.applyStatus)}
        >
          {row.title}
        </span>
      ),
    },
    { header: '신청일시', accessor: 'draftDate', width: '13%' },
    { header: '신청자', accessor: 'drafter', width: '6%' },
    {
      header: documentTypeFromUrl === '문서수발신' ? '승인일시' : '승인/반려일시',
      accessor: 'respondDate',
      width: '13%',
    },
    ...(documentTypeFromUrl === '문서수발신' ? [] : [
      { header: '발주일시', accessor: 'orderDate', width: '14%' },
    ]),
    { header: '문서상태', accessor: 'applyStatus', width: '10%' },
  ];
  
  return (
    <div className="content">
      <div className='all-applications'>
        <h2>전체 신청내역</h2>
        <div className="application-header-row">
          <Breadcrumb items={getBreadcrumbItems()} />
          <div className="application-button-container">
            {showExcelButton && documentTypeFromUrl === '명함신청' && (
              <CustomButton className="excel-button2" onClick={handleExcelDownload}>
                엑셀변환
              </CustomButton>
            )}
          </div>
        </div>
        <ConditionFilter
          startDate={filterInputs.startDate}
          setStartDate={(date) => setFilterInputs(prev => ({ ...prev, startDate: date }))}
          endDate={filterInputs.endDate}
          setEndDate={(date) => setFilterInputs(prev => ({ ...prev, endDate: date }))}
          documentType={documentTypeFromUrl}
          filters={filters}
          setFilters={setFilters}  
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onReset={handleReset}
          showStatusFilters={true}
          showSearchCondition={true}
          showDocumentType={false}  
        />
        {loading ? (
          <p>로딩 중...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <Table columns={columns} data={filteredApplications} onSelect={handleSelect} selectedItems={selectedApplications} />
        )}
      </div>
      {modalVisible && selectedDocumentId && (
        <DocConfirmModal
          show={modalVisible}
          documentId={selectedDocumentId}
          onClose={closeModal}
          onApprove={approveDocument}
          applyStatus={selectedApplyStatus} 
        />
      )}
     </div>
  );
}

export default ApplicationsList;
