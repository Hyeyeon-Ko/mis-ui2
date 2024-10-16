import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import * as XLSX from 'xlsx';
import '../../styles/docstorage/DocstorageAddModal.css';
import { AuthContext } from '../../components/AuthContext';
import { validateForm } from '../../hooks/validateForm';
import { dockStorageFormData } from '../../datas/dockstorageDatas';
import useDocstorageChange from '../../hooks/useDocstorageChange';
import { useDateChange } from '../../hooks/apply/useDateChange';

const DocstorageAddModal = ({ show, onClose, onSave }) => {
  const { file, activeTab, formData, handleTabChange, handleFileChange, handleChange, setFormData, setFile, setActiveTab } = useDocstorageChange();
  const { auth } = useContext(AuthContext);
  const [formattedCreationDate, handleCreationDateChange] = useDateChange();
  const [formattedDisposalDate, handleDisposalDateChange] = useDateChange();

  const resetFormData = () => {
    setFormData(dockStorageFormData);
    setFile(null);
    setActiveTab('file');
  };

  const handleSaveClick = () => {
    if (activeTab === 'file') {
      if (!file) {
        alert('파일을 첨부해주세요.');
        return;
      }
  
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
  
        const jsonOptions = {
          header: 1,
          defval: '',
          raw: false, 
          dateNF: 'yyyy-mm-dd',
        };
  
        const worksheetData = XLSX.utils.sheet_to_json(worksheet, jsonOptions);
  
        const extractedData = worksheetData
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
  
        const docStorageExcelRequestDTO = {
          details: extractedData,
          docStorageExcelApplyRequestDTO: {
            instCd: auth.instCd,
            deptCd: auth.deptCd,
            drafter: auth.userNm,
            drafterId: auth.userId,
          },
        };  
  
        axios
          .post('/api/docstorage/data', docStorageExcelRequestDTO)
          .then((response) => {
            onSave(response.data);
            resetFormData();
            onClose();
          })
          .catch((error) => {
            console.error('Error sending data:', error);
            if (error.response && error.response.status === 400) {
              alert("문서관리번호는 중복이 불가합니다"); 
            } else {
              alert('데이터 전송 중 오류가 발생했습니다.');
            }
          });
      };
      reader.readAsArrayBuffer(file);
    } else if (activeTab === 'text') {

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
        deptCd: auth.deptCd,
        teamNm: formData.teamNm,
        docId: formData.docId,
        docNm: formData.docNm,
        manager: formData.manager,
        subManager: formData.subManager,
        storageYear: formData.storageYear,
        createDate: formData.createDate,
        location: formData.location,
        transferDate: formData.transferDate,
        tsdNum: formData.tsdNum,
        disposalDate: formData.disposalDate,
        dpdNum: formData.dpdNum,
      };

      axios
        .post('/api/docstorage/', payload)
        .then(response => {
          onSave([payload]);
          alert('항목이 성공적으로 추가되었습니다.');
          resetFormData();
          onClose();
        })
        .catch(error => {
          console.error('There was an error saving the data!', error);
          if (error.response && error.response.status === 400) {
            alert("문서관리번호는 중복이 불가합니다");
          } else {
            alert('데이터 저장 중 오류가 발생했습니다.');
          }
        });
    }
  };

  const handleClose = () => {
    resetFormData();
    onClose();
  };

  const inputFields = [
    { label: '팀명', name: 'teamNm', isRequired: true },
    { label: '문서관리번호', name: 'docId', isRequired: true },
    { label: '입고위치', name: 'location', placeholder: '사후 입력', disabled: true },
    { label: '문서명', name: 'docNm', isRequired: true },
    { label: '관리자(정)', name: 'manager', isRequired: true },
    { label: '관리자(부)', name: 'subManager', isRequired: true },
    { label: '보존연한', name: 'storageYear', placeholder: '5년', isRequired: true },
    { label: '생성일자', name: 'createDate', placeholder: 'YYYY-MM-DD', isRequired: true },
    { label: '이관일자', name: 'transferDate', placeholder: '사후 입력', disabled: true },
    { label: '이관신청번호', name: 'tsdNum', placeholder: '사후 입력', disabled: true },
    { label: '폐기일자', name: 'disposalDate', placeholder: 'YYYY-MM-DD', isRequired: true },
    { label: '폐기신청번호', name: 'dpdNum', placeholder: '사후 입력', disabled: true },
  ];

  if (!show) return null;

  return (
    <div className="docstorage-modal-overlay">
      <div className="docstorage-modal-container">
        <div className="modal-header">
          <h3>문서보관 항목 추가</h3>
          <button className="docstorage-close-button" onClick={handleClose}>
            X
          </button>
        </div>
        <p className="docstorage-instructions">
          엑셀 파일 첨부 혹은 직접 입력으로 문서 항목을 추가하세요.
        </p>
        <div className="docstorage-tab-container">
          <button
            className={`docstorage-tab ${activeTab === 'file' ? 'active' : ''}`}
            onClick={() => handleTabChange('file')}
          >
            파일 첨부하기
          </button>
          <button
            className={`docstorage-tab ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => handleTabChange('text')}
          >
            직접 입력하기
          </button>
        </div>
        <hr className="modal-tab-separator" />
        <div className="docstorage-modal-content">
          {activeTab === 'file' && (
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

          {activeTab === 'text' && (
            <div className="docstorage-add-section">
              {inputFields.map(({ label, name, isRequired, placeholder, disabled }) => (
              <div className="docstorage-add-detail-row" key={name}>
                <label>
                  {label} {isRequired && <span>*</span>}
                </label>
                <input
                  type="text"
                  name={name}
                  value={
                    name === 'createDate' ? formattedCreationDate :
                    name === 'disposalDate' ? formattedDisposalDate :
                    formData[name] // 그 외의 경우는 기존 formData에서 가져옴
                  }
                  onChange={(e) => {
                    if (name === 'createDate') {
                        handleCreationDateChange(e);
                    } else if (name === 'disposalDate') {
                        handleDisposalDateChange(e);
                    }
                    handleChange(e); // 일반 핸들러 호출
                  }}
                  placeholder={placeholder || ''}
                  disabled={disabled || false}
                />
              </div>
            ))}
            
            </div>
          )}
        </div>
        <div className="docstorage-modal-buttons">
          <button
            className="docstorage-modal-button confirm"
            onClick={handleSaveClick}
          >
            추가하기
          </button>
        </div>
      </div>
    </div>
  );
};

DocstorageAddModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default DocstorageAddModal;
