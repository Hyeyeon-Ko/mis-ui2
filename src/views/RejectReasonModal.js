import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/RejectReasonModal.css';

/* 반려 사유 모달 */
const RejectReasonModal = ({ show, onClose, onConfirm, reason, isViewOnly }) => {
  const [inputReason, setInputReason] = useState(reason || '');

  useEffect(() => {
    setInputReason(reason);
  }, [reason]);

  const handleTextareaChange = (event) => {
    setInputReason(event.target.value);
  };

  const handleConfirmClick = () => {
    onConfirm(inputReason);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="reject-modal-overlay">
      <div className="reject-modal-container">
        <h3>{isViewOnly ? '반려 이유 확인' : '반려 사유 작성'}</h3>
        {isViewOnly ? (
          <div className="reject-reason-content">
            {inputReason || "반려 이유가 제공되지 않았습니다."}
          </div>
        ) : (
          <textarea
            placeholder="반려 사유를 작성해주세요.\n해당 내용은 명함 신청자에게 전달됩니다."
            value={inputReason}
            onChange={handleTextareaChange}
          />
        )}
        <div className="reject-modal-buttons">
          <button className="reject-modal-button cancel" onClick={onClose}><span>취    소</span></button>
          {!isViewOnly && (
            <button className="reject-modal-button confirm" onClick={handleConfirmClick}><span>반    려</span></button>
          )}
        </div>
      </div>
    </div>
  );
};

RejectReasonModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  reason: PropTypes.string,
  isViewOnly: PropTypes.bool,
};

RejectReasonModal.defaultProps = {
  reason: '',
  isViewOnly: false,
};

export default RejectReasonModal;
