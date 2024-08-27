import React, { useState, useEffect, useContext } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import ConditionFilter from '../../components/common/ConditionFilter';
import Table from '../../components/common/Table';
import ConfirmModal from '../../components/common/ConfirmModal';
import deleteIcon from '../../assets/images/delete2.png';
import downloadIcon from '../../assets/images/download.png';
import '../../styles/doc/DocInList.css';
import axios from 'axios';
import { AuthContext } from '../../components/AuthContext';

function DocInList() {
  const { auth } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState(null);
  const [deptResponses, setDeptResponses] = useState([]);
  const [selectedDeptCd, setSelectedDeptCd] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    if (auth.instCd) {
      fetchDeptList(auth.instCd);
      fetchDocInList();
    }
  }, [auth.instCd]);

  const fetchDeptList = async (instCd) => {
    try {
      const response = await axios.get('/api/doc/deptList', {
        params: { instCd },
      });
      setDeptResponses(response.data.data);
    } catch (error) {
      console.error('부서 리스트를 불러오는데 실패했습니다.', error);
    }
  };

  const fetchDocInList = async (deptCd = null) => {
    try {
      const params = {
        instCd: auth.instCd,
        ...(deptCd && { deptCd }),
      };
      const response = await axios.get('/api/doc/receiveList', { params });
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
          deleted: item.status === '신청취소',
        }));
        setApplications(formattedData);
        setFilteredApplications(formattedData);
      }
    } catch (error) {
      console.error('Error fetching document list:', error);
    }
  };

  const fetchDeptReceiveList = async (deptCd) => {
    try {
      const response = await axios.get('/api/doc/deptReceiveList', {
        params: { deptCd },
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
          deleted: item.status === '신청취소',
        }));
        setApplications(formattedData);
        setFilteredApplications(formattedData);
      }
    } catch (error) {
      console.error('부서별 문서 수신 목록을 불러오는데 실패했습니다.', error);
    }
  };

  const handleDeptChange = (e) => {
    const deptCd = e.target.value;
    setSelectedDeptCd(deptCd);

    if (deptCd) {
      fetchDeptReceiveList(deptCd);
    } else {
      fetchDocInList();
    }
  };

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

  const handleDeleteClick = (draftId, status) => {
    if (draftId) {
      setSelectedDraftId(draftId);
      if (status === '신청취소') {
        setShowRevertModal(true);
      } else {
        setShowDeleteModal(true);
      }
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

      if (selectedDeptCd) {
        fetchDeptReceiveList(selectedDeptCd);
      } else {
        fetchDocInList();
      }

      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleConfirmRevert = async () => {
    if (selectedDraftId === null) return;

    try {
      await axios.put('/api/doc/revert', null, {
        params: {
          draftId: selectedDraftId,
        },
      });

      if (selectedDeptCd) {
        fetchDeptReceiveList(selectedDeptCd);
      } else {
        fetchDocInList();
      }

      setShowRevertModal(false);
    } catch (error) {
      console.error('Error reverting document:', error);
    }
  };

  const handleSearch = ({ searchType, keyword, startDate, endDate }) => {
    let filtered = applications;

    if (keyword) {
      filtered = filtered.filter((app) => {
        if (searchType === '발신처') return app.resSender.includes(keyword);
        if (searchType === '제목') return app.title.includes(keyword);
        if (searchType === '접수인') return app.drafter.includes(keyword);
        if (searchType === '전체') {
          return (
            app.resSender.includes(keyword) ||
            app.title.includes(keyword) ||
            app.drafter.includes(keyword)
          );
        }
        return true;
      });
    }

    if (startDate && endDate) {
      filtered = filtered.filter((app) => {
        const appDate = new Date(app.draftDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return appDate >= start && appDate <= end;
      });
    }

    setFilteredApplications(filtered);
  };

  const columns = [
    { header: '접수일자', accessor: 'draftDate', width: '8%' },
    { header: '문서번호', accessor: 'docId', width: '8%' },
    { header: '발신처', accessor: 'resSender', width: '10%' },
    { header: '제목', accessor: 'title', width: '20%' },
    {
      header: '첨부파일',
      accessor: 'file',
      width: '7%',
      Cell: ({ row }) => (
        row.fileName ? (
          <button
            className="download-button"
            onClick={() => handleFileDownload(row.fileName)}
          >
            <img src={downloadIcon} alt="Download" className="action-icon" />
          </button>
        ) : null
      ),
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
            className="doc-in-action-icon"
            onClick={() => handleDeleteClick(row.draftId, row.status)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="content">
      <div className="doc-in-list">
        <h2>문서 수신 대장</h2>
        <Breadcrumb items={['문서수발신 대장', '문서 수신 대장']} />

        <div className="doc-in-category-section">
          <label htmlFor="dept" className="doc-in-category-label">부 서&gt;&gt;</label>
          <select
            id="dept"
            className="doc-in-category-dropdown"
            value={selectedDeptCd || ''}
            onChange={handleDeptChange}
          >
            <option value="">전체</option>
            {deptResponses.map((dept) => (
              <option key={dept.detailCd} value={dept.detailCd}>
                {dept.detailNm}
              </option>
            ))}
          </select>
        </div>

        <ConditionFilter
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onSearch={handleSearch}
          onReset={() => setFilteredApplications(applications)}
          showDocumentType={false}
          showSearchCondition={true}
          excludeRecipient={true}
        />
        <div className="doc-in-content">
          <Table columns={columns} data={filteredApplications} />
        </div>
        {showDeleteModal && (
          <ConfirmModal
            message="이 문서를 삭제하시겠습니까?"
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
        {showRevertModal && (
          <ConfirmModal
            message="이 문서를 되돌리시겠습니까?"
            onConfirm={handleConfirmRevert}
            onCancel={() => setShowRevertModal(false)}
          />
        )}
      </div>
    </div>
  );
}

export default DocInList;
