import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../components/AuthContext';
import PropTypes from 'prop-types';
import '../../styles/corpdoc/CorpDocStoreModal.css';
import CustomButton from '../../components/common/CustomButton';

const CorpDocStoreModal = ({ show, onClose, onSave, totalCorpseal, totalCoregister }) => {
  const { auth } = useContext(AuthContext);
  const initialFormData = {
    storeDate: '',
    purpose: '법인서류 입고',
    certCorpseal: '',
    totalCorpseal: '',
    certCoregister: '',
    totalCoregister: '',
    userId: '',
    userNm: '',
    instCd: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => { 
    if (show) {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        storeDate: today,
        purpose: '법인서류 입고',
        certCorpseal: '',
        totalCorpseal: totalCorpseal,
        certCoregister: '',
        totalCoregister: totalCoregister,
        userId: auth.userId,
        userNm: auth.hngNm,
        instCd: auth.instCd
      });
    }
  }, [show, auth.userId, auth.hngNm, auth.instCd, totalCorpseal, totalCoregister]);

  useEffect(() => {
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const { storeDate, userId, instCd } = formData;

    /* 입력값 예외처리 : 입고일자, id값, 필수 입력항목 누락 */
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(storeDate)) {
      alert('입고 일자는 yyyy-MM-dd 형식으로 입력해 주세요.');
      return;
    }

    if (!userId || !instCd) {
        alert('사용자 정보 또는 기관 코드가 누락되었습니다.');
        return;
    }

    if (!formData.certCorpseal && formData.certCorpseal !== 0) {
      alert('법인인감 증명서 수량을 입력해 주세요.');
      return;
    }
  
    if (!formData.certCoregister && formData.certCoregister !== 0) {
      alert('법인등기사항전부증명서 수량을 입력해 주세요.');
      return;
    }

    const requestData = {
      ...formData,
      certCorpseal: parseInt(formData.certCorpseal, 10),
      certCoregister: parseInt(formData.certCoregister, 10)
    };

    try {
      const response = await axios.post('/api/corpDoc/store', requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.code === 200) {
        alert('등록이 완료되었습니다.');
        onSave();
        onClose();
      } else {
        alert('등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('문제가 발생했습니다:', error);
      alert('문제가 발생했습니다.');
    }
  };

  if (!show) return null;

  return (
    <div className="corpDoc-store-modal-overlay">
      <div className="corpDoc-store-modal-container">
        <div className="corpDoc-store-modal-header">
          <h3>법인 서류 입고 등록</h3>
          <button className="corpDoc-store-close-button" onClick={onClose}>X</button>
        </div>
        <div className="corpDoc-store-form-group">
          <label>입고 일자</label>
          <input
            type="text"
            name="storeDate"
            value={formData.storeDate}
            onChange={handleChange}
            placeholder='yyyy-MM-dd'
            readOnly
          />
        </div>
        <div className="corpDoc-store-form-group">
          <label>사용 목적</label>
          <input
            type="text"
            name="purpose"
            value={formData.purpose}
            readOnly
          />
        </div>
        <div className="corpDoc-store-form-group">
          <label>법인인감 증명서</label>
          <input
            type="number"
            name="certCorpseal"
            value={formData.certCorpseal}
            onChange={handleChange}
            placeholder='수량 입력'
            min="0"
            required
          />
        </div>
        <div className="corpDoc-store-form-group">
          <label>법인등기사항전부증명서</label>
          <input
            type="number"
            name="certCoregister"
            value={formData.certCoregister}
            onChange={handleChange}
            placeholder='수량 입력'
            min="0"
            required
          />
        </div>
        <div className="corpDoc-store-modal-buttons">
          <CustomButton className="save-button" onClick={handleSave}>
            등 록
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

CorpDocStoreModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default CorpDocStoreModal;
