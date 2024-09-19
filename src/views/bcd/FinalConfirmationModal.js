import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/bcd/FinalConfirmationModal.css';

/* 최종 확인 모달 */
const FinalConfirmationModal = ({
  show,
  onClose,
  applicant,
  recipient,
  cardType,
  quantity,
  onConfirm,
}) => {
  if (!show) return null;

  return (
    <div className="final-modal-overlay">
      <div className="final-modal-container">
        <h3>명함신청 최종 확인</h3>
        <div className="confirmation-details">
          <div className="detail-row">
            <p className="detail-label">
              <strong>신청자</strong>
            </p>
            <p className="detail-value">
              {applicant.name} ({applicant.id})
            </p>
          </div>
          <div className="detail-row">
            <p className="detail-label">
              <strong>대상자</strong>
            </p>
            <p className="detail-value">
              {recipient.name} ({recipient.id})
            </p>
          </div>
          <div className="detail-row">
            <p className="detail-label">
              <strong>명함 종류</strong>
            </p>
            <p className="detail-value">{cardType}</p>
          </div>
          <div className="detail-row">
            <p className="detail-label">
              <strong>수량</strong>
            </p>
            <p className="detail-value">{quantity} 통</p>
          </div>
        </div>
        <div className="final-modal-buttons">
          <button className="final-modal-button cancel" onClick={onClose}>
            <span>취 소</span>
          </button>
          <button className="final-modal-button confirm" onClick={onConfirm}>
            <span>확 인</span>
          </button>
        </div>
      </div>
    </div>
  );
};

FinalConfirmationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  applicant: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,
  recipient: PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,
  cardType: PropTypes.string.isRequired,
  quantity: PropTypes.number.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default FinalConfirmationModal;
