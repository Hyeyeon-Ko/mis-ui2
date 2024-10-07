import React, { useState, useEffect, useContext, useCallback } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import ConditionFilter from '../../components/common/ConditionFilter';
import Table from '../../components/common/Table';
import ConfirmModal from '../../components/common/ConfirmModal';
import ReasonModal from '../../components/ReasonModal';
import deleteIcon from '../../assets/images/delete2.png';
import downloadIcon from '../../assets/images/download.png';
import CustomButton from '../../components/common/CustomButton';
import '../../styles/doc/DocOutList.css';
import axios from 'axios';
import { AuthContext } from '../../components/AuthContext';
import { docFilterData } from '../../datas/docDatas';
import useDocChange from '../../hooks/useDocChange';

function DocOutList() {
  const { auth } = useContext(AuthContext);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showDownloadReasonModal, setShowDownloadReasonModal] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedDraftId, setSelectedDraftId] = useState(null);

  const [showDownButton, setShowDownButton] = useState(false); 

  const [filterInputs, setFilterInputs] = useState(docFilterData);

  const [downloadType, setDownloadType] = useState(null); 
  const {
    handleSelectRow,
    handleSelectAll,
    setFilteredApplications,
    selectedRows,
    filteredApplications,
    setSelectedRows,
  } = useDocChange();

  const deriveDocType = (filePath) => {
    if (!filePath) return "doc"; 
    if (filePath.startsWith("/doc/")) {
      return "doc";
    } else if (filePath.startsWith("/seal/")) {
      return "seal";
    } else if (filePath.startsWith("/corpdoc/")) {
      return "corpdoc";
    }
    return "doc";
  };

  const fetchDocOutList = useCallback(async (searchType = '전체', keyword = '', startDate = null, endDate = null) => {
    try {
      const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : '';
      const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : '';

      const response = await axios.get('/api/doc/sendList', {
        params: {
          instCd: auth.instCd,
          searchType,
          keyword,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
      });

      if (response.data && response.data.data) {
        const formattedData = response.data.data.map((item) => ({
          draftId: item.draftId,
          draftDate: item.draftDate,
          docId: item.docId,
          resSender: item.resSender,
          title: item.title,
          drafter: item.drafter,
          status: item.status,
          fileName: item.fileName,
          fileUrl: item.fileUrl,
          docType: deriveDocType(item.filePath),
        }));
        setFilteredApplications(formattedData);
      }
    } catch (error) {
      console.error('Error fetching document list:', error);
    }
  }, [auth.instCd, setFilteredApplications]);

  useEffect(() => {
    fetchDocOutList();
  }, [fetchDocOutList]);

  useEffect(() => {
    setShowDownButton(selectedRows.length > 0);
  }, [selectedRows]);

  const handleFileDownloadClick = (draftId, fileName) => {
    setSelectedDraftId(draftId);
    setSelectedFileName(fileName);
    setDownloadType('single'); 
    setShowDownloadReasonModal(true);
  };

  const handleDownloadFiles = () => {
    if (selectedRows.length === 0) {
      alert('다운로드할 파일을 선택하세요.');
      return;
    }
    setDownloadType('multiple');
    setShowDownloadReasonModal(true);
  };

  const handleDownloadModalClose = () => {
    setShowDownloadReasonModal(false);
    setSelectedDraftId(null);
    setSelectedFileName('');
    setDownloadType(null);
  };

  const handleDownloadConfirm = async ({ reason, fileType }) => {
    setShowDownloadReasonModal(false);

    if (downloadType === 'single') {
      try {
        const response = await axios.get(`/api/file/download/${encodeURIComponent(selectedFileName)}`, {
          params: {
            draftId: selectedDraftId,
            docType: 'doc',
            fileType: fileType,
            reason: reason,
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
      }
    } else if (downloadType === 'multiple') {
      const requestData = selectedRows.map((draftId) => {
        const selectedApp = filteredApplications.find(app => app.draftId === draftId);
        return {
          draftId: draftId,
          docType: selectedApp ? selectedApp.docType : 'doc', 
          fileName: selectedApp ? selectedApp.fileName : '',
          fileType: fileType,
          reason: reason,
          downloaderNm: auth.hngNm,
          downloaderId: auth.userId,
        };
      });

      try {
        const response = await axios.post('/api/file/download/multiple', requestData, {
          responseType: 'blob', 
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'documents.zip'); 
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);

        setSelectedRows([]);
      } catch (error) {
        console.error('파일 다운로드에 실패했습니다:', error);
        alert('파일 다운로드에 실패했습니다.');
      }
    }

    setDownloadType(null); 
  };

  const handleDeleteClick = (draftId) => {
    if (draftId) {
      setSelectedDraftId(draftId);
      setShowDeleteModal(true);
    } else {
      console.error('Invalid draftId:', draftId);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedDraftId === null) return;

    try {
      await axios.put('/api/doc/delete', null, {
        params: {
          draftId: selectedDraftId,
        },
      });

      fetchDocOutList();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleSearch = async () => {
    const { searchType, keyword, startDate, endDate } = filterInputs;

    const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : null;
    const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : null;

    try {
      const response = await axios.get('/api/doc/sendList', {
        params: {
          instCd: auth.instCd,
          searchType: searchType,
          keyword: keyword.trim() !== '' ? keyword : null,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
      });

      if (response.data && response.data.data) {
        const formattedData = response.data.data.map((item) => ({
          draftId: item.draftId,
          draftDate: item.draftDate,
          docId: item.docId,
          resSender: item.resSender,
          title: item.title,
          drafter: item.drafter,
          status: item.status,
          fileName: item.fileName,
          fileUrl: item.fileUrl,
          docType: deriveDocType(item.filePath), 
        }));
        setFilteredApplications(formattedData);
      }
    } catch (error) {
      console.error('Error fetching document list:', error);
    }
  };

  const resetFilters = useCallback(() => {
    const defaultStartDate = new Date();
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
    setFilterInputs({
      startDate: defaultStartDate,
      endDate: new Date(),
      searchType: '전체',
      keyword: '',
    });
    setSelectedRows([]); 
  }, [setSelectedRows]);

  useEffect(() => {
    resetFilters();
  }, [resetFilters]);

  const handleReset = () => {
    resetFilters();
    fetchDocOutList();
  };

  const columns = [
    {
      header: <input type="checkbox" onChange={(e) => handleSelectAll(e.target.checked)} />,
      accessor: 'select',
      width: '4%',
      Cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.draftId)}
          onChange={(e) => handleSelectRow(e.target.checked, row.draftId)}
        />
      ),
    },
    { header: '접수일자', accessor: 'draftDate', width: '8%' },
    { header: '문서번호', accessor: 'docId', width: '8%' },
    { header: '수신처', accessor: 'resSender', width: '10%' },
    { header: '제목', accessor: 'title', width: '20%' },
    {
      header: '첨부파일',
      accessor: 'file',
      width: '7%',
      Cell: ({ row }) =>
        row.fileName ? (
          <button className="download-button" onClick={() => handleFileDownloadClick(row.draftId, row.fileName)}>
            <img src={downloadIcon} alt="Download" className="action-icon" />
          </button>
        ) : null,
    },
    { header: '접수인', accessor: 'drafter', width: '8%' },
    { header: '상태', accessor: 'status', width: '8%' },
    {
      header: '신청 삭제',
      accessor: 'delete',
      width: '7%',
      Cell: ({ row }) => (
        <div className="icon-cell">
          <img
            src={deleteIcon}
            alt="Delete"
            className="doc-out-action-icon"
            onClick={() => handleDeleteClick(row.draftId)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="content">
      <div className="doc-out-list">
        <h2>문서 발신 대장</h2>
        <div className="application-header-row">
          <Breadcrumb items={['문서수발신 대장', '문서 발신 대장']} />
          <div className="application-button-container">
            {showDownButton && (
              <CustomButton className="finish-excel-button" onClick={handleDownloadFiles}>
                파일다운
              </CustomButton>
            )}
          </div>
        </div>
        <ConditionFilter
          startDate={filterInputs.startDate}
          setStartDate={(date) => setFilterInputs((prev) => ({ ...prev, startDate: date }))}
          endDate={filterInputs.endDate}
          setEndDate={(date) => setFilterInputs((prev) => ({ ...prev, endDate: date }))}
          onSearch={handleSearch}
          onReset={handleReset}
          showDocumentType={false}
          showSearchCondition={true}
          searchType={filterInputs.searchType}
          setSearchType={(searchType) => setFilterInputs((prev) => ({ ...prev, searchType }))}
          keyword={filterInputs.keyword}
          setKeyword={(keyword) => setFilterInputs((prev) => ({ ...prev, keyword }))}
          searchOptions={['전체', '수신처', '제목', '접수인']}
          startDateLabel="접수일자"
          setFilters={() => {}}
          setDocumentType={() => {}}
        />
        <div className="doc-out-content">
          <Table columns={columns} data={filteredApplications || []} />
        </div>
        {showDeleteModal && (
          <ConfirmModal
            message="이 문서를 삭제하시겠습니까?"
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
        <ReasonModal
          show={showDownloadReasonModal}
          onClose={handleDownloadModalClose}
          onConfirm={handleDownloadConfirm} 
          modalType="download"
        />
      </div>
    </div>
  );
}

export default DocOutList;
