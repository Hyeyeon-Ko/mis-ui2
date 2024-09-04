import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const RentalBulkUpdateModal = ({ show, onClose, onSave, selectedDetailIds }) => {
  const [formData, setFormData] = useState({
    category: '',
    companyNm: '',
    contractNum: '',
    modelNm: '',
    installDate: '',
    expiryDate: '',
    rentalFee: '',
    location: '',
    installationSite: '',
    specialNote: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateDateFormat = (dateStr) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  };

  const handleClose = () => {
    setFormData({
      category: '',
      companyNm: '',
      contractNum: '',
      modelNm: '',
      installDate: '',
      expiryDate: '',
      rentalFee: '',
      location: '',
      installationSite: '',
      specialNote: '',
    });
    onClose(); // 모달을 닫는 함수 호출
  };

  const handleSaveClick = async () => {
    const { installDate, expiryDate } = formData;

    if (installDate && !validateDateFormat(installDate)) {
      alert('설치일자는 YYYY-MM-DD 형식으로 입력해 주세요.');
      return;
    }

    if (expiryDate && !validateDateFormat(expiryDate)) {
      alert('만료일자는 YYYY-MM-DD 형식으로 입력해 주세요.');
      return;
    }

    const payload = {
        detailIds: selectedDetailIds,
        ...formData,
    };

    try {
        await axios.put(`${apiUrl}/api/rental/bulkUpdate`, payload);
        alert('렌탈 정보가 성공적으로 수정되었습니다.');

        setFormData({
            category: '',
            companyNm: '',
            contractNum: '',
            modelNm: '',
            installDate: '',
            expiryDate: '',
            rentalFee: '',
            location: '',
            installationSite: '',
            specialNote: '',
        });

        onSave(payload);
    } catch (error) {
    console.error('렌탈 정보 수정 중 에러 발생:', error);
    alert('렌탈 정보 수정에 실패했습니다.');
    }
  };

  if (!show) return null;

  return (
    <div className="rental-modal-overlay">
      <div className="rental-modal-container">
        <div className="modal-header">
          <h3>렌탈 항목 일괄 수정</h3>
          <button className="rental-close-button" onClick={handleClose}>
            X
          </button>
        </div>
        <p className="rental-instructions">
          일괄 수정할 항목에 내용을 입력하세요.
        </p>
        <div className="rental-modal-content">
          <div className="rental-add-section">
            <div className="rental-add-detail-row">
              <label>제품군</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
              />
            </div>
            <div className="rental-add-detail-row">
              <label>업체명</label>
              <input
                type="text"
                name="companyNm"
                value={formData.companyNm}
                onChange={handleChange}
              />
            </div>
            <div className="rental-add-detail-row">
              <label>계약번호</label>
              <input
                type="text"
                name="contractNum"
                value={formData.contractNum}
                disabled={true}
                onChange={handleChange}
              />
            </div>
            <div className="rental-add-detail-row">
              <label>모델명</label>
              <input
                type="text"
                name="modelNm"
                value={formData.modelNm}
                onChange={handleChange}
              />
            </div>
            <div className="rental-add-detail-row">
              <label>설치일자</label>
              <input
                type="text"
                name="installDate"
                value={formData.installDate}
                onChange={handleChange}
                placeholder="YYYY-MM-DD"
              />
            </div>
            <div className="rental-add-detail-row">
              <label>만료일자</label>
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                placeholder="YYYY-MM-DD"
              />
            </div>
            <div className="rental-add-detail-row">
              <label>렌탈료</label>
              <input
                type="text"
                name="rentalFee"
                value={formData.rentalFee}
                onChange={handleChange}
              />
            </div>
            <div className="rental-add-detail-row">
              <label>위치분류</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
            <div className="rental-add-detail-row">
              <label>설치위치</label>
              <input
                type="text"
                name="installationSite"
                value={formData.installationSite}
                onChange={handleChange}
              />
            </div>
            <div className="rental-add-detail-row">
              <label>특이사항</label>
              <input
                type="text"
                name="specialNote"
                value={formData.specialNote}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <div className="rental-modal-buttons">
          <button
            className="rental-modal-button confirm"
            onClick={handleSaveClick}
          >
            수정하기
          </button>
        </div>
      </div>
    </div>
  );
};

RentalBulkUpdateModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  selectedDetailIds: PropTypes.array.isRequired,
};

export default RentalBulkUpdateModal;
