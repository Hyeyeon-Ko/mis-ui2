import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/common/ConfirmModal.css';


/* 확인 모달 component */
const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-container">
        <h3 dangerouslySetInnerHTML={{ __html: message }}></h3> 
        <div className="confirm-modal-buttons">
          <button className="confirm-modal-button confirm" onClick={onConfirm}>예</button>
          <button className="confirm-modal-button cancel" onClick={onCancel}>아니오</button>
        </div>
      </div>
    </div>
  );
};

ConfirmModal.propTypes = {
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ConfirmModal;