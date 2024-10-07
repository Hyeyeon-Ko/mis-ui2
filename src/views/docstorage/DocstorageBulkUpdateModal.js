import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import '../../styles/docstorage/DocstorageAddModal.css';
import { AuthContext } from '../../components/AuthContext';
import { validateForm } from '../../hooks/validateForm';
import { dockStorageFormData } from '../../datas/dockstorageDatas';
import useDocstorageChange from '../../hooks/useDocstorageChange';

const DocstorageBulkUpdateModal = ({ show, onClose, onSave, selectedDetailIds, modalType }) => {
  const { auth } = useContext(AuthContext);
  const {handleChange, formData, setFormData} = useDocstorageChange();

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
    setFormData(dockStorageFormData);
    onClose(); 
  };

  if (!show) return null;

  const isDisabled = (field) => {
    if (modalType === "admin") {
      return ['transferDate', 'tsdNum', 'dpdNum'].includes(field) ? false : true;
    }
    return ['transferDate', 'tsdNum', 'dpdNum'].includes(field) ? true : false;
  };

  const fields = [
    { label: '팀명', name: 'teamNm' },
    { label: '관리자(정)', name: 'manager' },
    { label: '관리자(부)', name: 'subManager' },
    { label: '보존연한', name: 'storageYear' },
    { label: '생성일자', name: 'createDate', placeholder: 'YYYY-MM-DD' },
    { label: '이관일자', name: 'transferDate', placeholder: 'YYYY-MM-DD' },
    { label: '이관신청번호', name: 'tsdNum', placeholder: 'ex) 한의재단총무파트2300135' },
    { label: '폐기일자', name: 'disposalDate', placeholder: 'YYYY-MM-DD' },
    { label: '폐기신청번호', name: 'dpdNum' },
  ];
  
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
              {fields.map(({ label, name, placeholder }) => (
                <div className="docstorage-add-detail-row" key={name}>
                  <label>{label}</label>
                  <input
                    type="text"
                    name={name}
                    value={formData[name] || ''}
                    placeholder={placeholder}
                    onChange={handleChange}
                    disabled={isDisabled(name)}
                  />
                </div>
              ))}
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
