import React, { useState } from 'react';
import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';
import axios from 'axios'; 
import '../../styles/DocstorageAddModal.css';

const DocstorageAddModal = ({ show, onClose, onSave }) => {
  const [file, setFile] = useState(null);
  const [processedData, setProcessedData] = useState([]);
  const [formData, setFormData] = useState({
    teamNm: '',
    docId: '',
    docNm: '',
    manager: '',
    subManager: '',
    storageYear: '',
    createDate: '',
    disposalDate: '',
    transferDate: '',
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
  
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false });
  
      const validData = jsonData.slice(4).filter(row => row[0] !== null && row[0] !== '').map((row, index) => ({
        no: row[0],
        teamNm: row[1],
        docId: row[2],
        location: row[3],
        docNm: row[4],
        manager: row[5],
        subManager: row[6],
        storageYear: row[7],
        createDate: row[8] || null,  
        transferDate: row[9] || null,
        tsdNum: row[10],
        disposalDate: row[11] || null, 
        dpdNum: row[12],
      }));
  
      console.log('Processed Data:', validData);
  
      setProcessedData(validData);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSaveClick = () => {
    const payload = {
        documents: processedData,
        teamCd: '020',  
    };

    if (formData.teamNm && formData.docId) {
        payload.documents.push({
            no: null,
            ...formData,
        });
    }

    if (payload.documents.length > 0) {
        axios.post('/api/storage/upload', payload)
            .then(response => {
                console.log('Data successfully uploaded:', response.data);
                onSave(payload.documents);  
            })
            .catch(error => {
                console.error('There was an error uploading the data!', error);
            });
    }
    onClose();  
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
              <input type="file" name="file" accept=".xlsx, .xls" onChange={handleFileChange} />
            </div>
          </div>
          <hr className="modal-title-separator" />
          <div className="docstorage-add-section">
            <h4>직접 추가</h4>
            <div className="docstorage-add-detail-row">
              <label>팀명</label>
              <input type="text" name="teamNm" onChange={handleChange} value={formData.teamNm} />
            </div>
            <div className="docstorage-add-detail-row">
              <label>문서관리번호</label>
              <input type="text" name="docId" onChange={handleChange} value={formData.docId} />
            </div>
            <div className="docstorage-add-detail-row">
              <label>문서명</label>
              <input type="text" name="docNm" onChange={handleChange} value={formData.docNm} />
            </div>
            <div className="docstorage-add-detail-row">
              <label>관리자(정)</label>
              <input type="text" name="manager" onChange={handleChange} value={formData.manager} />
            </div>
            <div className="docstorage-add-detail-row">
              <label>관리자(부)</label>
              <input type="text" name="subManager" onChange={handleChange} value={formData.subManager} />
            </div>
            <div className="docstorage-add-detail-row">
              <label>보존연한</label>
              <input type="text" name="storageYear" onChange={handleChange} value={formData.storageYear} />
            </div>
            <div className="docstorage-add-detail-row">
              <label>생성일자</label>
              <input type="text" name="createDate" onChange={handleChange} value={formData.createDate} />
            </div>
            <div className="docstorage-add-detail-row">
              <label>폐기일자</label>
              <input type="text" name="disposalDate" onChange={handleChange} value={formData.disposalDate} />
            </div>
            <div className="docstorage-add-detail-row">
              <label>이관일자</label>
              <input type="text" name="transferDate" onChange={handleChange} value={formData.transferDate} />
            </div>
          </div>
        </div>
        <div className="docstorage-modal-buttons">
          <button className="docstorage-modal-button confirm" onClick={handleSaveClick}>추 가</button>
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
