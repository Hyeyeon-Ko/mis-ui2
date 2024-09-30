import React, { useContext } from 'react';
import '../../styles/seal/SealRegistrationAddModal.css';
import axios from 'axios';
import { AuthContext } from '../../components/AuthContext';
import { validateForm } from '../../hooks/validateForm';
import { useSealForm } from '../../hooks/useSealForm';


function SealRegistrationAddModal({ isOpen, onClose, onSave }) {
  const { auth } = useContext(AuthContext);
  const {handleAddModalChange, handleAddModalFileChange, formData} = useSealForm();

  const handleSave = async () => {
    const data = new FormData();
    data.append('sealRegisterRequestDTO', new Blob([JSON.stringify({
      sealNm: formData.seal,
      useDept: formData.department,
      purpose: formData.purpose,
      manager: formData.manager,
      subManager: formData.subManager,
      drafterId: auth.userId,
      draftDate: formData.date,
      instCd: auth.instCd,
    })], { type: 'application/json' }));
    data.append('sealImage', formData.sealImage);

    // SealRegistForm validation
    const requiredInputs = {
      sealNm: formData.seal,
      sealImage: formData.sealImage,
      useDept: formData.department,
      usage: formData.purpose,
      manager: formData.manager,
      subManager: formData.subManager,
      draftDate: formData.date
    }

    const inputDates = {
      draftDate: formData.date
    }

    const { isValid, message } = validateForm('SealRegist', requiredInputs, '', inputDates);
    if (!isValid) {
        alert(message);
        return;
    }
  
    try {
      const response = await axios.post(`/api/seal/register`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (response.status === 200) {
        alert('인장 등록이 완료되었습니다.');
        onSave();
        onClose();
      } else {
        alert('인장 등록 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error during seal registration:', error);
      alert('인장 등록 중 오류가 발생했습니다.');
    }
  };
  
  if (!isOpen) return null;

  const sealRegistFields = [
    {
      label: '인영 종류',
      name: 'seal',
      placeholder: '인영 종류를 입력하세요',
      type: 'text'
    },
    {
      label: '인영 이미지',
      type: 'file',
      onChange: handleAddModalFileChange
    },
    {
      label: '사용부서',
      name: 'department',
      placeholder: '사용부서를 입력하세요',
      type: 'text'
    },
    {
      label: '용도',
      name: 'purpose',
      placeholder: '용도를 입력하세요',
      type: 'text'
    },
    {
      label: '관리자(정)',
      name: 'manager',
      placeholder: '정 관리자의 이름을 입력하세요',
      type: 'text'
    },
    {
      label: '관리자(부)',
      name: 'subManager',
      placeholder: '부 관리자의 이름을 입력하세요',
      type: 'text'
    },
    {
      label: '등록일',
      name: 'date',
      type: 'text'
    }
  ];


  return (
    <div className="seal-regist-overlay">
      <div className="seal-regist-container">
        <div className="seal-regist-header">
          <h3>인장 등록</h3>
          <button className="seal-regist-close-button" onClick={onClose}>X</button>
        </div>
        <div className="seal-regist-content">
          <div className="seal-regist-section">
            {sealRegistFields.map((field, index) => (
              <div className="seal-regist-detail-row" key={index}>
                <label>{field.label}</label>
                {field.type === 'file' ? (
                  <input type={field.type} onChange={field.onChange} />
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleAddModalChange}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="seal-regist-buttons">
          <button
            className="seal-regist-button confirm"
            onClick={handleSave}
          >
            등록
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


export default SealRegistrationAddModal;
