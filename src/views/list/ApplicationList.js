import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';
import ConditionFilter from '../../components/common/ConditionFilter';
import Table from '../../components/common/Table';
import CustomButton from '../../components/common/CustomButton';
import DocConfirmModal from '../doc/DocConfirmModal';
import CenterSelect from '../../components/CenterSelect';
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
  const [filteredApplications, setFilteredApplications] = useState([]); 
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
  const [selectedCenter, setSelectedCenter] = useState('전체');

  const [centers] = useState([
    '전체', '재단본부', '광화문', '여의도센터', '강남센터',
    '수원센터', '대구센터', '부산센터', '광주센터', '제주센터', '협력사'
  ]);

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
      case 'G':
        return '발급완료';
      case 'X':
        return '상태없음';
      default:
        return status;
    }
  };

  // fetchApplications 함수는 메모이제이션 필요
  const fetchApplications = useCallback(async (filterParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/applyList', {
        params: {
          documentType: filterParams.documentType || documentTypeFromUrl || null,
          instCd: instCd || '',
          userId: auth.userId || '',
          instNm: selectedCenter || '',
        },
      });

      const { bcdMasterResponses, docMasterResponses, corpDocMasterResponses, sealMasterResponses } = response.data.data;

      const combinedData = [
        ...(bcdMasterResponses || []),
        ...(docMasterResponses || []),
        ...(corpDocMasterResponses || []),
        ...(sealMasterResponses || []),
      ];

      const filteredData = combinedData.filter(application => application.applyStatus !== 'X');

      const transformedData = filteredData.map(application => ({
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
      applyStatusFilters(transformedData);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [auth.userId, documentTypeFromUrl, instCd, selectedCenter]);

  // 필터 적용 함수도 useCallback으로 메모이제이션
  const applyFilters = useCallback(() => {
    let filteredData = applications;

    if (filterInputs.startDate) {
      const startOfDay = new Date(filterInputs.startDate);
      startOfDay.setHours(0, 0, 0, 0);
      filteredData = filteredData.filter(application => new Date(application.draftDate) >= startOfDay);
    }

    if (filterInputs.endDate) {
      const endOfDay = new Date(filterInputs.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      filteredData = filteredData.filter(application => new Date(application.draftDate) <= endOfDay);
    }

    const keyword = filterInputs.keyword.toLowerCase().trim();
    if (keyword) {
      if (filterInputs.searchType === '전체') {
        filteredData = filteredData.filter(application =>
          application.title.toLowerCase().includes(keyword) ||
          application.drafter.toLowerCase().includes(keyword)
        );
      } else if (filterInputs.searchType === '제목') {
        filteredData = filteredData.filter(application => 
          application.title.toLowerCase().includes(keyword)
        );
      } else if (filterInputs.searchType === '신청자') {
        filteredData = filteredData.filter(application => 
          application.drafter.toLowerCase().includes(keyword)
        );
      }
    }

    setFilteredApplications(filteredData);
  }, [applications, filterInputs]);

  // resetFilters를 useEffect보다 먼저 정의
  const resetFilters = useCallback(() => {
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
    setFilterInputs({
      startDate: defaultStartDate,
      endDate: new Date(),
      documentType: documentTypeFromUrl || '',
      searchType: '전체',
      keyword: '',
    });
    setFilters({
      statusApproved: false,
      statusRejected: false,
      statusOrdered: false,
      statusClosed: false,
    });
    setSelectedCenter('전체');
  }, [documentTypeFromUrl]);

  // useEffect에 의존성 배열 추가
  useEffect(() => {
    applyFilters(); 
  }, [filters, filterInputs, applications, applyFilters]);

  useEffect(() => {
    resetFilters();
    fetchApplications();
  }, [documentTypeFromUrl, resetFilters, fetchApplications]);

  return (
    <div className="content">
      <div className='all-applications'>
        <h2>전체 신청내역</h2>
        <div className="application-header-row">
          <Breadcrumb items={getBreadcrumbItems()} />
          <div className="application-button-container">
            {showExcelButton && documentTypeFromUrl === '명함신청' && (
              <CustomButton className="finish-excel-button" onClick={handleExcelDownload}>
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
          documentType={filterInputs.documentType}
          setDocumentType={(docType) => setFilterInputs(prev => ({ ...prev, documentType: docType }))}
          filters={filters}
          setFilters={setFilters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onReset={handleReset}
          showStatusFilters={showStatusFilters}
          showSearchCondition={true}
          showDocumentType={false}
          searchType={filterInputs.searchType}
          setSearchType={(searchType) => setFilterInputs(prev => ({ ...prev, searchType }))}
          keyword={filterInputs.keyword}
          setKeyword={(keyword) => setFilterInputs(prev => ({ ...prev, keyword }))}
          searchOptions={['전체', '제목', '신청자']} 
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
