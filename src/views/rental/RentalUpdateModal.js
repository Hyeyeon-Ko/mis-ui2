import React, {  useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import * as XLSX from 'xlsx';
import '../../styles/rental/RentalAddModal.css';
import { AuthContext } from '../../components/AuthContext';
import { formFields } from '../../datas/rentalDatas';
import useRentalChange from '../../hooks/useRentalChange';
import { useDateChange } from '../../hooks/apply/useDateChange';
import { usePriceChange } from '../../hooks/apply/usePriceChange';


const RentalUpdateModal = ({ show, onClose, onSave, rentalData }) => {
  const { auth } = useContext(AuthContext);
  const {handleChange, setFormData, formData, handleFileChange, file} = useRentalChange();
  const [formattedInstallDate, handleInstallDateChange] = useDateChange();
  const [formattedExpiryDate, handleExpiryDateChange] = useDateChange();
  const [formattedRentalFee, handleRentalFeeChange] = usePriceChange();

  useEffect(() => {
    if (rentalData) {
      setFormData({
        category: rentalData.category || '',
        companyNm: rentalData.companyNm || '',
        contractNum: rentalData.contractNum || '',
        modelNm: rentalData.modelNm || '',
        installDate: rentalData.installDate || '',
        expiryDate: rentalData.expiryDate || '',
        rentalFee: rentalData.rentalFee || '',
        location: rentalData.location || '',
        installationSite: rentalData.installationSite || '',
        specialNote: rentalData.specialNote || '',
      });

      handleInstallDateChange({ target: { value: '' } });
      handleExpiryDateChange({ target: { value: '' } });
    }
  // }, [rentalData, setFormData, handleInstallDateChange, handleExpiryDateChange]);
  }, [rentalData]); // TODO: 위처럼 하면 eslint 오류는 없어지는데 무한 루프...

  const validateDateFormat = (dateStr) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  };

  const handleSaveClick = async () => {
    if (!rentalData) {
      if (!file) {
        alert('파일을 첨부해주세요.');
        return;
      }
  
      const reader = new FileReader();
      reader.onload = async (event) => {
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
          }));
  
        try {
          await axios.post(`/api/rental/update`, extractedData);
          alert('수정이 완료되었습니다.');
          onSave(extractedData, true); 
          onClose();
        } catch (error) {
          console.error('업데이트 중 오류 발생:', error);
          if (error.response && error.response.data && error.response.data.message === '완료된 항목은 수정할 수 없습니다.') {
            alert('완료된 항목은 수정할 수 없습니다.');
          } else {
            alert('완료된 항목은 수정할 수 없습니다.');
          }
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
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
        alert('모든 필수 항목을 입력해 주세요.');
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
        instCd: auth.instCd,
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
  
      try {
        await axios.put(`/api/rental/?detailId=${rentalData.detailId}`, payload);
        onSave([payload]);
        alert('항목이 성공적으로 수정되었습니다.');
        onClose(); 
      } catch (error) {
        console.error('Error sending data:', error);
        if (error.response && error.response.data && error.response.data.message === '완료된 항목은 수정할 수 없습니다.') {
          alert('완료된 항목은 수정할 수 없습니다.');
        } else if (error.response && error.response.status === 400) {
          alert("계약번호는 중복이 불가합니다");
        } else {
          alert('데이터 수정 중 오류가 발생했습니다.');
        }
      }
    }
  };
      
  if (!show) return null;

  return (
    <div className="rental-modal-overlay">
      <div className="rental-modal-container">
        <div className="modal-header">
          <h3>렌탈 항목 수정</h3>
          <button className="rental-close-button" onClick={onClose}>
            X
          </button>
        </div>
        <p className="rental-instructions">
          {rentalData
            ? '렌탈 항목을 수정하세요.'
            : '엑셀 파일을 첨부해 렌탈 항목을 수정하세요.'}
        </p>
        <div className="rental-modal-content">
          {rentalData ? (
            <div className="rental-add-section">
              {formFields.map((field) => (
                <div className="rental-add-detail-row" key={field.name}>
                  <label>{field.label} {field.isRequired && <span>*</span>}</label>
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
                      type={field.type}
                      name={field.name}
                      value={
                        field.name === 'installDate' ? formattedInstallDate || formData[field.name]:
                        field.name === 'expiryDate' ? formattedExpiryDate || formData[field.name]:
                        field.name === 'rentalFee' ? formattedRentalFee:
                        formData[field.name] || ''}
                      onChange={(e) => {
                        if (field.name === 'installDate') {
                            handleInstallDateChange(e);
                        } else if (field.name === 'expiryDate') {
                            handleExpiryDateChange(e);
                        } else if (field.name === 'rentalFee') {
                          handleRentalFeeChange(e); 
                        }
                        handleChange(e);
                      }}
                      placeholder={field.placeholder || ''}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rental-add-section">
              <div className="rental-add-detail-row">
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
        <div className="rental-modal-buttons">
          <button className="rental-modal-button confirm" onClick={handleSaveClick}>
            수정하기
          </button>
        </div>
      </div>
    </div>
  );
};

RentalUpdateModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  rentalData: PropTypes.object,
};

export default RentalUpdateModal;
