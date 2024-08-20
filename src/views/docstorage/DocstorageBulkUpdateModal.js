import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import '../../styles/docstorage/DocstorageAddModal.css';
import { AuthContext } from '../../components/AuthContext';

const DocstorageBulkUpdateModal = ({ show, onClose, onSave, selectedDetailIds }) => {
  const { auth } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    teamNm: '',
    manager: '',
    subManager: '',
    storageYear: '',
    createDate: '',
    transferDate: '',
    tsdNum: '',
    disposalDate: '',
    dpdNum: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSaveClick = () => {
    const payload = {
      detailIds: selectedDetailIds,  
      ...formData,
      deptCd: auth.deptCd,
    };

    onSave(payload);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      teamNm: '',
      manager: '',
      subManager: '',
      storageYear: '',
      createDate: '',
      transferDate: '',
      tsdNum: '',
      disposalDate: '',
      dpdNum: '',
    });
    onClose(); 
  };

  if (!show) return null;

  return (
    <div className="docstorage-modal-overlay">
      <div className="docstorage-modal-container">
        <div className="modal-header">
          <h3>문서보관 항목 일괄 수정</h3>
          <button className="docstorage-close-button" onClick={handleClose}>
            X
          </button>
        </div>
        <p className="docstorage-instructions">
            문서 항목을 일괄 수정하세요.
        </p>
        <div className="docstorage-modal-content">
          <div className="docstorage-add-section">
            <div className="docstorage-add-detail-row">
              <label>팀명</label>
              <input
                type="text"
                name="teamNm"
                value={formData.teamNm}
                onChange={handleChange}
              />
            </div>
            <div className="docstorage-add-detail-row">
              <label>관리자(정)</label>
              <input
                type="text"
                name="manager"
                value={formData.manager}
                onChange={handleChange}
              />
            </div>
            <div className="docstorage-add-detail-row">
              <label>관리자(부)</label>
              <input
                type="text"
                name="subManager"
                value={formData.subManager}
                onChange={handleChange}
              />
            </div>
            <div className="docstorage-add-detail-row">
              <label>보존연한</label>
              <input
                type="text"
                name="storageYear"
                value={formData.storageYear}
                onChange={handleChange}
              />
            </div>
            <div className="docstorage-add-detail-row">
              <label>생성일자</label>
              <input
                type="text"
                name="createDate"
                value={formData.createDate}
                onChange={handleChange}
              />
            </div>
            <div className="docstorage-add-detail-row">
              <label>이관일자</label>
              <input
                type="text"
                name="transferDate"
                value={formData.transferDate}
                onChange={handleChange}
              />
            </div>
            <div className="docstorage-add-detail-row">
              <label>기안번호</label>
              <input
                type="text"
                name="tsdNum"
                value={formData.tsdNum}
                onChange={handleChange}
              />
            </div>
            <div className="docstorage-add-detail-row">
              <label>폐기일자</label>
              <input
                type="text"
                name="disposalDate"
                value={formData.disposalDate}
                onChange={handleChange}
              />
            </div>
            <div className="docstorage-add-detail-row">
              <label>기안번호</label>
              <input
                type="text"
                name="dpdNum"
                value={formData.dpdNum}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <div className="docstorage-modal-buttons">
          <button
            className="docstorage-modal-button confirm"
            onClick={handleSaveClick}
          >
            수정하기
          </button>
        </div>
      </div>
    </div>
  );
};

DocstorageBulkUpdateModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  selectedDetailIds: PropTypes.array.isRequired,
};

export default DocstorageBulkUpdateModal;
