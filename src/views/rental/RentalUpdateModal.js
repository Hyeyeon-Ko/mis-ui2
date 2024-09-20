import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import * as XLSX from 'xlsx';
import '../../styles/rental/RentalAddModal.css';
import { AuthContext } from '../../components/AuthContext';

const RentalUpdateModal = ({ show, onClose, onSave, rentalData }) => {
  const { auth } = useContext(AuthContext);
  const [file, setFile] = useState(null);
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
    }
  }, [rentalData]);

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
          }));

        try {
          axios.post('/api/rental/update', extractedData);
          alert('수정이 완료되었습니다.');
          onSave(extractedData, true);
          onClose();
        } catch (error) {
          console.error('업데이트 중 오류 발생:', error);
          alert('수정 중 오류가 발생했습니다.');
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
        !expiryDate
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

      axios.put(`/api/rental/?detailId=${rentalData.detailId}`, payload)
        .then(response => {
          onSave([payload]);
          alert('항목이 성공적으로 수정되었습니다.');
          onClose();
        })
        .catch(error => {
          console.error('Error sending data:', error);
          if (error.response && error.response.status === 400) {
            alert("계약번호는 중복이 불가합니다");
          } else {
            alert('데이터 수정 중 오류가 발생했습니다.');
          }
        });
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

RentalUpdateModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  rentalData: PropTypes.object,
};

export default RentalUpdateModal;
