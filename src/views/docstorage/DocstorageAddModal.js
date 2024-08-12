import React, { useState } from 'react';
import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';
import axios from 'axios';
import '../../styles/DocstorageAddModal.css';

const DocstorageAddModal = ({ show, onClose, onSave }) => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    teamNm: '',
    docId: '',
    docNm: '',
    manager: '',
    subManager: '',
    storageYear: '',
    createDate: '',
    disposalDate: '',
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: 4, 
        });

        const parsedData = jsonData.map(row => ({
          draftId: row[0],
          teamNm: row[1],
          docId: row[2],
          location: row[3],
          docNm: row[4],
          manager: row[5],
          subManager: row[6],
          storageYear: row[7],
          creationYear: row[8],
          transferDate: row[9],
          tsdraftNum: row[10],
          disposalDate: row[11],
          dpdraftNum: row[12],
        }));

        const validData = parsedData.filter(item => item.draftId !== undefined);

        if (validData.length === 0) {
          alert("유효한 데이터가 없습니다.");
          return;
        }

        axios.post('http://localhost:9090/api/storage/upload', validData)
          .then(response => {
            console.log("Server Response: ", response.data);
            onSave(validData); 
          })
          .catch(error => {
            console.error('Error uploading data:', error);
          });
      };
      reader.readAsBinaryString(file);
    } else {
      alert("파일을 선택해주세요.");
    }
  };

  if (!show) return null;

  return (
    <div className="docstorage-modal-overlay">
      <div className="docstorage-modal-container">
        <div className="modal-header">
          <h3>문서보관 추가</h3>
          <button className="docstorage-close-button" onClick={onClose}>X</button>
        </div>
        <hr className="modal-title-separator" />
        <div className="docstorage-modal-content">
          <div className="docstorage-add-section">
            <h4>파일 추가</h4>
            <div className="docstorage-add-detail-row">
              <label>파일</label>
              <input type="file" name="file" onChange={handleFileChange} />
            </div>
          </div>
          <hr className="modal-title-separator" />
          <div className="docstorage-add-section">
            <h4>직접 추가</h4>
            <div className="docstorage-add-detail-row">
              <label>팀명</label>
              <input type="text" name="teamNm" value={formData.teamNm} onChange={handleChange} />
            </div>
            <div className="docstorage-add-detail-row">
              <label>문서관리번호</label>
              <input type="text" name="docId" value={formData.docId} onChange={handleChange} />
            </div>
            <div className="docstorage-add-detail-row">
              <label>문서명</label>
              <input type="text" name="docNm" value={formData.docNm} onChange={handleChange} />
            </div>
            <div className="docstorage-add-detail-row">
              <label>관리자(정)</label>
              <input type="text" name="manager" value={formData.manager} onChange={handleChange} />
            </div>
            <div className="docstorage-add-detail-row">
              <label>관리자(부)</label>
              <input type="text" name="subManager" value={formData.subManager} onChange={handleChange} />
            </div>
            <div className="docstorage-add-detail-row">
              <label>보존연한</label>
              <input type="text" name="storageYear" value={formData.storageYear} onChange={handleChange} />
            </div>
            <div className="docstorage-add-detail-row">
              <label>생성일자</label>
              <input type="text" name="createDate" value={formData.createDate} onChange={handleChange} />
            </div>
            <div className="docstorage-add-detail-row">
              <label>폐기일자</label>
              <input type="text" name="disposalDate" value={formData.disposalDate} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="docstorage-modal-buttons">
          <button className="docstorage-modal-button confirm" onClick={handleSave}>추  가</button>
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
