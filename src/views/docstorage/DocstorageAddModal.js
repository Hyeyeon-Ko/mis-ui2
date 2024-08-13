import React, { useState } from 'react';
import PropTypes from 'prop-types';
import * as XLSX from 'xlsx';
import axios from 'axios';
import '../../styles/DocstorageAddModal.css';

const DocstorageAddModal = ({ show, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('file'); // Default to 'file'
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
    location: '',
    transferDate: '',
    tsdNum: '',
    disposalDate: '',
    dpdNum: '',
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

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

  const validateDateFormat = (dateStr) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  };

  const handleSaveClick = () => {
    if (activeTab === 'file') {
      if (!file) {
        alert('파일을 첨부해주세요.');
        return;
      }

      const payload = {
        documents: processedData,
        teamCd: '020',
      };

      if (payload.documents.length > 0) {
        axios.post('/api/docstorage/upload', payload)
          .then(response => {
            console.log('Data successfully uploaded:', response.data);
            onSave(payload.documents);
            alert('항목이 성공적으로 추가되었습니다!');
            onClose();
          })
          .catch(error => {
            console.error('There was an error uploading the data!', error);
          });
      }
    } else if (activeTab === 'text') {
      const { teamNm, docId, docNm, manager, storageYear, createDate, disposalDate } = formData;

      if (!teamNm || !docId || !docNm || !manager || !storageYear || !createDate || !disposalDate) {
        alert('모든 항목을 입력해 주세요.');
        return;
      }

      if (!validateDateFormat(createDate)) {
        alert('생성일자는 YYYY-MM-DD 형식으로 입력해 주세요.');
        return;
      }

      if (!validateDateFormat(disposalDate)) {
        alert('폐기일자는 YYYY-MM-DD 형식으로 입력해 주세요.');
        return;
      }

      const payload = {
        teamNm,
        docId,
        docNm,
        manager,
        subManager: formData.subManager,
        storageYear,
        createDate,
        location: formData.location,
        transferDate: formData.transferDate,
        tsdNum: formData.tsdNum,
        disposalDate,
        dpdNum: formData.dpdNum,
      };

      axios.post('/api/docstorage/', payload)
        .then(response => {
          console.log('Data successfully uploaded:', response.data);
          onSave([payload]);  // Update parent component with the new data
          alert('항목이 성공적으로 추가되었습니다.');
          onClose();
        })
        .catch(error => {
          console.error('There was an error uploading the data!', error);
        });
    }
  };

  if (!show) return null;

  return (
    <div className="docstorage-modal-overlay">
      <div className="docstorage-modal-container">
        <div className="modal-header">
          <h3>문서보관 항목 추가</h3>
          <button className="docstorage-close-button" onClick={onClose}>X</button>
        </div>
        <p className="docstorage-instructions">
          엑셀 파일 첨부 혹은 직접 입력으로 렌탈제품을 추가하세요.
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
                <input type="file" name="file" accept=".xlsx, .xls" onChange={handleFileChange} />
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="docstorage-add-section">
              <div className="docstorage-add-detail-row">
                <label>팀명</label>
                <input type="text" name="teamNm" value={formData.teamNm} onChange={handleChange} />
              </div>
              <div className="docstorage-add-detail-row">
                <label>문서관리번호</label>
                <input type="text" name="docId" value={formData.docId} onChange={handleChange} />
              </div>
              <div className="docstorage-add-detail-row">
                <label>입고위치</label>
                <input type="text" name="location" value={formData.location} placeholder='사후 입력' onChange={handleChange} disabled />
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
                <input type="text" name="createDate" value={formData.createDate} placeholder='YYYY-MM-DD' onChange={handleChange} />
              </div>
              <div className="docstorage-add-detail-row">
                <label>이관일자</label>
                <input type="text" name="transferDate" value={formData.transferDate} placeholder='사후 입력' onChange={handleChange} disabled />
              </div>
              <div className="docstorage-add-detail-row">
                <label>기안번호</label>
                <input type="text" name="tsdNum" value={formData.tsdNum} placeholder='사후 입력' onChange={handleChange} disabled />
              </div>
              <div className="docstorage-add-detail-row">
                <label>폐기일자</label>
                <input type="text" name="disposalDate" value={formData.disposalDate} placeholder='YYYY-MM-DD' onChange={handleChange} />
              </div>
              <div className="docstorage-add-detail-row">
                <label>기안번호</label>
                <input type="text" name="dpdNum" value={formData.dpdNum} placeholder='사후 입력' onChange={handleChange} disabled />
              </div>
            </div>
          )}
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
