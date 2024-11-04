import React, { useContext, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { AuthContext } from '../../components/AuthContext';
import useTonerChange from '../../hooks/useTonerChange';
import '../../styles/toner/TonerAddModal.css';
import { addFormData, formFields, divisionMap } from '../../datas/tonerData';
import { usePriceChange } from '../../hooks/usePriceChange';

const TonerPriceModal = ({ show, onClose, onSave, editMode, selectedData }) => {
  const { auth } = useContext(AuthContext);
  const { handleChange, handleTabChange, handleFileChange, formData, file, activeTab, setFormData, setActiveTab, setFile } = useTonerChange();

  const [formattedPrice, setFormattedPrice, handleUsePriceChange] = usePriceChange();

  const resetFormData = useCallback(() => {
    setFormData({ ...addFormData });
    setFile(null);
    setActiveTab('text');
  }, [setFormData, setFile, setActiveTab]);

  useEffect(() => {
    if (editMode && selectedData) {
      setFormData({
        modelNm: selectedData.modelNm || '',
        company: selectedData.company || '',
        tonerNm: selectedData.tonerNm || '',
        division: selectedData.division || '',
        price: selectedData.price || '',
        specialNote: selectedData.specialNote || '',
      });
      setFormattedPrice(selectedData.price || '');
    } else {
      resetFormData();
    }
  }, [editMode, selectedData, resetFormData, setFormData, setFormattedPrice]);



  const sendTonerExcel = async (data) => {
    try {
      const requestData = {
        details: data,
        instCd: auth.instCd,
        userId: auth.userId,
      };

      //TODO: api 개발 후 변경
      const response = await axios.post('/api/toner/excel', requestData);
      alert('항목이 성공적으로 추가되었습니다');
      onSave(response.data); 
      onClose();
    } catch (error) {
      console.error('Error sending data to the backend:', error);
      alert('엑셀 데이터를 전송하는 중 오류가 발생했습니다.');
    }
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
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const worksheetData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          raw: false,
          dateNF: 'yyyy-mm-dd',
        });

        const extractedData = worksheetData
          .slice(17) 
          .map((row) => ({
            company: row[2],  
            modelNm: row[3],   
            tonerNm: row[4],   
            division: row[5],  
            price: row[6],
            specialNote: row[7],  
          }));

          sendTonerExcel(extractedData); 
      };
      reader.readAsArrayBuffer(file);
    } else {
      const { modelNm, company, tonerNm, division, price, specialNote } = formData;
      const missingFields = [];

      if (!modelNm) missingFields.push('모델명');
      if (!company) missingFields.push('제조사');
      if (!tonerNm) missingFields.push('토너명');
      if (!division) missingFields.push('구분');
      if (!price) missingFields.push('가격');

      if (missingFields.length > 0) {
        alert(`다음 항목을 입력해주세요:\n${missingFields.join('\n')}`);
        return;
      }

      const mappedDivision = divisionMap[division] || division;

      const requestData = {
        modelNm,
        company,
        tonerNm,
        division: mappedDivision, 
        price: formattedPrice,
        specialNote,
      };

      if (editMode) {
        axios.put(`/api/toner/price/${selectedData.tonerNm}`, requestData, {
          params: {
            userId: auth.userId 
          },
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            onSave([response.data]);
            alert('항목이 성공적으로 수정되었습니다.');
            resetFormData();
            onClose();
          })
          .catch(error => {
            console.error('Error updating data:', error);
            alert('데이터 수정 중 오류가 발생했습니다.');
          });        
      } else {
        axios.post(`/api/toner/price`, requestData, {
          params: {
            userId: auth.userId,
          },
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(response => {
            onSave([response.data]);
            alert('항목이 성공적으로 추가되었습니다.');
            resetFormData();
            onClose();
          })
          .catch(error => {
            console.error('Error adding data:', error);
            alert('데이터 저장 중 오류가 발생했습니다.');
          });
      }
    }
  };

  if (!show) return null;

  return (
    <div className="toner-modal-overlay">
      <div className="toner-modal-container">
        <div className="modal-header">
          <h3>{editMode ? '토너 단가 항목 수정' : '토너 단가 항목 추가'}</h3>
          <button className="toner-close-button" onClick={onClose}>X</button>
        </div>
        <div className="toner-instructions">
          {editMode ? '항목을 수정하세요.' : '엑셀 파일 첨부 혹은 직접 입력으로 항목을 추가하세요.'}
        </div>
        {!editMode && (
          <div className="toner-tab-container">
            <button className={`toner-tab ${activeTab === 'text' ? 'active' : ''}`} onClick={() => handleTabChange('text')}>
              직접 입력하기
            </button>
            <button className={`toner-tab ${activeTab === 'file' ? 'active' : ''}`} onClick={() => handleTabChange('file')}>
              파일 첨부하기
            </button>
          </div>
        )}
        <hr className="modal-tab-separator" />
        <div className="toner-modal-content">
          {!editMode && activeTab === 'file' && (
            <div className="toner-add-section">
              <div className="toner-add-detail-row">
                <label>첨부파일 선택</label>
                <input type="file" name="file" accept=".xlsx, .xls" onChange={handleFileChange} />
              </div>
            </div>
          )}
          {(editMode || activeTab === 'text') && (
            <div className="toner-add-section">
              {formFields.map((field, index) => (
                <div className="toner-add-detail-row" key={index}>
                  <label>
                    {field.label} {field.isRequired && <span>*</span>}
                  </label>
                  {field.name === 'division' ? (
                    <select
                      name="division"
                      value={formData.division || ''} 
                      onChange={handleChange}
                      required
                    >
                      <option value="">선택하세요</option>
                      <option value="드럼">드럼</option>
                      <option value="번들">번들</option>
                      <option value="유지보수키트">유지보수키트</option>
                      <option value="잉크">잉크</option>
                      <option value="토너">토너</option>
                    </select>
                  ) : field.name === 'tonerNm' && editMode ? (
                    <input
                      type="text"
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      placeholder={field.placeholder || ''}
                      disabled 
                    />
                  ) : field.name === 'price' ? (
                    <input
                      type="text"
                      name="price"
                      value={formattedPrice}
                      onChange={(e) => {
                        handleUsePriceChange(e);
                        handleChange(e);
                      }}
                      placeholder={field.placeholder || ''}
                    />
                  ) : (
                    <input
                      type="text"
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleChange}
                      placeholder={field.placeholder || ''}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="toner-modal-buttons">
          <button className="toner-modal-button confirm" onClick={handleSaveClick}>
            {editMode ? '수정하기' : '추가하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

TonerPriceModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  editMode: PropTypes.bool,
  selectedData: PropTypes.object,
};

export default TonerPriceModal;
