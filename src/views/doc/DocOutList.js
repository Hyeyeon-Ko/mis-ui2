import React, { useState, useEffect, useContext, useCallback } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import ConditionFilter from '../../components/common/ConditionFilter';
import Table from '../../components/common/Table';
import ConfirmModal from '../../components/common/ConfirmModal';
import deleteIcon from '../../assets/images/delete2.png';
import downloadIcon from '../../assets/images/download.png';
import '../../styles/doc/DocOutList.css';
import axios from 'axios';
import { AuthContext } from '../../components/AuthContext';

function DocOutList() {
  const { auth } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState(null);

  const [filterInputs, setFilterInputs] = useState({
    startDate: null,
    endDate: null,
    searchType: '전체',
    keyword: '',
  });

  const fetchDocOutList = useCallback(async () => {
    try {
      const response = await axios.get('/api/doc/sendList', {
        params: { instCd: auth.instCd },
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
        }));
        setApplications(formattedData);
        setFilteredApplications(formattedData);
      }
    } catch (error) {
      console.error('Error fetching document list:', error);
    }
  }, [auth.instCd]);

  useEffect(() => {
    fetchDocOutList();
  }, [fetchDocOutList]);

  const handleFileDownload = async (fileName) => {
    try {
      const response = await axios.get(`/api/doc/download/${encodeURIComponent(fileName)}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading the file:', error);
      alert('파일 다운로드에 실패했습니다.');
    }
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

  const handleSearch = () => {
    const { startDate, endDate, searchType, keyword } = filterInputs;
    let filteredData = applications;

    if (startDate) {
      filteredData = filteredData.filter((item) => new Date(item.draftDate) >= new Date(startDate));
    }

    if (endDate) {
      filteredData = filteredData.filter((item) => new Date(item.draftDate) <= new Date(endDate));
    }

    if (keyword.trim() !== '') {
      filteredData = filteredData.filter((item) => {
        if (searchType === '전체') {
          return (
            item.title.toLowerCase().includes(keyword.toLowerCase()) ||
            item.drafter.toLowerCase().includes(keyword.toLowerCase()) ||
            item.resSender.toLowerCase().includes(keyword.toLowerCase())
          );
        }
        if (searchType === '수신처') {
          return item.resSender.toLowerCase().includes(keyword.toLowerCase());
        }
        if (searchType === '제목') {
          return item.title.toLowerCase().includes(keyword.toLowerCase());
        }
        if (searchType === '접수인') {
          return item.drafter.toLowerCase().includes(keyword.toLowerCase());
        }
        return false;
      });
    }

    setFilteredApplications(filteredData);
  };

  const handleReset = () => {
    setFilterInputs({
      startDate: null,
      endDate: null,
      searchType: '전체',
      keyword: '',
    });
    setFilteredApplications(applications); 
  };

  const columns = [
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
          <button className="download-button" onClick={() => handleFileDownload(row.fileName)}>
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
        <Breadcrumb items={['문서수발신 대장', '문서 발신 대장']} />
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
          setDocumentType={() => {}} 
          setFilters={() => {}}
        />
        <div className="doc-out-content">
          <Table columns={columns} data={filteredApplications} />
        </div>
        {showDeleteModal && (
          <ConfirmModal
            message="이 문서를 삭제하시겠습니까?"
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </div>
    </div>
  );
}

export default DocOutList;
