import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../../styles/doc/DocConfirmModal.css';
import downloadIcon from '../../assets/images/download.png';

const DocConfirmModal = ({ show, documentId, onClose, onApprove, applyStatus, refreshSidebar }) => {
  const [formData, setFormData] = useState({
    receptionDate: '',
    drafter: '',
    receiver: '',
    sender: '',
    title: '',
    purpose: '',
    division: '',
    fileName: '',
    filePath: '',
  });

  const fetchDocumentData = useCallback(async (id) => {
    try {
      const response = await axios.get(`/api/doc/${id}`);
      if (response.data && response.data.data) {
        const data = response.data.data;
        setFormData({
          receptionDate: parseDateTime(data.draftDate),
          drafter: data.drafter,
          receiver: data.receiver,
          sender: data.sender,
          title: data.docTitle,
          purpose: data.purpose,
          division: data.division,
          fileName: data.fileName,
          filePath: data.filePath, // 기존 filePath 정보 추가
        });
      }
    } catch (error) {
      console.error('Error fetching document details:', error);
    }
  }, []);

  useEffect(() => {
    if (show && documentId) {
      fetchDocumentData(documentId);
    }
  }, [show, documentId, fetchDocumentData]);

  const parseDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleApprove = async () => {
    try {
      await onApprove(documentId);
      if (refreshSidebar) {
        refreshSidebar();  
      }
    } catch (error) {
      console.error('Error approving document:', error);
    }
  };

  const handleFileDownload = async () => {
    if (formData.filePath) {
      try {
        const documentType = "doc"; // 필요에 따라 documentType 값을 설정하세요
        const response = await axios.get(
          `/api/file/download/${encodeURIComponent(formData.fileName)}?documentType=${encodeURIComponent(documentType)}`,
          { responseType: 'blob' }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', formData.fileName); // 다운로드 파일 이름 설정
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } catch (error) {
        console.error('Error downloading the file:', error);
        alert('파일 다운로드에 실패했습니다.');
      }
    }
  };

  if (!show) return null;

  return (
    <div className="doc-confirm-modal-overlay">
      <div className="doc-confirm-modal-container">
        <div className="doc-confirm-modal-header">
          <h3>문서수발신 신청 승인</h3>
          <button className="doc-confirm-close-button" onClick={onClose}>X</button>
        </div>
        <div className="doc-confirm-form-group">
          <label>접수 일자</label>
          <input type="text" value={formData.receptionDate} readOnly />
        </div>
        <div className="doc-confirm-form-group">
          <label>접수인</label>
          <input type="text" value={formData.drafter} readOnly />
        </div>
        {formData.division === 'A' ? (
          <div className="doc-confirm-form-group">
            <label>발신처</label>
            <input type="text" value={formData.sender} readOnly />
          </div>
        ) : (
          <div className="doc-confirm-form-group">
            <label>수신처</label>
            <input type="text" value={formData.receiver} readOnly />
          </div>
        )}
        <div className="doc-confirm-form-group">
          <label>제목</label>
          <input type="text" value={formData.title} readOnly />
        </div>
        <div className="doc-confirm-form-group">
          <label>사용 용도</label>
          <textarea value={formData.purpose} readOnly className="doc-confirm-textarea" />
        </div>
        {formData.filePath && (
          <div className="doc-confirm-form-group">
            <label>첨부 파일</label>
            <div className="doc-confirm-file-download">
              <button onClick={handleFileDownload} style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
                <span>{formData.fileName}</span>
                <img src={downloadIcon} alt="다운로드" />
              </button>
            </div>
          </div>
        )}
        {applyStatus === '승인대기' && (
          <div className="doc-confirm-modal-buttons">
            <button className="doc-confirm-button confirm" onClick={handleApprove}>
              <span>승인</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

DocConfirmModal.propTypes = {
  show: PropTypes.bool.isRequired,
  documentId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired,
  applyStatus: PropTypes.string.isRequired,
  refreshSidebar: PropTypes.func,
};

export default DocConfirmModal;
