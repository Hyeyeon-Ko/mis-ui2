import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/RejectReasonModal.css';

const RejectReasonModal = ({ show, onClose }) => {
  const [reason, setReason] = useState('');

  const handleTextareaChange = (event) => {
    setReason(event.target.value);
  };

  if (!show) return null;

  return (
    <div className="reject-modal-overlay">
      <div className="reject-modal-container">
        <h3>반려 사유 작성</h3>
        <textarea
          placeholder={reason ? '' : "반려 사유를 작성해주세요.\n해당 내용은 명함 신청자에게 전달됩니다."}
          value={reason}
          onChange={handleTextareaChange}
        />
        <div className="reject-modal-buttons">
          <button className="reject-modal-button cancel" onClick={onClose}><span>취    소</span></button>
          <button className="reject-modal-button confirm"><span>반    려</span></button>
        </div>
      </div>
    </div>
  );
};

RejectReasonModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default RejectReasonModal;
