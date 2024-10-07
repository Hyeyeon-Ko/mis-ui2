import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';
import ConditionFilter from '../../components/common/ConditionFilter';
import Table from '../../components/common/Table';
import CenterSelect from '../../components/CenterSelect';
import DocConfirmModal from '../doc/DocConfirmModal';
import '../../styles/list/ApplicationsList.css';
import '../../styles/common/Page.css';
import axios from 'axios';
import { AuthContext } from '../../components/AuthContext';
import { centerData, filterData } from '../../datas/listDatas';
import useDateSet from '../../hooks/apply/useDateSet';
import Pagination from '../../components/common/Pagination';
import Loading from '../../components/common/Loading';

function PendingApprovalList() {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, refreshSidebar } = useContext(AuthContext);

  const [applications, setApplications] = useState([]);
  const [centers] = useState(centerData);
  const [selectedCenter, setSelectedCenter] = useState('전체');
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date()); 

  const [filters, setFilters] = useState(filterData);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const documentType = queryParams.get('documentType') || '';

  const { formattedStartDate: defaultStartDate, formattedEndDate: defaultEndDate } = useDateSet();

  const [totalPages, setTotalPages] = useState('1')
  const [currentPage, setCurrentPage] = useState('1')

  const itemsPerPage = 10;

  useEffect(() => {
    fetchPendingList(currentPage, itemsPerPage);
    // eslint-disable-next-line
  }, [currentPage]);

  const handlePageClick = (event) => {
    const selectedPage = event.selected + 1;
    setCurrentPage(selectedPage);
  };

  const getBreadcrumbItems = () => {
    switch (documentType) {
      case '명함신청':
        return ['명함 관리', '승인대기 내역'];
      case '인장신청':
        return ['인장 관리', '승인대기 내역'];
      case '법인서류':
        return ['법인서류 관리', '승인대기 내역'];
      case '문서수발신':
        return ['문서수발신 관리', '승인대기 내역'];
      default:
        return ['신청내역 관리', '승인대기 내역'];
    }
  };

  const convertDocumentType = (type) => {
    switch (type) {
      case '명함신청':
        return 'A';
      case '문서수발신':
        return 'B';
      case '법인서류':
        return 'C';
      case '인장신청':
        return 'D';
      default:
        return null;
    }
  };

  const fetchPendingList = useCallback(async (startDate = null, endDate = null, pageIndex = 1, pageSize = itemsPerPage) => {
    setLoading(true);
    setError(null);
    try {

      const formattedStartDate = startDate instanceof Date ? startDate.toISOString().split('T')[0] : defaultStartDate;
      const formattedEndDate = endDate instanceof Date ? endDate.toISOString().split('T')[0] : defaultEndDate;

      const response = await axios.get(`/api/pendingList2`, {
        params: {
          // ApplyRequestDTO parameters
          userId: auth.userId || '',
          instCd: auth.instCd || '',
          documentType: convertDocumentType(documentType),
          
          // PostSearchRequestDTO parameters
          startDate: formattedStartDate,
          endDate: formattedEndDate,

          // PostPageRequest parameters
          pageIndex,
          pageSize
        },
      });

      const { bcdPendingResponses, docPendingResponses, corpDocPendingResponses, sealPendingResponses } = response.data.data;

      const combinedData = [
        bcdPendingResponses || {},
        docPendingResponses || {},
        corpDocPendingResponses || {},
        sealPendingResponses || {}
      ];

      const selectedData = combinedData.find(response => response.totalElements > 0);

      const totalPages = selectedData.totalPages;
      const currentPage = selectedData.number + 1;
      const content = selectedData.content;
      const filteredData = content.filter(application => application.applyStatus !== 'X');
  
      const transformedData = filteredData.map(item => ({
        draftId: item.draftId,
        title: item.title,
        center: item.instNm || '재단본부',
        draftDate: item.draftDate ? parseDateTime(item.draftDate) : '',
        drafter: item.drafter,
        status: '승인대기',
        docType: item.docType
      }));
  
      transformedData.sort((a, b) => new Date(b.draftDate) - new Date(a.draftDate));
  
      setApplications(transformedData);
      setTotalPages(totalPages);
      setCurrentPage(currentPage);
    } catch (error) {
      console.error('Error fetching pending list:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [documentType, auth.instCd, auth.userId, startDate, endDate]);
      
  useEffect(() => {
    fetchPendingList(filters);
  }, [filters, fetchPendingList]);

  const parseDateTime = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const handleCenterChange = (event) => {
    setSelectedCenter(event.target.value);
    setFilters((prevFilters) => ({
      ...prevFilters,
      selectedCenter: event.target.value,
    }));
  };

  const fetchSealImprintDetail = async (draftId) => {
    try {
      const response = await axios.get(`/api/seal/imprint/${draftId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching seal imprint details:', error);
      alert('날인신청 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const fetchSealExportDetail = async (draftId) => {
    try {
      const response = await axios.get(`/api/seal/export/${draftId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching seal export details:', error);
      alert('반출신청 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleRowClick = async (draftId, docType, applyStatus) => {
    if (docType === '문서수신' || docType === '문서발신') {
      setSelectedDocumentId(draftId);
      setModalVisible(true);
    } else if (docType === '명함신청') {
      navigate(`/bcd/applyList/${draftId}?readonly=true&applyStatus=승인대기`);
    } else if (docType === '법인서류') {
      navigate(`/corpDoc/applyList/${draftId}?readonly=true&applyStatus=승인대기`);
    } else if (docType === '인장신청(날인)') {
      const sealImprintDetails = await fetchSealImprintDetail(draftId);
      navigate(`/seal/imprint/${draftId}?readonly=true&applyStatus=승인대기`, { state: { sealImprintDetails, readOnly: true }});
    } else if (docType === '인장신청(반출)') { 
      const sealExportDetails = await fetchSealExportDetail(draftId);
      navigate(`/seal/export/${draftId}?readonly=true&applyStatus=승인대기`, { state: { sealExportDetails, readOnly: true }});
    }
  };

  const handleSearch = () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      startDate: startDate ? startDate.toISOString().split('T')[0] : '',
      endDate: endDate ? endDate.toISOString().split('T')[0] : '',
      selectedCenter,
    }));
  };

  const handleReset = () => {
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
    setStartDate(defaultStartDate);
    setEndDate(new Date());
    setSelectedCenter('전체');
    setFilters(filterData);
    fetchPendingList();
  };
  
  const closeModal = () => {
    setModalVisible(false);
    setSelectedDocumentId(null);
  };

  const approveDocument = async (documentId) => {
    try {
      await axios.put(`/api/doc/confirm`, null, {
        params: { draftId: documentId , userId: auth.userId},
      });
      alert('승인이 완료되었습니다.');
      closeModal();
      
      fetchPendingList(filters);

      if (typeof refreshSidebar === 'function') {
        refreshSidebar();  
      }

      navigate(`/pendingList?documentType=${documentType}`);
    } catch (error) {
      console.error('Error approving document:', error);
      alert('Error approving document.');
    }
  };
    
  const normalizeDate = (dateString) => {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date;
  };
  
  const filteredApplications = applications.filter((app) => {
    const draftDate = normalizeDate(app.draftDate); 

    if (filters.selectedCenter && filters.selectedCenter !== '전체' && app.center !== filters.selectedCenter) return false;
    if (filters.startDate && draftDate < normalizeDate(filters.startDate)) return false;
    if (filters.endDate && draftDate > normalizeDate(filters.endDate)) return false;
    return true;
  });
    
  const columns = [
    { header: '문서분류', accessor: 'docType', width: '10%' },
    ...(documentType === '법인서류' ? [{
      header: <CenterSelect centers={centers} selectedCenter={selectedCenter} onCenterChange={handleCenterChange} />,
      accessor: 'center',
      width: '10%',
    }] : [
      { header: '센터', accessor: 'center', width: '10%' }, 
    ]),
    { header: '제목', accessor: 'title', width: '28%',
      Cell: ({ row }) => (
        <span
          className="status-pending clickable" 
          onClick={() => handleRowClick(row.draftId, row.docType, row.status)} 
        >
          {row.title}
        </span>
      ),  
    },
    { header: '신청일시', accessor: 'draftDate', width: '12%' },
    { header: '신청자', accessor: 'drafter', width: '8%' }, 
    { header: '문서상태', accessor: 'status', width: '10%' },
  ];

  return (
    <div className="content">
      <div className="order">
        <h2>승인대기 내역</h2>
        <Breadcrumb items={getBreadcrumbItems()} /> 
        <ConditionFilter
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
          onReset={handleReset}
          showDocumentType={false}
          showSearchCondition={false}
          setDocumentType={() => {}} 
          searchOptions={[]}          
        />
        {loading ? (
          <Loading />
        ) : (
          <>
          <Table columns={columns} data={filteredApplications} />
          <Pagination totalPages={totalPages} onPageChange={handlePageClick} />
        </>

        )}
      </div>
      {selectedDocumentId !== null && (
        <DocConfirmModal
          show={modalVisible}
          documentId={selectedDocumentId}
          onClose={closeModal}
          onApprove={approveDocument}
          applyStatus="승인대기" 
        />
      )}
    </div>
  );
}

export default PendingApprovalList;
