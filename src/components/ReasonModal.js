import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../styles/ReasonModal.css';

/* 사유 모달 */
const ReasonModal = ({ show, onClose, onConfirm, reason = '', isViewOnly = false, modalType = 'reject' }) => {
  const [inputReason, setInputReason] = useState(reason);
  const [selectedFileType, setSelectedFileType] = useState('');

  useEffect(() => {
    setInputReason(reason);
    if (modalType !== 'download') {
      setSelectedFileType('');
    }
  }, [reason, modalType]);

  const handleTextareaChange = (event) => {
    setInputReason(event.target.value);
  };

  const handleFileTypeChange = (event) => {
    setSelectedFileType(event.target.value);
  };

  const handleConfirmClick = () => {
    if (modalType === 'download' && !selectedFileType) {
      alert('다운로드 타입을 선택하세요.');
      return;
    }
    onConfirm({ reason: inputReason, fileType: selectedFileType });
    onClose();
  };

  if (!show) return null;

  const getTitle = () => {
    switch (modalType) {
      case 'reject':
        return isViewOnly ? '반려 이유' : '반려 사유 작성';
      case 'download':
        return '파일 다운로드 사유 작성';
      default:
        return '사유 작성';
    }
  };

  const getPlaceholder = () => {
    switch (modalType) {
      case 'reject':
        return '반려 사유를 작성해주세요.\n해당 내용은 명함 신청자에게 전달됩니다.';
      case 'download':
        return '파일 다운로드 사유를 작성해주세요.';
      default:
        return '사유를 작성해주세요.';
    }
  };

  return (
    <div className="reject-modal-overlay">
      <div className="reject-modal-container">
        <h3>{getTitle()}</h3>
        {modalType === 'download' && !isViewOnly && (
          <div className="input-group">
            <select               
              id="fileType"
              value={selectedFileType}
              onChange={handleFileTypeChange}
            >
              <option value="">타입 선택</option>
              <option value="check">확인용</option>
              <option value="order">발주용</option>
              <option value="approval">승인/반려용</option>
              <option value="draft">기안상신용</option>
            </select>
          </div>
        )}
        {isViewOnly ? (
          <div className="reject-reason-content">
            {inputReason || "사유가 제공되지 않았습니다."}
          </div>
        ) : (
          <textarea
            placeholder={getPlaceholder()}
            value={inputReason}
            onChange={handleTextareaChange}
          />
        )}
        <div className="reject-modal-buttons">
          <button className="reject-modal-button cancel" onClick={onClose}><span>취소</span></button>
          {!isViewOnly && (
            <button className="reject-modal-button confirm" onClick={handleConfirmClick}><span>확인</span></button>
          )}
        </div>
      </div>
    </div>
  );
};

ReasonModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  reason: PropTypes.string,
  isViewOnly: PropTypes.bool,
  modalType: PropTypes.string,
};

export default ReasonModal;
