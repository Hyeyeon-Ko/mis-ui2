import React, { useState, useEffect, useContext, useCallback } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import SealApprovalModal from '../../views/seal/SealApprovalModal';
import SignitureImage from '../../assets/images/signiture.png';
import downloadIcon from '../../assets/images/download.png'; 
import { AuthContext } from '../../components/AuthContext'; 
import axios from 'axios';
import '../../styles/seal/SealExportList.css';

function SealExportList() {
  const { auth } = useContext(AuthContext);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocumentDetails, setSelectedDocumentDetails] = useState(null);
  const [clickedRows, setClickedRows] = useState([]);

  const fetchSealExportList = useCallback(async (instCd) => {
    try {
      const response = await axios.get('/api/seal/exportList', {
        params: {
          instCd,
        },
      });

      const fetchedData = response.data.data.map((item, index) => ({
        id: index + 1,
        expDate: item.expDate,
        returnDate: item.returnDate,
        purpose: item.purpose,
        sealType: {
          corporateSeal: item.corporateSeal !== "" ? item.corporateSeal : 0,
          facsimileSeal: item.facsimileSeal !== "" ? item.facsimileSeal : 0,
          companySeal: item.companySeal !== "" ? item.companySeal : 0,
        },
        applicantName: item.expNm,
        signitureImage: SignitureImage,
        fileName: item.fileName,
        filePath: item.filePath,
        fileUrl: `/api/doc/download/${encodeURIComponent(item.fileName)}`,
        status: '결재진행중',
      }));

      setFilteredApplications(fetchedData);

      const clickedRows = JSON.parse(localStorage.getItem('clickedRows')) || [];
      setClickedRows(clickedRows);
    } catch (error) {
      console.error('Error fetching seal export list:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  }, []);

  useEffect(() => {
    if (auth.instCd) {
      fetchSealExportList(auth.instCd);
    }
  }, [auth.instCd, fetchSealExportList]);

  const handleFileDownload = async (fileUrl, fileName) => {
    try {
      const response = await axios.get(fileUrl, {
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
            {filteredApplications.length > 0 ? (
              filteredApplications.map((app, index) => (
                <tr key={index}>
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
                        onClick={() => handleFileDownload(app.fileUrl, app.fileName)}
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
                      clickedRows.includes(app.id) ? 'confirmed' : ''
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
      {modalVisible && selectedDocumentDetails && (
        <SealApprovalModal
          show={modalVisible}
          onClose={closeModal}
          documentDetails={{
            date: selectedDocumentDetails.date,
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
