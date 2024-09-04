import React, { useState, useEffect, useContext } from 'react';
import '../../styles/seal/SealRegistrationAddModal.css';
import axios from 'axios';
import { AuthContext } from '../../components/AuthContext';

function SealRegistrationUpdateModal({ isOpen, onClose, onSave, draftId }) {
  const { auth } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    seal: '',
    sealImage: null,
    department: '',
    purpose: '',
    manager: '',
    subManager: '',
    date: '',
  });
  const [isFileDeleted, setIsFileDeleted] = useState(false);

  useEffect(() => {
    if (draftId) {
      fetchSealDetail(draftId);
    }
  }, [draftId]);

  const fetchSealDetail = async (id) => {
    try {
      const response = await axios.get(`/api/seal/register/${id}`);
      if (response.data.code === 200) {
        const data = response.data.data;
        setFormData({
          seal: data.sealNm,
          sealImage: data.sealImage,
          department: data.useDept,
          purpose: data.purpose,
          manager: data.manager,
          subManager: data.subManager,
          date: data.draftDate,
        });
        setIsFileDeleted(false); 
      } else {
        alert('데이터를 불러오는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error fetching seal detail:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      sealImage: e.target.files[0],
    }));
    setIsFileDeleted(false);  
  };

  const handleDeleteFile = () => {
    setFormData((prev) => ({
      ...prev,
      sealImage: null,
    }));
    setIsFileDeleted(true);  
  };

  const handleSave = async () => {
    const data = new FormData();
    data.append('sealUpdateRequestDTO', new Blob([JSON.stringify({
      sealNm: formData.seal,
      useDept: formData.department,
      purpose: formData.purpose,
      manager: formData.manager,
      subManager: formData.subManager,
      drafterId: auth.userId,
      draftDate: formData.date,
      instCd: auth.instCd,
    })], { type: 'application/json' }));
    if (!isFileDeleted && formData.sealImage) {
      data.append('sealImage', formData.sealImage);
    }
    data.append('isFileDeleted', isFileDeleted);

    try {
      const response = await axios.post(`/api/seal/register/update`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: { draftId },
      });

      if (response.status === 200) {
        alert('인장 정보가 수정되었습니다.');
        onSave();  
        onClose();
      } else {
        alert('인장 정보 수정 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error during seal update:', error);
      alert('인장 정보 수정 중 오류가 발생했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="seal-regist-overlay">
      <div className="seal-regist-container">
        <div className="seal-regist-header">
          <h3>인장 정보 수정</h3>
          <button className="seal-regist-close-button" onClick={onClose}>X</button>
        </div>
        <div className="seal-regist-content">
          <div className="seal-regist-section">
            <div className="seal-regist-detail-row">
              <label>인영 종류</label>
              <input
                type="text"
                name="seal"
                value={formData.seal}
                onChange={handleChange}
                placeholder="인영 종류를 입력하세요"
              />
            </div>
            <div className="seal-regist-detail-row">
              <label>인영 이미지</label>
              <input type="file" onChange={handleFileChange} />
              {formData.sealImage && (
                <div>
                  <button onClick={handleDeleteFile}>기존 파일 삭제</button>
                </div>
              )}
            </div>
            <div className="seal-regist-detail-row">
              <label>사용부서</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="사용부서를 입력하세요"
              />
            </div>
            <div className="seal-regist-detail-row">
              <label>용도</label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="용도를 입력하세요"
              />
            </div>
            <div className="seal-regist-detail-row">
              <label>관리자(정)</label>
              <input
                type="text"
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                placeholder="정 관리자의 이름을 입력하세요"
              />
            </div>
            <div className="seal-regist-detail-row">
              <label>관리자(부)</label>
              <input
                type="text"
                name="subManager"
                value={formData.subManager}
                onChange={handleChange}
                placeholder="부 관리자의 이름을 입력하세요"
              />
            </div>
            <div className="seal-regist-detail-row">
              <label>등록일</label>
              <input
                type="text"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <div className="seal-regist-buttons">
          <button
            className="seal-regist-button confirm"
            onClick={handleSave}
          >
            수정
          </button>
          <button
            className="seal-regist-button cancel"
            onClick={onClose}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default SealRegistrationUpdateModal;
