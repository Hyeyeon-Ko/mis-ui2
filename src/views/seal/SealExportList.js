import React, { useState, useEffect, useContext, useCallback } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import SealApprovalModal from '../../views/seal/SealApprovalModal';
import SignitureImage from '../../assets/images/signiture.png';
import downloadIcon from '../../assets/images/download.png'; 
import { AuthContext } from '../../components/AuthContext'; 
import axios from 'axios';
import ConditionFilter from '../../components/common/ConditionFilter';
import ReasonModal from '../../components/ReasonModal'; 
import '../../styles/seal/SealExportList.css';

function SealExportList() {
  const { auth } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [filterInputs, setFilterInputs] = useState({
    searchType: '전체',
    keyword: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocumentDetails, setSelectedDocumentDetails] = useState(null);
  const [clickedRows, setClickedRows] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true); 

  const [showDownloadReasonModal, setShowDownloadReasonModal] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedDraftId, setSelectedDraftId] = useState(null);

  const fetchSealExportList = useCallback(async (searchType = null, keyword = null) => {
    try {
      const { instCd } = auth;
      const response = await axios.get(`/api/seal/exportList`, {
        params: {
          instCd,
          searchType,
          keyword,
        },
      });
      
      const fetchedData = response.data.data.map((item, index) => ({
        id: index + 1, 
        draftId: item.draftId,
        expDate: item.expDate,
        returnDate: item.returnDate,
        purpose: item.purpose,
        sealType: {
          corporateSeal: item.corporateSeal !== "" ? item.corporateSeal : 0,
          facsimileSeal: item.facsimileSeal !== "" ? item.facsimileSeal : 0,
          companySeal: item.companySeal !== "" ? item.companySeal : 0,
        },
        applicantName: item.drafter, 
        signitureImage: SignitureImage,
        fileName: item.fileName,
        filePath: item.filePath,
        fileUrl: item.filePath ? `/api/file/download/${encodeURIComponent(item.fileName)}` : '',
        status: '결재진행중', 
      }));

      setApplications(fetchedData);

      const storedClickedRows = JSON.parse(localStorage.getItem('clickedRows')) || [];
      setClickedRows(storedClickedRows);
    } catch (error) {
      console.error('Error fetching seal export list:', error);
      alert('인장 반출대장 데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }, [auth]);

  useEffect(() => {
    if (initialLoad) {
      fetchSealExportList();
      setInitialLoad(false); 
    }
  }, [initialLoad, fetchSealExportList]);

  const handleSearch = () => {
    fetchSealExportList(filterInputs.searchType, filterInputs.keyword);  
  };

  const handleReset = () => {
    setFilterInputs({
      searchType: '전체',
      keyword: '',
    });
    fetchSealExportList(); 
  };

  const handleFileDownloadClick = (draftId, fileName) => {
    setSelectedDraftId(draftId);
    setSelectedFileName(fileName);
    setShowDownloadReasonModal(true); 
  };

  const handleDownloadModalClose = () => {
    setShowDownloadReasonModal(false); 
    setSelectedDraftId(null);
    setSelectedFileName('');
  };
      
  const handleFileDownloadConfirm = async ({ downloadNotes, downloadType }) => {
    setShowDownloadReasonModal(false);

    const downloadTypeMap = {
      'draft': 'A',
      'order': 'B',
      'approval': 'C',
      'check': 'D',
      '기타': 'Z',
    };

    const convertedFileType = downloadTypeMap[downloadType] || '';    
  
    try {
      const response = await axios.get(`/api/file/download/${encodeURIComponent(selectedFileName)}`, {
        params: {
          draftId: selectedDraftId,
          downloadType: convertedFileType,
          downloadNotes: downloadNotes,
          downloaderNm: auth.hngNm,
          downloaderId: auth.userId,
},
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', selectedFileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading the file:', error);
      alert('파일 다운로드에 실패했습니다.');
    } finally {
      setSelectedDraftId(null);
      setSelectedFileName('');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDocumentDetails(null);
  };

  const handleRowClick = (status, document) => {
    if (status === '결재진행중' || status === '결재완료') {
      if (status === '결재완료') {
        setClickedRows(prevClickedRows => {
          const newClickedRows = [...prevClickedRows, document.id];
          localStorage.setItem('clickedRows', JSON.stringify(newClickedRows));
          return newClickedRows;
        });
      }
      setSelectedDocumentDetails({
        ...document,
        approvers: document.approval || [],
        signitureImage: document.signitureImage || SignitureImage,
      });
      setModalVisible(true);
    }
  };

  return (
    <div className="content">
      <div className="seal-export-list">
        <h2>인장 반출대장</h2>
        <Breadcrumb items={['인장 대장', '인장 반출대장']} />

        <ConditionFilter
          startDate={null}
          setStartDate={() => {}}
          endDate={null}
          setEndDate={() => {}}
          filters={{}}
          setFilters={() => {}}
          onSearch={handleSearch}  
          onReset={handleReset}    
          showStatusFilters={false}
          showSearchCondition={true}
          showDocumentType={false}
          searchType={filterInputs.searchType}
          setSearchType={(searchType) => setFilterInputs(prev => ({ ...prev, searchType }))}
          keyword={filterInputs.keyword}
          setKeyword={(keyword) => setFilterInputs(prev => ({ ...prev, keyword }))}
          searchOptions={['전체', '반출일자', '반납일자', '사용목적']}
          setDocumentType={() => {}}
        />

        <table className="table">
          <thead>
            <tr>
              <th rowSpan="2">일련번호</th>
              <th rowSpan="2">반출일자</th>
              <th rowSpan="2">반납일자</th>
              <th rowSpan="2">사용목적</th>
              <th colSpan="3">인장구분</th>
              <th rowSpan="2">첨부파일</th>
              <th rowSpan="2">결재</th>
            </tr>
            <tr>
              <th>법인인감</th>
              <th>사용인감</th>
              <th>회사인</th>
            </tr>
          </thead>
          <tbody>
            {applications.length > 0 ? (
              applications.map((app, index) => (
                <tr key={app.draftId}>
                  <td>{index + 1}</td>
                  <td>{app.expDate}</td>
                  <td>{app.returnDate}</td>
                  <td>{app.purpose}</td>
                  <td>{app.sealType.corporateSeal}</td>
                  <td>{app.sealType.facsimileSeal}</td>
                  <td>{app.sealType.companySeal}</td>
                  <td>
                    {app.fileName && app.fileUrl ? (
                      <button
                        onClick={() => handleFileDownloadClick(app.draftId, app.fileName)} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <img src={downloadIcon} alt="파일 다운로드" />
                      </button>
                    ) : (
                      ""
                    )}
                  </td>
                  <td
                    className={`status-${app.status.replace(/\s+/g, '-').toLowerCase()} clickable ${
                      clickedRows.includes(app.draftId) ? 'confirmed' : ''
                    }`}
                    onClick={() => handleRowClick(app.status, app)}
                  >
                    {app.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">데이터가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ReasonModal 
        show={showDownloadReasonModal} 
        onClose={handleDownloadModalClose}
        onConfirm={handleFileDownloadConfirm} 
        modalType="download" 
      />
      {modalVisible && selectedDocumentDetails && (
        <SealApprovalModal
          show={modalVisible}
          onClose={closeModal}
          documentDetails={{
            date: selectedDocumentDetails.expDate,
            applicantName: selectedDocumentDetails.applicantName,
            approvers: selectedDocumentDetails.approvers,
            signitureImage: selectedDocumentDetails.signitureImage,
          }}
        />
      )}
    </div>
  );
}

export default SealExportList;
