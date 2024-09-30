import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';
import '../../styles/docstorage/DocstorageAddModal.css';
import { AuthContext } from '../../components/AuthContext';
import { validateForm } from '../../hooks/validateForm';

const DocstorageUpdateModal = ({ show, onClose, onSave, docData, modalType }) => {
  const { auth } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    teamNm: '',
    docId: '',
    docNm: '',
    manager: '',
    subManager: '',
    storageYear: '',
    createDate: '',
    location: '',
    transferDate: '',
    tsdNum: '',
    disposalDate: '',
    dpdNum: '',
  });

  useEffect(() => {
    if (docData) {
      setFormData({
        teamNm: docData.teamNm || '',
        docId: docData.docId || '',
        docNm: docData.docNm || '',
        manager: docData.manager || '',
        subManager: docData.subManager || '',
        storageYear: docData.storageYear || '',
        createDate: docData.createDate || '',
        location: docData.location || '',
        transferDate: docData.transferDate || '',
        tsdNum: docData.tsdNum || '',
        disposalDate: docData.disposalDate || '',
        dpdNum: docData.dpdNum || '',
      });
    }
  }, [docData]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSaveClick = () => {
    if (!docData) {  
      if (!file) {
        alert('파일을 첨부해주세요.');
        return;
      }
  
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
          header: 1,
          defval: '',
        });
  
        const extractedData = worksheet
          .slice(4)
          .filter((row) => row[0])
          .map((row) => ({
            no: row[0],
            deptCd: auth.deptCd,
            teamNm: row[1] !== undefined ? row[1].toString() : '',
            docId: row[2] !== undefined ? row[2].toString() : '',
            location: row[3] !== undefined ? row[3].toString() : '',
            docNm: row[4] !== undefined ? row[4].toString() : '',
            manager: row[5] !== undefined ? row[5].toString() : '',
            subManager: row[6] !== undefined ? row[6].toString() : '',
            storageYear: row[7] !== undefined ? row[7].toString() : '',
            createDate: row[8] !== undefined ? row[8].toString() : '',
            transferDate: row[9] !== undefined ? row[9].toString() : '',
            tsdNum: row[10] !== undefined ? row[10].toString() : '',
            disposalDate: row[11] !== undefined ? row[11].toString() : '',
            dpdNum: row[12] !== undefined ? row[12].toString() : '',
          }));
  
        onSave(extractedData, true);
        onClose();
      };
      reader.readAsArrayBuffer(file);
    } else { 
      const requiredInputs = {
        teamNm: formData.teamNm,
        docId: formData.docId,
        docNm: formData.docNm,
        manager: formData.manager,
        subManager: formData.subManager,
        storageYear: formData.storageYear,
        createDate: formData.createDate,
        disposalDate: formData.disposalDate,
      }

      const inputDates = {
        createDate: formData.createDate,
        disposalDate: formData.disposalDate,
      }

      const { isValid, message } = validateForm('DocStorage', requiredInputs, '', inputDates);
      if (!isValid) {
          alert(message);
          return;
      }
  
      const payload = {
        ...requiredInputs,
        deptCd: auth.deptCd,
        location: formData.location,
        transferDate: formData.transferDate,
        tsdNum: formData.tsdNum,
        dpdNum: formData.dpdNum,
      };
  
      onSave(payload, false);
      onClose();
    }
  };
  
  if (!show) return null;

  const isDisabled = (field) => {
    if (modalType === "admin") {
      return ['location', 'transferDate', 'tsdNum', 'dpdNum'].includes(field) ? false : true;
    }
    return ['location', 'transferDate', 'tsdNum', 'dpdNum'].includes(field) ? true : false;
  };

  return (
    <div className="docstorage-modal-overlay">
      <div className="docstorage-modal-container">
        <div className="modal-header">
          <h3>문서보관 항목 수정</h3>
          <button className="docstorage-close-button" onClick={onClose}>
            X
          </button>
        </div>
        <p className="docstorage-instructions">
          {docData
            ? '문서 항목을 수정하세요.'
            : '엑셀 파일을 첨부해 문서 항목을 수정하세요.'}
        </p>
        <div className="docstorage-modal-content">
          {docData ? (  
            <div className="docstorage-add-section">
              <div className="docstorage-add-detail-row">
                <label>팀명 <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  name="teamNm"
                  value={formData.teamNm}
                  onChange={handleChange}
                  disabled={isDisabled('teamNm')}
                />
              </div>
              <div className="docstorage-add-detail-row">
                <label>문서관리번호 <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  name="docId"
                  value={formData.docId}
                  onChange={handleChange}
                  disabled={isDisabled('docId')}
                />
              </div>
              <div className="docstorage-add-detail-row">
                <label>입고위치</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  placeholder={isDisabled('transferDate') ? "사후 입력" : "ex) 19a-1-1"}
                  onChange={handleChange}
                  disabled={isDisabled('location')}
                />
              </div>
              <div className="docstorage-add-detail-row">
                <label>문서명 <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  name="docNm"
                  value={formData.docNm}
                  onChange={handleChange}
                  disabled={isDisabled('docNm')}
                />
              </div>
              <div className="docstorage-add-detail-row">
                <label>관리자(정) <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  disabled={isDisabled('manager')}
                />
              </div>
              <div className="docstorage-add-detail-row">
                <label>관리자(부) <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  name="subManager"
                  value={formData.subManager}
                  onChange={handleChange}
                  disabled={isDisabled('subManager')}
                />
              </div>
              <div className="docstorage-add-detail-row">
                <label>보존연한 <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  name="storageYear"
                  value={formData.storageYear}
                  onChange={handleChange}
                  disabled={isDisabled('storageYear')}
                />
              </div>
              <div className="docstorage-add-detail-row">
                <label>생성일자 <span style={{ color: 'red' }}>*</span></label>
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
                <label>폐기일자 <span style={{ color: 'red' }}>*</span></label>
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
                  value={formData.dpdNum}
                  placeholder={isDisabled('transferDate') ? "사후 입력" : ""}
                  onChange={handleChange}
                  disabled={isDisabled('dpdNum')}
                />
              </div>
            </div>
          ) : (  
            <div className="docstorage-add-section">
              <div className="docstorage-add-detail-row">
                <label>첨부파일 선택</label>
                <input
                  type="file"
                  name="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          )}
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

DocstorageUpdateModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  docData: PropTypes.object,
};

export default DocstorageUpdateModal;
