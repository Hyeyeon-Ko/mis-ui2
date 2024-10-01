import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { AuthContext } from '../../components/AuthContext';
import '../../styles/rental/RentalAddModal.css';
import { addFormData, formFields } from '../../datas/rentalDatas';
import useRentalChange from '../../hooks/useRentalChange';



const RentalAddModal = ({ show, onClose, onSave }) => {
  const { auth } = useContext(AuthContext); 
  const {handleChange, handleTabChange, handleFileChange, formData, file, activeTab, setFormData, setActiveTab, setFile} = useRentalChange();

  const resetFormData = () => {
    setFormData(addFormData);
    setFile(null);
    setActiveTab('file');
  };

  const validateDateFormat = (dateStr) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
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
          .slice(5)
          .filter((row) => row[1])
          .map((row) => ({
            category: row[1] !== undefined ? row[1].toString() : '',
            companyNm: row[2] !== undefined ? row[2].toString() : '',
            contractNum: row[3] !== undefined ? row[3].toString() : '',
            modelNm: row[4] !== undefined ? row[4].toString() : '',
            installDate: row[5] !== undefined ? row[5].toString() : '',
            expiryDate: row[6] !== undefined ? row[6].toString() : '',
            rentalFee: row[7] !== undefined ? row[7].toString() : '',
            location: row[8] !== undefined ? row[8].toString() : '',
            installationSite: row[9] !== undefined ? row[9].toString() : '',
            specialNote: row[10] !== undefined ? row[10].toString() : '',
            instCd: auth.instCd, 
          }));

        axios.post(`/api/rental/data`, extractedData)
          .then((response) => {
            onSave(response.data); 
            onClose();
          })
          .catch((error) => {
            console.error('Error sending data:', error);
            if (error.response && error.response.status === 400) {
              alert("모든 항목을 입력하세요."); 
            } else {
              alert('데이터 전송 중 오류가 발생했습니다.');
            }
          });
      };
      reader.readAsArrayBuffer(file);
    } else if (activeTab === 'text') {
        const {
          category,
          companyNm,
          contractNum,
          modelNm,
          installDate,
          expiryDate,
          rentalFee,
          location,
          installationSite,
          specialNote,
        } = formData;
      
        if (
          !category ||
          !companyNm ||
          !contractNum ||
          !modelNm ||
          !installDate ||
          !expiryDate ||
          !rentalFee ||
          !location ||
          !installationSite
        ) {
          alert('모든 항목을 입력해 주세요.');
          return;
        }
      
        if (!validateDateFormat(installDate)) {
          alert('설치일자는 YYYY-MM-DD 형식으로 입력해 주세요.');
          return;
        }
      
        if (!validateDateFormat(expiryDate)) {
          alert('만료일자는 YYYY-MM-DD 형식으로 입력해 주세요.');
          return;
        }
      
        const payload = {
          category,
          companyNm,
          contractNum,
          modelNm,
          installDate,
          expiryDate,
          rentalFee,
          location,
          installationSite,
          specialNote,
        };
      
      axios.post(`/api/rental/`, payload)
        .then(response => {
          onSave([payload]);
          alert('항목이 성공적으로 추가되었습니다.');
          resetFormData();
          onClose();
        })
        .catch(error => {
          console.error('Error sending data:', error);
          if (error.response && error.response.status === 400) {
            alert("계약번호는 중복이 불가합니다");
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

  if (!show) return null;

  return (
    <div className="rental-modal-overlay">
      <div className="rental-modal-container">
        <div className="modal-header">
          <h3>렌탈 항목 추가</h3>
          <button className="rental-close-button" onClick={handleClose}>X</button>
        </div>
        <p className="rental-instructions">엑셀 파일 첨부 혹은 직접 입력으로 렌탈 항목을 추가하세요.</p>
        <div className="rental-tab-container">
          <button className={`rental-tab ${activeTab === 'file' ? 'active' : ''}`} onClick={() => handleTabChange('file')}>
            파일 첨부하기
          </button>
          <button className={`rental-tab ${activeTab === 'text' ? 'active' : ''}`} onClick={() => handleTabChange('text')}>
            직접 입력하기
          </button>
        </div>
        <hr className="modal-tab-separator" />
        <div className="rental-modal-content">
          {activeTab === 'file' && (
            <div className="rental-add-section">
              <div className="rental-add-detail-row">
                <label>첨부파일 선택</label>
                <input type="file" name="file" accept=".xlsx, .xls" onChange={handleFileChange} />
              </div>
            </div>
          )}
          {activeTab === 'text' && (
            <div className="rental-add-section">
              {formFields.map((field, index) => (
                <div className="rental-add-detail-row" key={index}>
                  <label>{field.label}</label>
                  <input
                    type="text"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder || ''}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rental-modal-buttons">
          <button className="rental-modal-button confirm" onClick={handleSaveClick}>
            추가하기
          </button>
        </div>
      </div>
    </div>
  );
};

RentalAddModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default RentalAddModal;
