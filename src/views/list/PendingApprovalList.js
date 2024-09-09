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

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function PendingApprovalList() {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext); 
  const instCd = auth.instCd;

  const [applications, setApplications] = useState([]);
  const [centers] = useState([
    '전체', '재단본부', '광화문', '여의도센터', '강남센터',
    '수원센터', '대구센터', '부산센터', '광주센터', '제주센터', '협력사'
  ]);
  const [selectedCenter, setSelectedCenter] = useState('전체');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filters, setFilters] = useState({
    statusApproved: false,
    statusRejected: false,
    statusOrdered: false,
    statusClosed: false,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const documentType = queryParams.get('documentType') || '';

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

  const fetchPendingList = useCallback(async (filterParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${apiUrl}/api/pendingList`, {
        params: {
          documentType,
          startDate: filterParams.startDate || '',
          endDate: filterParams.endDate || '',
          instCd: instCd || '', 
        },
      });

      const { bcdPendingResponses, docPendingResponses, corpDocPendingResponses, sealPendingResponses } = response.data.data;

      const transformedBcdData = (bcdPendingResponses || []).map(item => ({
        draftId: item.draftId,
        title: item.title,
        center: item.instNm || '재단본부',
        draftDate: item.draftDate ? parseDateTime(item.draftDate) : '',
        drafter: item.drafter,
        status: '승인대기',
        docType: item.docType || '명함신청'
      }));

      const transformedDocData = (docPendingResponses || []).map(item => ({
        draftId: item.draftId,
        title: item.title,
        center: item.instNm || '재단본부',
        draftDate: item.draftDate ? parseDateTime(item.draftDate) : '',
        drafter: item.drafter,
        status: '승인대기',
        docType: item.docType || '문서수발신'
      }));

      const transformedCorpDocData = (corpDocPendingResponses || []).map(item => ({
        draftId: item.draftId,
        title: item.title,
        center: item.instNm || '재단본부',
        draftDate: item.draftDate ? parseDateTime(item.draftDate) : '',
        drafter: item.drafter,
        status: '승인대기',
        docType: item.docType || '법인서류'
      }));

      const transformedSealData = (sealPendingResponses || []).map(item => ({
        draftId: item.draftId,
        title: item.title,
        center: item.instNm || '재단본부',
        draftDate: item.draftDate ? parseDateTime(item.draftDate) : '',
        drafter: item.drafter,
        status: '승인대기',
        docType: item.docType || '인장신청'
      }));

      const transformedData = [...transformedBcdData, ...transformedDocData, ...transformedCorpDocData, ...transformedSealData];
      transformedData.sort((a, b) => new Date(b.draftDate) - new Date(a.draftDate));

      setApplications(transformedData);
    } catch (error) {
      console.error('Error fetching pending list:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [documentType, instCd]);

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
      const response = await axios.get(`${apiUrl}/api/seal/imprint/${draftId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching seal imprint details:', error);
      alert('날인신청 정보를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const fetchSealExportDetail = async (draftId) => {
    try {
      const response = await axios.get(`${apiUrl}/api/seal/export/${draftId}`);
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
      navigate(`/api/bcd/applyList/${draftId}?readonly=true&applyStatus=승인대기`);
    }  else if (docType === '법인서류') {
      navigate(`/api/corpDoc/applyList/${draftId}?readonly=true&applyStatus=승인대기`);
    } else if (docType === '인장신청(날인)') {
      const sealImprintDetails = await fetchSealImprintDetail(draftId);
      navigate(`/api/seal/imprint/${draftId}?readonly=true&applyStatus=승인대기`, { state: { sealImprintDetails, readOnly: true }});
    } else if (docType === '인장신청(반출)') {
      const sealExportDetails = await fetchSealExportDetail(draftId);
      navigate(`/api/seal/export/${draftId}?readonly=true&applyStatus=승인대기`, { state: { sealExportDetails, readOnly: true }});
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
    setStartDate(null);
    setEndDate(null);
    setSelectedCenter('전체');
    setFilters({
      statusApproved: false,
      statusRejected: false,
      statusOrdered: false,
      statusClosed: false,
    });
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDocumentId(null);
  };

  const approveDocument = async (documentId) => {
    try {
      await axios.put(`${apiUrl}/api/doc/confirm`, null, {
        params: { draftId: documentId },
      });
      alert('승인이 완료되었습니다.');
      closeModal();
      fetchPendingList(filters);
      
      navigate(`/api/pendingList?documentType=${documentType}`);
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
          onClick={() => handleRowClick(row.draftId, row.docType)} 
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
        />
        {loading ? (
          <p>로딩 중...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <Table columns={columns} data={filteredApplications} />
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
