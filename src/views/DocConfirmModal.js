import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../styles/DocConfirmModal.css'; 

const DocConfirmModal = ({ show, documentId, onClose, onApprove }) => {
  const [formData, setFormData] = useState({
    receptionDate: '',
    drafter: '',
    receiver: '',
    sender: '',
    title: '',
    purpose: '',
    division: ''
  });

  useEffect(() => {
    if (show && documentId) {
      fetchDocumentData(documentId);
    }
  }, [show, documentId]);

  const fetchDocumentData = async (id) => {
    try {
      const response = await axios.get(`/api/doc/${id}`);
      if (response.data && response.data.data) {
        console.log('Fetched Document Data:', response.data.data);
        const data = response.data.data;
        setFormData({
          receptionDate: parseDateTime(data.draftDate),
          drafter: data.drafter,
          receiver: data.receiver,
          sender: data.sender,
          title: data.docTitle,
          purpose: data.purpose,
          division: data.division
        });
      }
    } catch (error) {
      console.error('Error fetching document details:', error);
    }
  };

  const parseDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleApprove = () => {
    onApprove(documentId);
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
        <div className="doc-confirm-modal-buttons">
          <button className="doc-confirm-button confirm" onClick={handleApprove}>
            <span>승인</span>
          </button>
        </div>
      </div>
    </div>
  );
};

DocConfirmModal.propTypes = {
  show: PropTypes.bool.isRequired,
  documentId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired
};

export default DocConfirmModal;
