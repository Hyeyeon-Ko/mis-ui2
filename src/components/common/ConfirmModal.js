import React from 'react';
import '../../styles/ConfirmModal.css';

/* 확인 모달 component */
const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-container">
        <h3>{message}</h3>
        <div className="confirm-modal-buttons">
          <button className="confirm-modal-button confirm" onClick={onConfirm}>예</button>
          <button className="confirm-modal-button cancel" onClick={onCancel}>아니오</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
