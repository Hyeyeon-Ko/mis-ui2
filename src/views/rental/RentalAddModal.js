import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { AuthContext } from '../../components/AuthContext';
import '../../styles/rental/RentalAddModal.css';
import { addFormData, formFields } from '../../datas/rentalDatas';
import useRentalChange from '../../hooks/useRentalChange';
import { useDateChange } from '../../hooks/apply/useDateChange';
import { usePriceChange } from '../../hooks/usePriceChange';

const RentalAddModal = ({ show, onClose, onSave }) => {
  const { auth } = useContext(AuthContext); 
  const {handleChange, handleTabChange, handleFileChange, formData, file, activeTab, setFormData, setActiveTab, setFile} = useRentalChange();
  const [formattedInstallDate, handleInstallDateChange] = useDateChange();
  const [formattedExpiryDate, handleExpiryDateChange] = useDateChange();
  const [formattedRentalFee, handleRentalFeeChange] = usePriceChange();

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
            if (error.response && error.response.data && error.response.data.message) {
              alert(`${error.response.data.message}`);
            } else {
              alert('데이터 저장 중 오류가 발생했습니다.');
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
  
      const missingFields = [];
  
      if (!category) missingFields.push('제품군');
      if (!companyNm) missingFields.push('업체명');
      if (!contractNum) missingFields.push('계약번호');
      if (!modelNm) missingFields.push('모델명');
      if (!installDate) missingFields.push('설치일자');
      if (!expiryDate) missingFields.push('만료일자');
      if (!rentalFee) missingFields.push('렌탈료');
      if (!location) missingFields.push('위치분류');
      if (!installationSite) missingFields.push('설치위치');
  
      if (missingFields.length > 0) {
        alert(`다음 항목을 입력해주세요:\n${missingFields.join('\n')}`);
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
                  <label>
                    {field.label} {field.isRequired && <span>*</span>}
                  </label>
                  {field.name === 'category' ? (
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">선택하세요</option>
                      <option value="정수기">정수기</option>
                      <option value="공기청정기">공기청정기</option>
                      <option value="비데">비데</option>
                    </select>
                  ) : field.name === 'location' ? (
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    >
                      <option value="">선택하세요</option>
                      <option value="사무실">사무실</option>
                      <option value="병원">병원</option>
                      <option value="임원실">임원실</option>
                      <option value="휴게실">휴게실</option>
                      <option value="화장실">화장실</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      name={field.name}
                      value={
                        field.name === 'installDate' ? formattedInstallDate:
                        field.name === 'expiryDate' ? formattedExpiryDate:
                        field.name === 'rentalFee' ? formattedRentalFee:
                        formData[field.name]}
                      onChange={(e) => {
                        if (field.name === 'installDate') {
                            handleInstallDateChange(e);
                        } else if (field.name === 'expiryDate') {
                            handleExpiryDateChange(e);
                        } else if (field.name === 'rentalFee') {
                          handleRentalFeeChange(e); 
                          handleChange(e); 
                        }
                        handleChange(e);
                      }}
                      placeholder={field.placeholder || ''}
                    />
                  )}
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
