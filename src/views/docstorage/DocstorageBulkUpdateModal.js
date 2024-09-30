import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import '../../styles/docstorage/DocstorageAddModal.css';
import { AuthContext } from '../../components/AuthContext';
import { validateForm } from '../../hooks/validateForm';

const DocstorageBulkUpdateModal = ({ show, onClose, onSave, selectedDetailIds, modalType }) => {
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

    const inputDates = {
      transferDate: formData.transferDate,
    }

    const { isValid, message } = validateForm('DocStorage', '', '', inputDates);
      if (!isValid) {
          alert(message);
          return;
      }

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

  const isDisabled = (field) => {
    if (modalType === "admin") {
      return ['transferDate', 'tsdNum', 'dpdNum'].includes(field) ? false : true;
    }
    return ['transferDate', 'tsdNum', 'dpdNum'].includes(field) ? true : false;
  };

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
                disabled={isDisabled('teamNm')}
              />
            </div>
            <div className="docstorage-add-detail-row">
              <label>관리자(정)</label>
              <input
                type="text"
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                disabled={isDisabled('manager')}
              />
            </div>
            <div className="docstorage-add-detail-row">
              <label>관리자(부)</label>
              <input
                type="text"
                name="subManager"
                value={formData.subManager}
                onChange={handleChange}
                disabled={isDisabled('subManager')}
              />
            </div>
            <div className="docstorage-add-detail-row">
              <label>보존연한</label>
              <input
                type="text"
                name="storageYear"
                value={formData.storageYear}
                onChange={handleChange}
                disabled={isDisabled('storageYear')}
              />
            </div>
            <div className="docstorage-add-detail-row">
              <label>생성일자</label>
              <input
                type="text"
                name="createDate"
                placeholder="YYYY-MM-DD"
                value={formData.createDate}
                onChange={handleChange}
                disabled={isDisabled('createDate')}
              />
            </div>
            <div className="docstorage-add-detail-row">
              <label>이관일자</label>
              <input
                type="text"
                name="transferDate"
                value={formData.transferDate}
                placeholder={isDisabled('transferDate') ? "사후 입력" : "YYYY-MM-DD"}
                onChange={handleChange}
                disabled={isDisabled('transferDate')}
              />
            </div>
            <div className="docstorage-add-detail-row">
              <label>이관신청번호</label>
              <input
                type="text"
                name="tsdNum"
                value={formData.tsdNum}
                placeholder={isDisabled('transferDate') ? "사후 입력" : "ex) 한의재단총무파트2300135"}
                onChange={handleChange}
                disabled={isDisabled('tsdNum')}
              />
            </div>
            <div className="docstorage-add-detail-row">
              <label>폐기일자</label>
              <input
                type="text"
                name="disposalDate"
                placeholder="YYYY-MM-DD"
                value={formData.disposalDate}
                onChange={handleChange}
                disabled={isDisabled('disposalDate')}
              />
            </div>
            <div className="docstorage-add-detail-row">
              <label>폐기신청번호</label>
              <input
                type="text"
                name="dpdNum"
                placeholder={isDisabled('transferDate') ? "사후 입력" : ""}
                value={formData.dpdNum}
                onChange={handleChange}
                disabled={isDisabled('dpdNum')}
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
